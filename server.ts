import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// MongoDB Connection setup
let mongoServer: MongoMemoryServer | null = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && uri !== "undefined" && uri.length > 10) {
    console.log("Connecting to production MongoDB Atlas...");
    try {
      await mongoose.connect(uri);
      console.log("Connected successfully to MongoDB Atlas.");
    } catch (err) {
      console.error("MongoDB Atlas connection failed. Falling back to local memory server...", err);
      await startMemoryServer();
    }
  } else {
    console.log("No MONGODB_URI found. Initializing in-memory MongoDB server for testing...");
    await startMemoryServer();
  }
}

async function startMemoryServer() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("Connected successfully to self-contained In-Memory MongoDB Server.");
    console.log("Connection URI:", uri);
  } catch (err) {
    console.error("Failed to start in-memory MongoDB server:", err);
    process.exit(1);
  }
}

// ================= SCHEMA DEFINITIONS =================

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  picture: { type: String, default: "" },
  currency: { type: String, default: "USD" },
  age: { type: String, default: "" },
  learningGoal: { type: String, default: "" },
  highScore: { type: Number, default: 0 },
  netWorth: {
    assets: { type: Number, default: 0 },
    liabilities: { type: Number, default: 0 }
  },
  achievements: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    unlockedAt: String
  }],
  joinDate: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

const BudgetSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  income: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  needs: [{ category: String, amount: Number }],
  wants: [{ category: String, amount: Number }],
  updatedAt: { type: Date, default: Date.now }
});

const Budget = mongoose.model("Budget", BudgetSchema);

const TransactionSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  type: { type: String, enum: ["income", "expense", "asset", "liability"], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

// ================= API ENDPOINTS =================

// Google Sign-In verification & Upsert
app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Missing credential token" });
  }

  try {
    // Standard decoding of ID Token (JWT) from Google Identity Services
    const decoded = jwt.decode(credential) as any;

    if (!decoded || !decoded.email) {
      return res.status(400).json({ error: "Invalid Google credential token" });
    }

    const { sub: googleId, email, name, picture } = decoded;
    
    // We map googleId as our UID
    let user = await User.findOne({ uid: googleId });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        uid: googleId,
        email,
        name,
        picture,
        joinDate: new Date()
      });
      await user.save();
      console.log(`Created new user in MongoDB: ${name} (${email})`);
    } else {
      user.lastVisit = new Date();
      if (picture && user.picture !== picture) user.picture = picture;
      await user.save();
      console.log(`Logged in existing user from MongoDB: ${name} (${email})`);
    }

    // Load budget
    const budget = await Budget.findOne({ uid: googleId });

    res.json({
      success: true,
      isNewUser,
      user: {
        uid: user.uid,
        displayName: user.name,
        email: user.email,
        photoURL: user.picture
      },
      profile: user,
      budget: budget || null
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Get User Profile
app.get("/api/profile/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const budget = await Budget.findOne({ uid: req.params.uid });
    res.json({ profile: user, budget });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Sync / Update User Profile
app.put("/api/profile/:uid", async (req, res) => {
  try {
    const { name, age, learningGoal, currency, highScore, netWorth, achievements } = req.body;
    
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (learningGoal !== undefined) user.learningGoal = learningGoal;
    if (currency !== undefined) user.currency = currency;
    if (highScore !== undefined) user.highScore = highScore;
    if (netWorth !== undefined) user.netWorth = netWorth;
    if (achievements !== undefined) user.achievements = achievements;

    user.lastVisit = new Date();
    await user.save();
    
    res.json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get Budget
app.get("/api/budget/:uid", async (req, res) => {
  try {
    const budget = await Budget.findOne({ uid: req.params.uid });
    res.json(budget || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

// Save Budget
app.post("/api/budget/:uid", async (req, res) => {
  try {
    const { income, savings, needs, wants } = req.body;
    let budget = await Budget.findOne({ uid: req.params.uid });

    if (!budget) {
      budget = new Budget({ uid: req.params.uid });
    }

    budget.income = income ?? 0;
    budget.savings = savings ?? 0;
    budget.needs = needs ?? [];
    budget.wants = wants ?? [];
    budget.updatedAt = new Date();

    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: "Failed to save budget" });
  }
});

// Get Transactions
app.get("/api/transactions/:uid", async (req, res) => {
  try {
    const transactions = await Transaction.find({ uid: req.params.uid }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Create Transaction & Adjust Net Worth
app.post("/api/transactions/:uid", async (req, res) => {
  try {
    const { type, category, amount, description } = req.body;
    
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const tx = new Transaction({
      uid: req.params.uid,
      type,
      category,
      amount,
      description,
      date: new Date()
    });
    await tx.save();

    // Dynamically adjust user's assets or liabilities in MongoDB based on transaction type!
    if (type === "asset") {
      user.netWorth.assets += Number(amount);
    } else if (type === "liability") {
      user.netWorth.liabilities += Number(amount);
    }
    
    await user.save();

    res.json({ success: true, transaction: tx, netWorth: user.netWorth });
  } catch (error) {
    res.status(500).json({ error: "Failed to record transaction" });
  }
});

// ================= AI AGENT (GEMINI TOOL CALLING) BACKEND API =================
// This enables the front-end Gemini library to delegate real database interactions to MongoDB.
app.post("/api/ai/tool-call", async (req, res) => {
  const { uid, toolName, arguments: args } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "User UID is required for financial operations" });
  }

  try {
    console.log(`Executing AI agent tool call [${toolName}] for user ${uid}`);
    
    if (toolName === "getUserFinancialState") {
      const user = await User.findOne({ uid });
      const budget = await Budget.findOne({ uid });
      const transactions = await Transaction.find({ uid }).sort({ date: -1 }).limit(10);

      if (!user) {
        return res.json({ error: "User profile not found in MongoDB." });
      }

      return res.json({
        profile: {
          name: user.name,
          age: user.age,
          learningGoal: user.learningGoal,
          currency: user.currency,
          highScore: user.highScore,
          netWorth: user.netWorth,
          achievements: user.achievements
        },
        budget: budget || null,
        recentTransactions: transactions
      });
    }

    if (toolName === "recordTransaction") {
      const user = await User.findOne({ uid });
      if (!user) return res.status(404).json({ error: "User profile not found" });

      const { type, category, amount, description } = args;
      const tx = new Transaction({
        uid,
        type,
        category,
        amount: Number(amount),
        description: description || "",
        date: new Date()
      });
      await tx.save();

      // Recalculate net worth based on assets/liabilities
      if (type === "asset") {
        user.netWorth.assets += Number(amount);
      } else if (type === "liability") {
        user.netWorth.liabilities += Number(amount);
      }
      await user.save();

      return res.json({
        success: true,
        message: `Successfully logged ${type} of ${user.currency} ${amount} under '${category}' category in MongoDB.`,
        netWorth: user.netWorth,
        newTransaction: tx
      });
    }

    if (toolName === "updateBudget") {
      const { income, savings, needs, wants } = args;
      let budget = await Budget.findOne({ uid });

      if (!budget) {
        budget = new Budget({ uid });
      }

      if (income !== undefined) budget.income = Number(income);
      if (savings !== undefined) budget.savings = Number(savings);
      if (needs !== undefined) budget.needs = needs;
      if (wants !== undefined) budget.wants = wants;
      budget.updatedAt = new Date();

      await budget.save();
      return res.json({
        success: true,
        message: "Successfully updated your budget plan in MongoDB.",
        budget
      });
    }

    if (toolName === "updateFinancialGoals") {
      const user = await User.findOne({ uid });
      if (!user) return res.status(404).json({ error: "User not found" });

      const { learningGoal } = args;
      if (learningGoal !== undefined) {
        user.learningGoal = learningGoal;
        await user.save();
      }

      return res.json({
        success: true,
        message: "Successfully updated financial learning goals in MongoDB.",
        learningGoal: user.learningGoal
      });
    }

    res.status(400).json({ error: `Unknown tool name: ${toolName}` });
  } catch (error: any) {
    console.error("AI Tool-call execution error:", error);
    res.status(500).json({ error: error.message || "Failed to execute AI tool call" });
  }
});

// Start Server and connect to DB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 WealthWise Elite Server is running on port ${PORT}`);
    console.log(`📊 API Proxy target: http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
});
