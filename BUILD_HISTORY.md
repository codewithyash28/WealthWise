# WEXA AI — COMPREHENSIVE APPLICATION BUILD HISTORY & ARCHITECTURE MANUAL

> **Hackathon Submission Documentation**  
> **Project Name:** Wexa AI — Autonomous Financial Agent  
> **Target Engine:** Gemini 3 + Multi-Step Autonomous Agent Execution Framework  
> **Primary Stack:** React 19, TypeScript, Vite, Tailwind CSS, Express, MongoDB MCP, Plaid Sandbox, Gemini Vision API  

---

## EXECUTIVE SUMMARY

**Wexa AI** is an autonomous financial agent platform engineered to move beyond text-based financial advice. It actively plans, simulates, and executes multi-step wealth management workflows—including auto-categorization, surplus sweeps, subscription management, portfolio rebalancing, and multimodal receipt audit—while preserving user autonomy through a locked-gate human-in-the-loop approval mechanism and one-tap reversibility.

---

## COMPREHENSIVE FEATURE & MODULE BUILD HISTORY

### 1. Wexa Autonomous Execution Engine (`#wexa-agent`)
- **Multi-Step Agent Planner:** Parses complex goal statements (e.g., *"Rebalance portfolio, sweep safe surplus, and cancel unused subscriptions"*) into structured execution steps.
- **Real-Time Chain-of-Thought Stream:** Displays live internal reasoning steps, tool invocation payloads, and execution logs.
- **Locked-Gate User Approval Modal:** Halts automated execution payloads until explicit user verification is received.
- **One-Tap Execution Undo Engine:** Provides instant reversibility for any executed action with a single tap.
- **Automated Surplus Sweeper & Subscription Shield:** Identifies safe-to-spend surpluses and automatically queues transfers to high-yield savings or pauses unutilized subscriptions.

### 2. Wexa Companion & Multimodal Receipt Vision (`#wexa-companion`)
- **"Can I Afford This?" Conversational Assistant:** Instant single-purchase feasibility evaluator offering clear **YES/NO** guidance and budget impact analysis.
- **Gemini Vision Receipt Parser:** Upload or capture image receipts for instant OCR extraction of merchant name, date, tax, line items, and auto-categorization.
- **Contextual Financial Advisor:** Powered by server-side Gemini 3 API proxy routes with educational safety guardrails.

### 3. Plaid Bank Sync Sandbox & Webhooks (`#bank-sync`)
- **Plaid Account Aggregator Simulator:** Live sandbox connecting checking, savings, investment, and credit accounts.
- **Webhook Event Generator:** Simulates real-time banking webhooks (`TRANSACTIONS.UPDATED`, `HOLD_ADDED`, `SUBSCRIPTION_DETECTED`) to test real-time agent responses.
- **Live Transaction Stream:** Interactive stream with instant manual or AI auto-tagging.

### 4. Financial Literacy Knowledge Vault (`#vault`)
- **Collectible Concept Cards:** Gamified cards explaining financial concepts (Opportunity Cost, Compound Interest, Dollar-Cost Averaging, Amortization) triggered by real-world actions.
- **Interactive Socratic Quiz Engine:** Gamified 250-point quiz testing financial acumen with instant feedback and badge rewards.
- **Visual Glossary & Masterclass Tutorials:** Searchable financial dictionary and step-by-step interactive guides.

### 5. Rent vs Buy Capital Growth Simulator (`#rent-vs-buy`)
- **Dual Capital Progression Model:** Simulates 30-year home equity appreciation vs. renting and investing savings surplus in index funds.
- **Tax Benefit & Maintenance Calculator:** Factors in property taxes, mortgage interest tax deductions, maintenance, HOA fees, and HRA benefits.
- **Interactive Opportunity Cost Sliders:** Instant visual tipping scale showing breakeven years and total net worth trajectories.

### 6. Control Dashboard & Wealth Analytics (`#dashboard`)
- **Financial Health Index (0–100):** Algorithmic scoring based on savings rates, debt-to-income ratios, emergency buffers, and investment diversification.
- **Interactive Budget Laws:** Track 50/30/20 budget allocations with safe-to-spend threshold alerts.
- **Asset Allocation & Rebalancer Matrix:** Visual portfolio drift index with prescribed trade recipes and offline copyable execution scripts.
- **Audit & Export Suite:** One-click PDF Executive Summary generator and JSON export for personal records.

### 7. Infrastructure, Security & Judge UX
- **Startup Logo Reveal:** High-performance <1.5s scale-up and fade-in animation on initial launch.
- **Centered Nav Branding:** Balanced navbar layout featuring prominent central Wexa AI logo.
- **Judge Tour Terminal:** Guided walkthrough for competition evaluation with single-click sample data injection.
- **GitOps Control Center & MongoDB MCP Integration:** Schema definitions and commit tracking for cloud ledger synchronization.
- **Stripe Billing & Tier Sandbox:** Dynamic subscription tier manager for sandbox and premium capabilities.

---

## ARCHITECTURAL PIPELINE

```
[ User Input / Image Receipt / Webhook ]
                  │
                  ▼
   ┌──────────────────────────────┐
   │    Wexa Companion & Agent     │
   │  (Gemini 3 Pro + Vision API) │
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │  Multi-Step Execution Engine │
   │   (Chain-of-Thought Stream)  │
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │ Locked-Gate User Approval    │
   │ (User-in-the-Loop + 1-Tap Undo│
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │  MongoDB MCP Ledger Sync     │
   └──────────────────────────────┘
```
