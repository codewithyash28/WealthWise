import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const app = express();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "1047114487770-testclientid.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "undefined" && apiKey !== "null" && apiKey.length >= 10) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("[Gemini Engine] Server-side client initialized successfully.");
  } catch (err) {
    console.error("[Gemini Engine] Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.log("[Gemini Engine] Running in offline mode (API key not set up).");
}

if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});
app.use("/api/auth", authLimiter);

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://localhost:27017/wealthwise_mcp";
const FALLBACK_DB_FILE = path.join(process.cwd(), "db_simulation.json");

type CollectionName = "users" | "profiles" | "budgets" | "transactions";
type FallbackDb = Record<CollectionName, any[]>;

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isRealMongoActive = false;

function ensureFallbackDb() {
  if (!fs.existsSync(FALLBACK_DB_FILE)) {
    const emptyDb: FallbackDb = { users: [], profiles: [], budgets: [], transactions: [] };
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(emptyDb, null, 2));
    return;
  }

  const data = readFallbackDb();
  let changed = false;
  for (const collection of ["users", "profiles", "budgets", "transactions"] as CollectionName[]) {
    if (!Array.isArray(data[collection])) {
      data[collection] = [];
      changed = true;
    }
  }
  if (changed) {
    writeFallbackDb(data);
  }
}

function readFallbackDb(): FallbackDb {
  try {
    const parsed = JSON.parse(fs.readFileSync(FALLBACK_DB_FILE, "utf-8"));
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    };
  } catch {
    return { users: [], profiles: [], budgets: [], transactions: [] };
  }
}

function writeFallbackDb(data: FallbackDb) {
  fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(data, null, 2));
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function sanitizeUser(userDoc: any) {
  if (!userDoc) return null;
  return {
    uid: userDoc.uid,
    email: userDoc.email || null,
    displayName: userDoc.displayName || userDoc.name || userDoc.email?.split("@")[0] || null,
    photoURL: userDoc.photoURL || userDoc.picture || null,
  };
}

function defaultProfile(uid: string, overrides: Partial<any> = {}) {
  const now = new Date().toISOString();
  return {
    name: overrides.name || overrides.displayName || "Wealth Architect",
    age: overrides.age || "",
    learningGoal: overrides.learningGoal || "",
    currency: overrides.currency || "USD",
    joinDate: overrides.joinDate || now,
    lastVisit: now,
    visitDates: Array.isArray(overrides.visitDates) ? overrides.visitDates : [now.split("T")[0]],
    highScore: Number(overrides.highScore || 0),
    netWorth: overrides.netWorth || { assets: 0, liabilities: 0 },
    achievements: Array.isArray(overrides.achievements) ? overrides.achievements : [],
    goals: Array.isArray(overrides.goals) ? overrides.goals : [],
    portfolio: overrides.portfolio,
    gitProvider: overrides.gitProvider || "github",
    ...overrides,
    uid,
  };
}

async function connectToDatabase() {
  ensureFallbackDb();
  try {
    console.log("[MongoDB Engine] Connecting to database...");
    mongoClient = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isRealMongoActive = true;
    console.log("[MongoDB Engine] Connection established successfully.");

    try {
      await mongoDb.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true });
      await mongoDb.collection("users").createIndex({ googleId: 1 }, { unique: true, sparse: true });
      await mongoDb.collection("users").createIndex({ uid: 1 }, { unique: true });
      await mongoDb.collection("profiles").createIndex({ uid: 1 }, { unique: true });
      await mongoDb.collection("budgets").createIndex({ uid: 1 }, { unique: true });
      await mongoDb.collection("transactions").createIndex({ uid: 1, date: -1 });
    } catch (indexErr) {
      console.warn("[MongoDB Engine] Non-fatal indexes setup warning:", indexErr);
    }
  } catch (err) {
    console.error("[MongoDB Engine] Real MongoDB inactive. Switching to local file persistence.");
    isRealMongoActive = false;
  }
}

async function findOne(collection: CollectionName, predicate: Record<string, any>) {
  if (isRealMongoActive && mongoDb) {
    return await mongoDb.collection(collection).findOne(predicate);
  }

  const data = readFallbackDb();
  return data[collection].find((item) =>
    Object.entries(predicate).every(([key, value]) => item[key] === value)
  ) || null;
}

async function insertOne(collection: CollectionName, doc: any) {
  if (isRealMongoActive && mongoDb) {
    await mongoDb.collection(collection).insertOne(doc);
    return;
  }

  const data = readFallbackDb();
  data[collection].push(doc);
  writeFallbackDb(data);
}

async function upsertByUid(collection: "profiles" | "budgets", uid: string, doc: any) {
  const cleanDoc = { ...doc, uid };
  if (isRealMongoActive && mongoDb) {
    await mongoDb.collection(collection).updateOne({ uid }, { $set: cleanDoc }, { upsert: true });
    return;
  }

  const data = readFallbackDb();
  const idx = data[collection].findIndex((item) => item.uid === uid);
  if (idx >= 0) {
    data[collection][idx] = { ...data[collection][idx], ...cleanDoc };
  } else {
    data[collection].push(cleanDoc);
  }
  writeFallbackDb(data);
}

async function updateUserByUid(uid: string, update: any) {
  if (isRealMongoActive && mongoDb) {
    await mongoDb.collection("users").updateOne({ uid }, { $set: update }, { upsert: true });
    return;
  }

  const data = readFallbackDb();
  const idx = data.users.findIndex((item) => item.uid === uid);
  if (idx >= 0) {
    data.users[idx] = { ...data.users[idx], ...update, uid };
  } else {
    data.users.push({ ...update, uid });
  }
  writeFallbackDb(data);
}

async function getTransactionsByUid(uid: string, limit = 0) {
  if (isRealMongoActive && mongoDb) {
    const cursor = mongoDb.collection("transactions").find({ uid }).sort({ date: -1 });
    return limit > 0 ? await cursor.limit(limit).toArray() : await cursor.toArray();
  }

  const data = readFallbackDb();
  const records = data.transactions
    .filter((item) => item.uid === uid)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return limit > 0 ? records.slice(0, limit) : records;
}

async function recordTransaction(uid: string, payload: any) {
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Transaction amount must be a positive number.");
  }

  const type = payload.type;
  if (!["income", "expense", "asset", "liability"].includes(type)) {
    throw new Error("Transaction type must be income, expense, asset, or liability.");
  }

  const tx = {
    id: crypto.randomUUID(),
    uid,
    type,
    category: String(payload.category || "Uncategorized"),
    amount,
    description: String(payload.description || ""),
    date: new Date().toISOString(),
  };

  await insertOne("transactions", tx);

  const profile = await findOne("profiles", { uid });
  if (profile && (type === "asset" || type === "liability")) {
    const netWorth = {
      assets: Number(profile.netWorth?.assets || 0),
      liabilities: Number(profile.netWorth?.liabilities || 0),
    };
    if (type === "asset") netWorth.assets += amount;
    if (type === "liability") netWorth.liabilities += amount;
    await upsertByUid("profiles", uid, { ...profile, netWorth, lastVisit: new Date().toISOString() });
  }

  return tx;
}

async function getFinancialState(uid: string) {
  const profile = await findOne("profiles", { uid });
  const budget = await findOne("budgets", { uid });
  const transactions = await getTransactionsByUid(uid, 10);
  return { profile, budget, recentTransactions: transactions };
}

app.get("/api/db-health", (req, res) => {
  res.json({
    status: "ok",
    database: isRealMongoActive ? "MongoDB Server (Live MCP Active)" : "Local Persistent File Emulator",
    connectionString: isRealMongoActive ? "Connected securely" : "Sandbox Backup engaged",
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, profile, budget } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and Security PIN/password are required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await findOne("users", { email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email is already synchronized." });
    }

    const uid = "ww_" + crypto.randomUUID().replace(/-/g, "").substring(0, 13);
    const hashedPassword = await bcrypt.hash(password, 12);
    const userDoc = {
      uid,
      email: normalizedEmail,
      password: hashedPassword,
      displayName: profile?.name || normalizedEmail.split("@")[0],
      photoURL: null,
      provider: "password",
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };

    await insertOne("users", userDoc);
    await upsertByUid("profiles", uid, profile ? defaultProfile(uid, profile) : defaultProfile(uid, { name: userDoc.displayName }));
    if (budget) {
      await upsertByUid("budgets", uid, { ...budget, updatedAt: new Date().toISOString() });
    }

    res.status(201).json({
      success: true,
      user: sanitizeUser(userDoc),
      profile: await findOne("profiles", { uid }),
      budget: await findOne("budgets", { uid }),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal registration error." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and PIN/password are required." });
    }

    const userDoc = await findOne("users", { email: normalizeEmail(email) });
    if (!userDoc || !userDoc.password) {
      return res.status(401).json({ error: "Invalid credentials. Double check your email and security PIN." });
    }

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials. Double check your email and security PIN." });
    }

    await updateUserByUid(userDoc.uid, { lastVisit: new Date().toISOString() });

    res.json({
      success: true,
      user: sanitizeUser(userDoc),
      profile: await findOne("profiles", { uid: userDoc.uid }),
      budget: await findOne("budgets", { uid: userDoc.uid }),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential token." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      return res.status(400).json({ error: "Invalid Google credential payload." });
    }

    const email = normalizeEmail(payload.email);
    const existingByGoogle = await findOne("users", { googleId: payload.sub });
    const existingByEmail = await findOne("users", { email });
    const existingUser = existingByGoogle || existingByEmail;
    const uid = existingUser?.uid || `google_${payload.sub}`;
    const now = new Date().toISOString();

    const userDoc = {
      ...(existingUser || {}),
      uid,
      googleId: payload.sub,
      email,
      displayName: payload.name || existingUser?.displayName || email.split("@")[0],
      photoURL: payload.picture || existingUser?.photoURL || null,
      provider: existingUser?.provider === "password" ? "password+google" : "google",
      createdAt: existingUser?.createdAt || now,
      lastVisit: now,
    };

    await updateUserByUid(uid, userDoc);

    let profile = await findOne("profiles", { uid });
    const isNewUser = !profile;
    if (!profile) {
      profile = defaultProfile(uid, {
        name: userDoc.displayName,
        currency: "USD",
        achievements: [],
        goals: [],
      });
      await upsertByUid("profiles", uid, profile);
    } else {
      await upsertByUid("profiles", uid, { ...profile, lastVisit: now });
      profile = await findOne("profiles", { uid });
    }

    res.json({
      success: true,
      isNewUser,
      user: sanitizeUser(userDoc),
      profile,
      budget: await findOne("budgets", { uid }),
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ error: "Google authentication failed. Verify GOOGLE_CLIENT_ID and try again." });
  }
});

app.post("/api/auth/sync", async (req, res) => {
  try {
    const { uid, email, profile, budget } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "Missing uid for sync." });
    }

    const userDoc = await findOne("users", { uid });
    if (!userDoc) {
      return res.status(401).json({ error: "Unauthorized sync attempt." });
    }
    if (email && userDoc.email && normalizeEmail(email) !== userDoc.email) {
      return res.status(401).json({ error: "Unauthorized sync email mismatch." });
    }

    if (profile) {
      await upsertByUid("profiles", uid, { ...profile, uid, lastVisit: new Date().toISOString() });
    }
    if (budget) {
      await upsertByUid("budgets", uid, { ...budget, uid, updatedAt: new Date().toISOString() });
    }

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ error: "Synchronization failure." });
  }
});

app.get("/api/profile/:uid", async (req, res) => {
  try {
    const profile = await findOne("profiles", { uid: req.params.uid });
    if (!profile) return res.status(404).json({ error: "User profile not found." });
    res.json({ profile, budget: await findOne("budgets", { uid: req.params.uid }) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

app.put("/api/profile/:uid", async (req, res) => {
  try {
    const existingProfile = await findOne("profiles", { uid: req.params.uid });
    if (!existingProfile) return res.status(404).json({ error: "User profile not found." });

    const updatedProfile = { ...existingProfile, ...req.body, uid: req.params.uid, lastVisit: new Date().toISOString() };
    await upsertByUid("profiles", req.params.uid, updatedProfile);
    res.json({ success: true, profile: await findOne("profiles", { uid: req.params.uid }) });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

app.get("/api/budget/:uid", async (req, res) => {
  try {
    res.json(await findOne("budgets", { uid: req.params.uid }) || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget." });
  }
});

app.post("/api/budget/:uid", async (req, res) => {
  try {
    const budget = { ...req.body, uid: req.params.uid, updatedAt: new Date().toISOString() };
    await upsertByUid("budgets", req.params.uid, budget);
    res.json(await findOne("budgets", { uid: req.params.uid }));
  } catch (error) {
    res.status(500).json({ error: "Failed to save budget." });
  }
});

app.get("/api/transactions/:uid", async (req, res) => {
  try {
    res.json(await getTransactionsByUid(req.params.uid));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

app.post("/api/transactions/:uid", async (req, res) => {
  try {
    const transaction = await recordTransaction(req.params.uid, req.body);
    const profile = await findOne("profiles", { uid: req.params.uid });
    res.json({ success: true, transaction, netWorth: profile?.netWorth });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to record transaction." });
  }
});

app.post("/api/ai/tool-call", async (req, res) => {
  const { uid, toolName, arguments: args = {} } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "User UID is required for financial operations." });
  }

  try {
    if (toolName === "getUserFinancialState") {
      return res.json(await getFinancialState(uid));
    }

    if (toolName === "recordTransaction") {
      const transaction = await recordTransaction(uid, args);
      return res.json({
        success: true,
        message: `Logged ${transaction.type} transaction for ${transaction.amount}.`,
        transaction,
        state: await getFinancialState(uid),
      });
    }

    if (toolName === "updateBudget") {
      const budget = { ...args, uid, updatedAt: new Date().toISOString() };
      await upsertByUid("budgets", uid, budget);
      return res.json({ success: true, message: "Budget updated in MongoDB.", budget: await findOne("budgets", { uid }) });
    }

    if (toolName === "updateFinancialGoals") {
      const profile = await findOne("profiles", { uid });
      if (!profile) return res.status(404).json({ error: "User profile not found." });
      const updates: any = { ...profile };
      if (args.learningGoal !== undefined) updates.learningGoal = String(args.learningGoal);
      if (Array.isArray(args.goals)) updates.goals = args.goals;
      await upsertByUid("profiles", uid, updates);
      return res.json({ success: true, message: "Financial goals updated.", profile: await findOne("profiles", { uid }) });
    }

    res.status(400).json({ error: `Unknown tool name: ${toolName}` });
  } catch (error: any) {
    console.error("AI Tool-call execution error:", error);
    res.status(500).json({ error: error.message || "Failed to execute AI tool call." });
  }
});

app.post("/api/gemini/insight", async (req, res) => {
  try {
    const { prompt, history = [], uid } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (!ai) {
      return res.json({
        text: "I'm currently in offline mode because the Gemini API key isn't set up. You can still use the local simulations and MongoDB-backed storage.",
      });
    }

    const state = uid ? await getFinancialState(uid) : null;
    const stateContext = state ? `\n\nCurrent MongoDB-backed user state:\n${JSON.stringify(state).slice(0, 8000)}` : "";
    const contents = [
      ...history,
      { role: "user", parts: [{ text: `${prompt}${stateContext}` }] },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        systemInstruction: "You are the WealthWise AI Advisor, a world-class personal finance expert. Use the provided MongoDB-backed state when available. Provide clear, actionable, encouraging advice. Always include a short educational disclaimer that this is not professional financial advice.",
      },
    });

    res.json({ text: result.text || "" });
  } catch (error) {
    console.error("[Gemini Insight Endpoint Error]:", error);
    res.status(500).json({ error: "An error occurred generating insights." });
  }
});

app.post("/api/gemini/audit", async (req, res) => {
  try {
    const { user, budget, uid } = req.body;
    if (!user) {
      return res.status(400).json({ error: "User profile details are required." });
    }

    if (!ai) {
      return res.json({
        text: "AI Wealth Audit is currently offline. Please configure GEMINI_API_KEY to proceed securely.",
      });
    }

    const state = uid ? await getFinancialState(uid) : { profile: user, budget, recentTransactions: [] };
    const prompt = `
      As a World-Class Personal Wealth Architect, perform a "One-Click AI Audit" for this MongoDB-backed user state:
      ${JSON.stringify(state).slice(0, 8000)}

      Provide a concise, high-impact financial roadmap in 3 sections:
      1. **Wealth Health Check**: A fair assessment of their current position.
      2. **The Golden Path**: 3 specific, actionable steps to increase net worth over the next 12 months.
      3. **Risk Mitigation**: One major blind spot based on profile, budget, portfolio, goals, and recent transactions.

      Keep the tone professional, elite, and encouraging. Use Markdown formatting. Max 300 words.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    res.json({ text: result.text || "Unable to generate audit at this time." });
  } catch (error) {
    console.error("[Gemini Audit Endpoint Error]:", error);
    res.status(500).json({ error: "An error occurred generating wealth audit." });
  }
});

app.post("/api/gemini/image-analysis", async (req, res) => {
  try {
    const { base64Image, prompt } = req.body;
    if (!base64Image || !prompt) {
      return res.status(400).json({ error: "Image data and prompt are required." });
    }
    if (!ai) {
      return res.json({ text: "AI image analysis is currently unavailable. Please check your API configuration." });
    }
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt },
        ],
      },
    });
    res.json({ text: result.text || "" });
  } catch (error) {
    console.error("[Gemini Image Endpoint Error]:", error);
    res.status(500).json({ error: "An error occurred analyzing the image." });
  }
});

app.post("/api/gemini/fast", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
    if (!ai) return res.json({ text: "Fast AI response is currently unavailable." });
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    res.json({ text: result.text || "" });
  } catch (error) {
    console.error("[Gemini Fast Endpoint Error]:", error);
    res.status(500).json({ error: "An error occurred generating a fast response." });
  }
});

async function startServer() {
  await connectToDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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
