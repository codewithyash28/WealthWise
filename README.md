# 🛡️ Wexa AI — Autonomous Financial Intelligence Engine

> *Next-generation personal finance intelligence, real-time macro stress-testing, and vision-driven expense tracking.*

[![Deployment](https://img.shields.io/badge/Deployment-Google_Cloud_Run-4285F4?style=flat-square&logo=googlecloud)](https://cloud.google.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_3_Vision-8E75B5?style=flat-square&logo=googlegemini)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Gross Margin](https://img.shields.io/badge/Gross_Margin-98.6%25-brightgreen?style=flat-square)](#)

---

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

```text
┌─────────────────────────────────────────────────────────┐
│                 Client Frontend (React)                 │
│                 Tailwind CSS / D3.js                    │
└────────────────────────────┬────────────────────────────┘
                             │
                        HTTPS / REST
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Google Cloud Run (Node)                   │
│              App Gateway / API Router                   │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  Gemini 3 Vision API    │     │  MongoDB Persistence    │
│  - Receipt OCR Engine   │     │  - User Profiles (MCP)  │
│  - Structured Parsing   │     │  - Audit Logs & States  │
└─────────────────────────┘     └─────────────────────────┘
