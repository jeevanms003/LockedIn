# LockedIn 🔒

LockedIn is an AI-powered technical and behavioral interview preparation platform designed to help developers ace their tech job interviews. The application integrates real-time AI feedback, a coding sandbox editor, automated evaluation dashboards, and a live simulated mock interview experience.

---

## 🌟 Key Features

*   **🔒 Cloud-Synced Authentication:** Custom authentication context using JWT cookies and secure user profiles synced with MongoDB.
*   **💻 Code Editor & Critique Sandbox:** A split-pane code editor supporting multiple programming languages (JavaScript, Python, C++, Java). Users receive Time & Space complexity analysis (Big-O notation) and code cleanliness tips powered by **Gemini AI**.
*   **🤖 AI Mock Interviewer:** Simulate technical, behavioral (HR), or system design interview loops. Features a simulated webcam feed and microphone widget. Concludes with comprehensive feedback scorecards (0-100).
*   **📊 Performance Dashboard:** Track progress over time, visualize DSA metrics, review detailed reports of past interviews, and load saved coding solutions.
*   **⚡ Placement Tutor:** A personalized study plan scheduler to map progress towards target tech companies.
*   **🎨 Premium Aesthetics:** Responsive design system styled with custom HSL dark palettes, glassmorphism components, and fluid animations.

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), React Router v7, TailwindCSS / Custom Vanilla CSS, Framer Motion (animations), Lucide / Heroicons.
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

```
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
