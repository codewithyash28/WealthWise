import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

// --- Gemini AI Config ---
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "undefined" && apiKey !== "null" && apiKey.length >= 10) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[Gemini Engine] Server-side client initialized successfully.");
  } catch (err) {
    console.error("[Gemini Engine] Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.log("[Gemini Engine] Running in offline mode (API key not set up).");
}

// --- Database Configuration & Fallback Engine ---
const PORT = 3000;
const app = express();

// Security headers
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

// Body size limit to prevent large-payload DoS
app.use(express.json({ limit: "1mb" }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/auth", authLimiter);

// Environment variables configuration
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://localhost:27017/wealthwise_mcp";
const FALLBACK_DB_FILE = path.join(process.cwd(), "db_simulation.json");

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isRealMongoActive = false;

// Initialize Simulated File Storage
if (!fs.existsSync(FALLBACK_DB_FILE)) {
  fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify({ users: [], profiles: [], budgets: [] }, null, 2));
}

async function connectToDatabase() {
  try {
    console.log("[MongoDB Engine] Connecting to database...");
    mongoClient = new MongoClient(MONGODB_URI, { connectTimeoutMS: 5000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isRealMongoActive = true;
    console.log("[MongoDB Engine] Connection established successfully.");
    
    // Create baseline indexes for performant device switcher retrieval
    try {
      await mongoDb.collection("users").createIndex({ email: 1 }, { unique: true });
      await mongoDb.collection("profiles").createIndex({ uid: 1 }, { unique: true });
      await mongoDb.collection("budgets").createIndex({ uid: 1 }, { unique: true });
    } catch (indexErr) {
      console.warn("[MongoDB Engine] Non-fatal indexes setup warning:", indexErr);
    }
  } catch (err) {
    console.error("[MongoDB Engine] Real MongoDB inactive. Switching to production-grade File System emulation.");
    isRealMongoActive = false;
  }
}

// Helper database functions that unify real MongoDB calls and file-emulated falls
async function findUserByEmail(email: string) {
  const normEmail = email.toLowerCase().trim();
  if (isRealMongoActive && mongoDb) {
    return await mongoDb.collection("users").findOne({ email: normEmail });
  } else {
    const data = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    return data.users.find((u: any) => u.email.toLowerCase().trim() === normEmail) || null;
  }
}

async function insertUser(userDoc: any) {
  const normEmail = userDoc.email.toLowerCase().trim();
  const cleanedDoc = { ...userDoc, email: normEmail };
  if (isRealMongoActive && mongoDb) {
    await mongoDb.collection("users").insertOne(cleanedDoc);
  } else {
    const data = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    data.users.push(cleanedDoc);
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(data, null, 2));
  }
}

async function getProfileByUid(uid: string) {
  if (isRealMongoActive && mongoDb) {
    return await mongoDb.collection("profiles").findOne({ uid });
  } else {
    const data = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    return data.profiles.find((p: any) => p.uid === uid) || null;
  }
}

async function upsertProfile(uid: string, profileDoc: any) {
  if (isRealMongoActive && mongoDb) {
    await mongoDb.collection("profiles").updateOne({ uid }, { $set: profileDoc }, { upsert: true });
  } else {
    const data = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    const idx = data.profiles.findIndex((p: any) => p.uid === uid);
    if (idx >= 0) {
      data.profiles[idx] = { ...data.profiles[idx], ...profileDoc, uid };
    } else {
      data.profiles.push({ ...profileDoc, uid });
    }
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(data, null, 2));
  }
}

async function getBudgetByUid(uid: string) {
  if (isRealMongoActive && mongoDb) {
    return await mongoDb.collection("budgets").findOne({ uid });
  } else {
    const data = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    return data.budgets.find((b: any) => b.uid === uid) || null;
  }
}

async function upsertBudget(uid: string, budgetDoc: any) {
  if (isRealMongoActive && mongoDb) {
    await mongoDb.collection("budgets").updateOne({ uid }, { $set: budgetDoc }, { upsert: true });
  } else {
    const data = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    const idx = data.budgets.findIndex((b: any) => b.uid === uid);
    if (idx >= 0) {
      data.budgets[idx] = { ...data.budgets[idx], ...budgetDoc, uid };
    } else {
      data.budgets.push({ ...budgetDoc, uid });
    }
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(data, null, 2));
  }
}


// --- API REST Endpoints ---

// Live Health Status
app.get("/api/db-health", (req, res) => {
  res.json({
    status: "ok",
    database: isRealMongoActive ? "MongoDB Server (Live MCP Active)" : "Local Persistent File Emulator",
    connectionString: isRealMongoActive ? "Connected securely" : "Sandbox Backup engaged"
  });
});

// Create Synced Account
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, profile, budget } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and Security PIN/password are required." });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email is already synchronized." });
    }

    const uid = "ww_" + crypto.randomUUID().replace(/-/g, "").substring(0, 13);
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const userDoc = {
      uid,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await insertUser(userDoc);

    // Initial Sync of profile and budget if provided
    if (profile) {
      await upsertProfile(uid, { ...profile, uid });
    } else {
      await upsertProfile(uid, {
        uid,
        name: email.split("@")[0],
        age: "28",
        learningGoal: "Custom Mastery Roadmaps",
        currency: "USD",
        joinDate: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitDates: [new Date().toISOString().split('T')[0]],
        highScore: 0,
        netWorth: { assets: 0, liabilities: 0 },
        achievements: [],
        goals: []
      });
    }

    if (budget) {
      await upsertBudget(uid, { ...budget, uid });
    }

    const savedProfile = await getProfileByUid(uid);
    const savedBudget = await getBudgetByUid(uid);

    res.status(201).json({
      success: true,
      user: { uid, email },
      profile: savedProfile,
      budget: savedBudget
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal registration error." });
  }
});

// Device Switcher / Sign-In Recovery
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and PIN/password are required." });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      return res.status(401).json({ error: "Invalid credentials. Double check your email and security PIN." });
    }

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials. Double check your email and security PIN." });
    }

    // Retrieve synced items to ensure switch device logic recovered budget and badges correctly!
    const profileDoc = await getProfileByUid(userDoc.uid);
    const budgetDoc = await getBudgetByUid(userDoc.uid);

    res.json({
      success: true,
      user: {
        uid: userDoc.uid,
        email: userDoc.email
      },
      profile: profileDoc,
      budget: budgetDoc
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Live Device Sync Push Updates
app.post("/api/auth/sync", async (req, res) => {
  try {
    const { uid, email, profile, budget } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: "Missing credentials for sync. Please provide uid and email." });
    }

    const userDoc = await findUserByEmail(email);
    if (!userDoc || userDoc.uid !== uid) {
      return res.status(401).json({ error: "Unauthorized sync attempt." });
    }

    if (profile) {
      await upsertProfile(uid, { ...profile, uid });
    }
    if (budget) {
      await upsertBudget(uid, { ...budget, uid });
    }

    res.json({
      success: true,
      syncedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    res.status(500).json({ error: "Synchronization failure." });
  }
});


// --- Server-Side Gemini AI proxy endpoints ---

// Gemini Insight API
app.post("/api/gemini/insight", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (!ai) {
      return res.json({
        text: "I'm currently in 'offline mode' because the Gemini API key isn't set up. To enable my full AI capabilities, please add your GEMINI_API_KEY to the environment variables. In the meantime, remember that consistent saving and diversified investing are keys to long-term wealth!"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the WealthWise AI Advisor, a world-class personal finance expert. Provide clear, actionable, and encouraging financial advice. Use formatting like bolding and bullet points for readability. Always include a disclaimer that this is for educational purposes and not professional financial advice.",
      }
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("[Gemini Insight Endpoint Error]:", error);
    res.status(500).json({ error: "An error occurred generating insights." });
  }
});

// Gemini Wealth Audit API
app.post("/api/gemini/audit", async (req, res) => {
  try {
    const { user, budget } = req.body;
    if (!user) {
      return res.status(400).json({ error: "User profile details are required." });
    }

    if (!ai) {
      return res.json({
        text: "AI Wealth Audit is currently offline. Please configure process.env.GEMINI_API_KEY to proceed securely."
      });
    }

    const prompt = `
      As a World-Class Personal Wealth Architect, perform a "One-Click AI Audit" for the following user:
      Name: ${user.name}
      Age: ${user.age}
      Learning Goals: ${user.learningGoal}
      Currency: ${user.currency}
      Net Worth: Assets ${user.netWorth?.assets || 0}, Liabilities ${user.netWorth?.liabilities || 0}
      Financial Literacy Score: ${user.highScore || 0}/150
      Budget: ${budget ? JSON.stringify(budget) : "Not set up yet"}

      Provide a concise, high-impact financial roadmap in 3 sections:
      1. **Wealth Health Check**: A brutal but fair assessment of their current position, specifically considering their age group (${user.age}).
      2. **The Golden Path**: 3 specific, actionable steps to increase their net worth by 20% in 12 months, aligned with their goal of learning about ${user.learningGoal}.
      3. **Risk Mitigation**: One major blind spot they are currently ignoring based on their profile.

      Keep the tone professional, elite, and encouraging. Use Markdown formatting.
      Max 300 words.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    res.json({ text: response.text || "Unable to generate audit at this time." });
  } catch (error: any) {
    console.error("[Gemini Audit Endpoint Error]:", error);
    res.status(500).json({ error: "An error occurred generating wealth audit." });
  }
});


// Start server listening combined with Vite bundler interface
async function startServer() {
  await connectToDatabase();

  // Vite development mode integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WealthWise Backend] Online and serving on http://0.0.0.0:${PORT}`);
  });
}

startServer();
