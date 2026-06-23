# LockedIn 🔒🤖

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

LockedIn is an AI-powered technical and behavioral interview preparation platform designed to help developers ace their engineering job interviews. The application integrates real-time AI feedback, a multi-language coding sandbox editor, automated evaluation dashboards, and a live simulated mock interview loop.

---

## 📖 Table of Contents

- [🌟 Key Features](#-key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Getting Started](#-getting-started)
- [📂 Project Architecture](#-project-architecture)
- [🔒 Authentication & Security](#-authentication--security)
- [📊 Performance Dashboard](#-performance-dashboard)

---

## 🌟 Key Features

*   **🔒 Cloud-Synced Authentication:** Custom authentication context using secure HTTP-only JWT cookies and user profiles synced with MongoDB.
*   **💻 Code Editor & Critique Sandbox:** A split-pane code editor supporting multiple programming languages (JavaScript, Python, C++, Java). Users receive Time & Space complexity analysis (Big-O notation) and code cleanliness tips powered by **Gemini AI**.
*   **🤖 AI Mock Interviewer:** Simulate technical, behavioral (HR), or system design interview loops. Features a simulated webcam feed and microphone widget. Concludes with comprehensive feedback scorecards (0-100).
*   **📊 Performance Dashboard:** Track progress over time, visualize Data Structures and Algorithms (DSA) metrics, review detailed reports of past interviews, and load saved coding solutions.
*   **⚡ Placement Tutor:** A personalized study plan scheduler to map progress towards target tech companies.
*   **🎨 Premium Aesthetics:** Responsive design system styled with custom HSL dark palettes, glassmorphism components, and fluid animations.

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), React Router v7, TailwindCSS, custom vanilla CSS, Framer Motion (animations), Lucide / Heroicons.
*   **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), BcryptJS.
*   **Database:** MongoDB, Mongoose ODM.
*   **Artificial Intelligence:** Google Gemini Pro / Gemini Flash 1.5 API proxy.

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.0.0 or higher)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port 27017 or connection URI)
*   A Google AI Studio [Gemini API Key](https://aistudio.google.com/)

---

### Setup Instructions

#### 1. Clone the repository
```bash
git clone https://github.com/jeevanms003/LockedIn.git
cd LockedIn
```

#### 2. Configure Environment Variables
Navigate to the `server` directory and create a `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/lockedin
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
```

#### 3. Install & Start Backend Server
```bash
cd server
npm install
node server.js
```
The backend server will run on [http://localhost:3001](http://localhost:3001).

#### 4. Install & Start Frontend Client
Navigate back to the project root and start the development server:
```bash
cd ..
npm install
npm run dev
```
The frontend client will run on [http://localhost:5173](http://localhost:5173).

---

## 📂 Project Architecture

```text
LockedIn/
├── server/                   # Express.js Backend
│   ├── middleware/           # Auth verification middleware
│   ├── models/               # MongoDB Schemas (User, Progress)
│   ├── routes/               # API endpoints (Auth, Progress, Interview AI)
│   ├── server.js             # Main server entrypoint
│   └── package.json
│
├── src/                      # React Client
│   ├── components/           # Reusable UI Blocks (ProblemCard, Navbar)
│   ├── features/             # Business Logic & Context Hooks
│   │   ├── auth/             # AuthContext state
│   │   ├── practice/         # DSA Problems metadata
│   │   └── progress/         # Local & Cloud Progress sync hook
│   ├── pages/                # Views (Dashboard, MockInterview, SolvePage, etc.)
│   ├── routes/               # Client routing mappings
│   ├── App.jsx               # Client shell entrypoint
│   └── main.jsx
│
├── index.html
└── package.json
```

---

## 🔒 Authentication & Security

The platform uses custom secure middleware routing for protected sections:
- **Salted Hashing:** User passwords are encrypted on register and login using `BcryptJS`.
- **JWT Middleware:** Protects API endpoints against unauthorized actions.
- **Client Session Persistence:** Synchronized states between React contexts and cookies.

---

## 📊 Performance Dashboard

The frontend maps comprehensive user telemetry:
- **DSA Metrics:** Tracks problem stats categorized by difficulty (Easy, Medium, Hard).
- **History Viewer:** Replay answers, view previously generated Gemini suggestions, and track interview performance scores.
- **Custom Timelines:** Chronological listings of finished interview runs and complexity metrics.
