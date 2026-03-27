# WealthWise

WealthWise is a **Global Financial Intelligence Platform** designed to empower users with advanced budgeting tools, investment insights, and comprehensive financial literacy resources. Built with a focus on precision, security, and user experience, WealthWise leverages modern web technologies to provide a seamless financial management journey.

---

## 🚀 Features

- **Global Budgeting**: Track expenses and manage budgets across multiple currencies with ease.
- **Investment Intelligence**: Gain deep insights into market trends and investment opportunities.
- **Financial Literacy**: Access a curated library of resources to improve your financial knowledge.
- **AI-Powered Insights**: Leverage Google's Gemini AI for personalized financial advice and analysis.
- **Real-time Data Visualization**: Interactive charts and dashboards powered by Chart.js for clear financial tracking.
- **Secure Authentication**: Robust user authentication and data management via Firebase.
- **Modern UI/UX**: A responsive, high-performance interface built with React 19 and Tailwind CSS 4.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Backend/Database**: [Firebase](https://firebase.google.com/)
- **AI Integration**: [Google Gemini API (@google/genai)](https://ai.google.dev/)
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd wealthwise
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   # Add other necessary environment variables
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

When deploying to platforms like **Vercel** or **Netlify**, please ensure the following:

1.  **Environment Variables**:
    *   Set `GEMINI_API_KEY` in your platform's environment variable settings.
    *   Ensure all Firebase configuration values from `firebase-applet-config.json` are available.

2.  **Firebase Configuration**:
    *   The project imports `firebase-applet-config.json` directly. If you are using a CI/CD pipeline, make sure this file is present in the build environment or provide the values as environment variables and update `src/lib/firebase.ts` to use them.

3.  **Routing**:
    *   This app uses **Hash-based routing** (`#home`, `#dashboard`), which is highly compatible with static hosting.
    *   We have included `vercel.json` and `_redirects` files to handle any potential SPA routing issues automatically.

4.  **Blank Page Issues**:
    *   If you see a blank page, check the **Browser Console (F12)** for errors.
    *   Common causes include missing API keys or failed Firebase initialization.

---

## 🏗️ Project Structure

```text
├── src/
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions and shared logic
│   ├── services/        # API and Firebase service integrations
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles and Tailwind configuration
├── public/              # Static assets
├── metadata.json        # Application metadata
└── package.json         # Project dependencies and scripts
```

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any suggestions or improvements.

---

Developed with ❤️ by the WealthWise Team.
