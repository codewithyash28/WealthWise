<div align="center">

# 🛡️ Wexa AI — Autonomous Financial Intelligence Engine

**Next-generation personal finance intelligence, real-time macro stress-testing, and vision-driven expense tracking.**

[![Deployment](https://img.shields.io/badge/Google_Cloud_Run-Deployed-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![AI Engine](https://img.shields.io/badge/Gemini_3_Vision-Enabled-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Database](https://img.shields.io/badge/MongoDB-MCP_Persistence-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gross Margin](https://img.shields.io/badge/Gross_Margin-98.6%25-00C853?style=for-the-badge)](https://github.com/)

[Live Demo](https://wexa.ai) • [Pitch Deck](https://wexa.ai/deck) • [Report Bug](https://github.com/wexa-ai/wexa/issues)

---

</div>

## 📌 Executive Summary

Traditional personal finance tools force users to act like manual data-entry clerks or rely on static spreadsheets that fail when real-world markets fluctuate.

**Wexa AI** transforms wealth management from passive bookkeeping into **autonomous financial intelligence**. Powered by Google Gemini 3 Vision, MongoDB MCP, and interactive simulation engines, Wexa AI provides real-time portfolio stress-testing, vision-based expense extraction, and background anomaly detection—delivering an institutional-grade financial terminal directly to retail investors.

---

## ⚡ Key Modules

* 🧾 **Gemini 3 Vision Receipt Parsing:** Instant optical breakdown of physical invoices and receipts into structured line items, itemized tax, and expense buckets in under 2 seconds.
* 📈 **MacroPulse Stress-Testing:** Real-time simulation engine to stress-test personal portfolios against inflation spikes, rate hikes, and macro volatility.
* 📊 **TrendMarket Signals:** Interactive market movement visualization and asset performance tracker built on dynamic D3.js chart components.
* 🏠 **LiveOrLease Engine:** Real-time real estate calculator evaluating equity growth versus long-term opportunity cost of renting.
* 🌙 **24/7 Midnight Auditor:** Autonomous background service scanning transaction streams and portfolio states for subscription leaks, rate drift, and hidden fee anomalies.
* 🛡️ **Platform Transparency Hub:** Open operational metric tracking, showing real-time unit economics, API latency, and model accuracy logs.

---

## 🏗️ System Architecture

Wexa AI is built on a high-throughput, microservice-ready serverless architecture hosted on **Google Cloud Run** with persistent state synchronization handled via **MongoDB**.

                       ┌───────────────────────────────┐
                       │      Client Frontend (React)   │
                       │     Tailwind CSS / D3.js      │
                       └──────────────┬────────────────┘
                                      │
                               HTTPS / REST
                                      │
                                      ▼
                       ┌───────────────────────────────┐
                       │    Google Cloud Run (Node)    │
                       │   App Gateway / API Router    │
                       └──────┬───────────────┬────────┘
                              │               │
    ┌─────────────────────────┘               └─────────────────────────┐
    ▼                                                                   ▼
┌─────────────────────────┐                               ┌─────────────────────────┐│ Gemini 3 Vision API     │                               │  MongoDB Persistence    ││ - Receipt OCR Engine    │                               │  - User Profiles (MCP)  ││ - Structured Parsing    │                               │  - Audit Logs & States  │└─────────────────────────┘                               └─────────────────────────┘
---

## 🔄 Receipt Processing Sequence

User App                    Cloud Run Gateway               Gemini 3 Vision API             MongoDB Atlas│                               │                               │                              ││─── 1. Upload Image (Base64) ─>│                               │                              ││                               │─── 2. Multimodal Payload ────>│                              ││                               │    (Strict JSON Schema)       │                              ││                               │                               │                              ││                               │<── 3. Structured JSON ────────│                              ││                               │    (Merchant, Tax, Total)     │                              ││                               │                                                              ││                               │─── 4. Persist Parsed Document ──────────────────────────────>││                               │                                                              ││<── 5. Render Expense Analytics│                                                              │
---

## 🔌 API Documentation

### 1. Vision Receipt Parsing Engine

Parses a physical receipt or invoice image using Gemini 3 Vision into structured JSON format.

```http
POST /api/v1/receipts/parse
Content-Type: application/json
Request PayloadJSON{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "currency_preference": "USD",
  "auto_categorize": true
}
Response (200 OK)JSON{
  "status": "success",
  "data": {
    "receipt_id": "rcpt_9921a8f",
    "merchant": {
      "name": "Target Stores",
      "category": "Retail & Groceries"
    },
    "totals": {
      "subtotal": 42.50,
      "tax": 3.61,
      "grand_total": 46.11,
      "currency": "USD"
    },
    "line_items": [
      {
        "item": "Organic Whole Milk 1Gal",
        "qty": 1,
        "price": 4.99
      },
      {
        "item": "Wireless Ergonomic Mouse",
        "qty": 1,
        "price": 37.51
      }
    ],
    "timestamp": "2026-08-02T16:52:23Z"
  }
}
2. MacroPulse Simulation EngineCalculates portfolio drift and survivability based on custom inflation and interest rate shock variables.HTTPPOST /api/v1/simulate/macropulse
Content-Type: application/json
Request PayloadJSON{
  "portfolio_value": 150000,
  "monthly_contribution": 2000,
  "time_horizon_years": 10,
  "macro_variables": {
    "inflation_rate": 0.045,
    "interest_rate_shift": 0.012,
    "asset_allocation": {
      "equities": 0.70,
      "fixed_income": 0.20,
      "cash": 0.10
    }
  }
}
Response (200 OK)JSON{
  "status": "success",
  "simulation": {
    "projected_nominal_value": 348210.45,
    "projected_real_value": 261150.12,
    "purchasing_power_loss": 87060.33,
    "stress_score": "Moderate Risk",
    "recommended_rebalance": {
      "equities": 0.65,
      "inflation_protected_securities": 0.15,
      "cash": 0.20
    }
  }
}
💼 Unit Economics & Commercial ValidationWexa AI is built on a high-margin freemium unit model designed for rapid monetization:MetricValueNotesGross Margin98.6%Optimized serverless architecture on Google Cloud RunTarget Pro Pricing$9/mo ($5/mo annual)Unlocks unlimited vision scans & PDF exportsAvg. API Cost / Active User$0.12/moIncludes Gemini 3 Vision API overheadPilot Conversion Rate14.2%Validated across 416 organic pilot beta usersProjected Pilot ARR$17,280Based on current conversion trajectories🚀 Quickstart & Local InstallationPrerequisitesNode.js: v20.x or higherMongoDB: Local or Atlas connection stringGoogle Gemini API Key: Get KeySetup InstructionsClone the repository:Bashgit clone [https://github.com/wexa-ai/wexa.git](https://github.com/wexa-ai/wexa.git)
cd wexa
Install dependencies:Bashnpm install
Configure Environment Variables:Create a .env.local file in the root directory:Code snippetPORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
Launch Development Server:Bashnpm run dev
Navigate to http://localhost:3000 to view the application terminal.🗺️ Product Roadmap[x] Phase 1: Core Engine MVP (Gemini 3 Vision OCR, MacroPulse Stress-Testing, Cloud Run Deployment)[ ] Phase 2: Persistent Cloud Auth & Localization (Google OAuth Session Sync, IRS & Indian Income Tax Slabs)[ ] Phase 3: Live Brokerage Execution (Plaid & Alpaca API integration for automated trade execution)
