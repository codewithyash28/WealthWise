#   __      __             _     _   _____  
#   \ \    / /            | |   | | |  __ \ 
#    \ \  / /  ___  _   __| | __| | | |__) |
#     \ \/ /  / _ \| | |  | |/ _` | |  ___/ 
#      \  /  |  __/| |_|  | | (_| | | |     
#       \/    \___| \__,_|_|\__,_| |_|     
#
#   W E X A   A I   --   A U T O N O M O U S   F I N A N C I A L   A G E N T   E N G I N E

> **"Traditional personal finance applications are static, passive spreadsheets requiring tedious manual entry. Wexa AI is an autonomous, agentic financial engine that actively perceives, reasons, simulates, and executes money decisions in production."**

---

## 🌌 Executive Summary & System Vision

**Wexa AI** is an enterprise-grade autonomous financial agent platform and spatial 3D wealth intelligence matrix built on Google DeepMind's **Gemini 3.6 Flash** and the `@google/genai` TypeScript SDK. 

Designed for high-net-worth individuals, modern family offices, and developers, Wexa shifts personal financial management from manual ledger entry to **autonomous agent execution**. Wexa continuously audits budget health, ingests receipt scans via multimodal computer vision, projects 3D WebGL physical wealth trajectories, computes multi-jurisdictional progressive tax liabilities, and executes pre-approved wealth rebalancing workflows with strict user-in-the-loop security gates.

---

## ⚡ Key Features

### 1. 👁️ Autonomous Multimodal Receipt Vision Agent
*   **Instant Structural Parsing**: Ingests receipt photos and invoice documents directly via Gemini 3.6 Flash computer vision.
*   **Automatic Line-Item Extraction**: Automatically parses merchant name, total transaction value, date, line items, and expense categories.
*   **Agentic Action Execution**: Creates immediate, undoable financial ledger actions with automated category assignment and confidence scoring.

### 2. 🧠 Socratic AI Financial Advisor & Reasoning Telemetry
*   **Context-Aware Financial Audit**: Evaluates overall net worth health, debt-to-income ratios, liquidity cushions, and portfolio risk.
*   **GitOps Agent Log Stream**: Displays real-time operational chain-of-thought logs, tool invocation calls, and latency telemetry directly in the UI (`GitOpsControlCenter`).
*   **Socratic Dialogue Engine**: Provides tailored financial advice and risk simulations without issuing speculative single-stock recommendations.

### 3. 🛡️ Locked-Gate User Approval Engine (Human-in-the-Loop)
*   **Pre-Commit Authorization**: Prevents unverified database mutations or financial updates by triggering interactive modal confirmation triggers (`trigger_user_approval_modal`).
*   **MongoDB MCP Persistence**: Executes database transactions only when explicitly authorized by the user, binding seamlessly with `user_profiles`, `financial_ledgers`, and `portfolio_snapshots` collections.

### 4. 🌐 Spatial 3D WebGL Wealth Projection Viewport
*   **Three.js Physics Engine**: Built with `@react-three/fiber` and `@react-three/drei` featuring reflective mirror floors, soft directional lighting, and interactive orbit controls.
*   **3D Wealth Growth Columns**: Staggered glowing WebGL geometry representing monthly compounding capital accumulation across 30-year horizons.
*   **Inflation Purchasing Power Decay**: Interactive visual comparison of real vs. nominal asset values degraded by real-world inflation rates.
*   **3D Loan Amortization Mesh**: Dynamic dual-segmented geometric cylinders illustrating principal vs. interest payment evolution over time.

### 5. 🏛️ Multi-Jurisdiction Progressive Tax Engine
*   **Global Tax Schedules**: Complete progressive tax calculation algorithms for the **United States**, **India (New vs. Old Regimes)**, **United Kingdom**, and **Germany**.
*   **Detailed Deductions Breakdown**: Calculates marginal vs. effective tax rates, standard deductions, and net post-tax disposable income.

### 6. 📉 Debt Payoff Acceleration Engine
*   **Avalanche vs. Snowball Modeling**: Simulates high-interest-first (Avalanche) versus lowest-balance-first (Snowball) debt elimination strategies.
*   **Payoff Timeline Comparison**: Computes exact interest saved, total payoff months, and debt clearance milestones.

### 7. 🌐 Real-Time Macro Pulse & Google Search Grounding
*   **Live Economic Signals**: Utilizes Gemini's `googleSearch` tool grounding to parse live macroeconomic news, Fed/ECB rate decisions, inflation reports, and central bank shifts.
*   **Market Volatility Stress Testing**: Models portfolio performance under extreme economic scenarios (e.g., hyperinflation spikes, liquidity crises, market crashes).

### 8. 🔐 Enterprise Authentication & Monetization Infrastructure
*   **Clerk Authentication**: Unified desktop and mobile authentication with custom dark/shadcn theme integration (`@clerk/ui`).
*   **Stripe Subscription Billing**: Production-grade Stripe Checkout integration for the $19.99/mo "Socratic Live Plan" with automated sandbox fallback mode.

---

## 🚀 Getting Started

Follow these steps to run Wexa AI in your environment:

### Prerequisites
*   **Node.js**: `v18.x` or higher
*   **npm**: `v9.x` or higher
*   **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Installation
Clone the repository and install dependencies:
```bash
# Clone repository
git clone https://github.com/your-org/wexa-ai.git
cd wexa-ai

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root based on `.env.example`:
```env
# Gemini API Key (Server-Side Only - Required for Agent AI capabilities)
GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Authentication (Client-Side - Required for Auth flows)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Stripe Secret Key (Server-Side - Optional, fallback to Sandbox Mode if omitted)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# MongoDB Connection URI (Server-Side - Optional for persistent ledger storage)
MONGODB_URI=mongodb://localhost:27017/wexa_db
```

### 3. Run Development Server
Start the Express server with Vite middleware integration:
```bash
# Validate TypeScript codebase
npm run lint

# Launch dev server on http://localhost:3000
npm run dev
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Runtime & Language** | Node.js, Express, TypeScript |
| **Frontend Framework** | React 18, Vite |
| **Styling & Motion** | Tailwind CSS, Lucide Icons, Framer Motion (`motion/react`) |
| **3D Engine** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **AI Engine** | `@google/genai` SDK (Gemini 3.6 Flash) with Google Search Grounding |
| **Authentication** | Clerk (`@clerk/clerk-react`, `@clerk/ui` with shadcn theme) |
| **Payment Gateway** | Stripe SDK & Stripe Checkout |
| **Data Persistence** | MongoDB MCP / Express Unified Gateway |
| **Data Visualization** | Recharts, Custom D3 SVG components |

---

## 📂 Repository Layout

```
/
├── server.ts                       # Express backend server (Gemini 3.6 Flash, Vision AI, Stripe API)
├── README.md                       # High-impact system documentation
├── package.json                    # Dependencies & scripts
├── metadata.json                   # Application metadata & capabilities
├── src/
│   ├── App.tsx                     # Main application view manager & state engine
│   ├── main.tsx                    # React entrypoint with MasterClerkProvider
│   ├── index.css                   # Global styles & Tailwind imports
│   ├── lib/
│   │   ├── clerk.tsx               # Clerk auth adapter with shadcn theme
│   │   └── utils.ts                # Class name merging helpers
│   └── components/
│       ├── AssetRebalancer.tsx     # Portfolio rebalancing matrix
│       ├── AuditReport.tsx         # AI Net Worth & Wealth Health Score
│       ├── BudgetPlanner.tsx       # Safe-to-spend budget calculator
│       ├── Dashboard.tsx           # Primary executive overview & agent logs
│       ├── DebtPayoff.tsx          # Avalanche vs. Snowball debt accelerator
│       ├── FinancialQuiz.tsx       # Gamified FinIQ literacy levels & XP rewards
│       ├── InvestmentSimulator.tsx # Goal projections & 3D WebGL viewport
│       ├── LiveOrLease.tsx         # Real estate Buy vs. Rent capital modeler
│       ├── Navbar.tsx              # Responsive top navigation & user controls
│       ├── Simulation3DScene.tsx   # Three.js 3D WebGL physical graphics engine
│       ├── TaxEstimator.tsx        # Multi-jurisdiction progressive tax engine
│       ├── WexaCompanion.tsx       # Socratic AI financial advisor chat
│       ├── WexaExecutionPanel.tsx  # Autonomous agent execution & receipt vision engine
│       └── mastery/
│           ├── MacroPulse.tsx      # Real-time economic news & central bank signals
│           └── TrendMarket.tsx     # Market heatmaps & stress test simulator
```

---

## 🔒 Financial Security & Compliance

Wexa AI is built as an interactive financial decision support platform and autonomous simulation sandbox. Projections, calculations, and agent execution plans are provided for educational and wealth management workflow efficiency. The platform strictly enforces user approval gates before committing financial transactions.

---

Designed and engineered by **Wexa AI Team**. Powered by **Gemini 3.6 Flash** on **Google AI Studio / Cloud Run**.
