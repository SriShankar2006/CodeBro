# 💻 CodeBro — Master DSA. Level Up. Get Hired.

# Live Link - https://code-bro-mauve.vercel.app 

A next-level competitive coding + e-learning platform inspired by LeetCode, HackerRank, and CodeChef.

**Auth:** Firebase Authentication  
**Database & Storage:** Supabase  
**Code Execution:** Judge0 (via RapidAPI)

---

## 📁 Project Structure

```
codebro/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top nav — no contest tab, CodeBro branding
│   │   └── UI.jsx              # All reusable components (Button, Card, Modal, VideoPlayer, Heatmap...)
│   ├── context/
│   │   └── useStore.js         # Zustand global store — auth, XP, streak, notifications
│   ├── data/
│   │   ├── problems.js         # 118 problems across all topics + full details for key problems
│   │   └── courses.js          # 6 courses with real YouTube video lessons + quiz bank + roadmap
│   ├── pages/
│   │   ├── AuthPage.jsx        # Firebase login / register / forgot password
│   │   ├── Dashboard.jsx       # Fresh for new users — real Supabase heatmap
│   │   ├── Problems.jsx        # 118 problems — filter by topic, difficulty, company
│   │   ├── Editor.jsx          # Monaco editor + Judge0 + saves to Supabase
│   │   ├── Courses.jsx         # Courses list + course detail with real YouTube players
│   │   ├── Quiz.jsx            # Timed quiz — saves results to Supabase
│   │   ├── Leaderboard.jsx     # Live from Supabase users table
│   │   ├── Forum.jsx           # Full CRUD via Supabase — posts, voting
│   │   ├── Profile.jsx         # Real data — heatmap, submissions, avatar upload to Supabase Storage
│   │   ├── Roadmap.jsx         # DSA roadmap + Submissions page + Settings page
│   │   └── Admin.jsx           # Admin panel with platform analytics
│   ├── services/
│   │   ├── firebase.js         # Firebase Auth only
│   │   ├── supabase.js         # All DB + Storage operations + SQL setup comments
│   │   └── judge0.js           # Code execution via Judge0 API
│   ├── styles/
│   │   └── globals.css         # Full design system — dark theme, all components
│   ├── App.jsx                 # Routes + auth guards + layout
│   └── index.js               # React entry point
├── .env.example               # Environment variable template
└── package.json
```

---

## ⚡ Quick Setup (5 Steps)

### Step 1 — Extract & Install
```bash
cd codebro
npm install --legacy-peer-deps
```

### Step 2 — Firebase (Auth)
1. Go to https://console.firebase.google.com → Create project
2. Enable **Authentication** → Email/Password + Google
3. Get your web app config from Project Settings

### Step 3 — Supabase (Database + Storage)
1. Go to https://supabase.com → Create project
2. Go to **SQL Editor** → Run the SQL from the comment block at the bottom of `src/services/supabase.js`
3. Go to **Settings → API** → copy your URL and anon key

### Step 4 — Create .env file
```bash
cp .env.example .env
```
Fill in:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...

REACT_APP_JUDGE0_KEY=your_rapidapi_key   # optional — demo mode works without it
```

### Step 5 — Run
```bash
npm start
```
Open http://localhost:3000 🚀

---

## 🎯 Key Features

| Feature | Details |
|---|---|
| **Auth** | Firebase Email/Password + Google OAuth |
| **Database** | Supabase (PostgreSQL) — users, submissions, progress, forum |
| **Storage** | Supabase Storage — avatar uploads |
| **Code Editor** | Monaco Editor (VS Code in browser) |
| **Code Execution** | Judge0 CE API — Python, C++, Java, JS, C, Go, Rust |
| **118 Problems** | Arrays, Strings, Trees, Graphs, DP, Backtracking, Heap, Binary Search + more |
| **6 Courses** | Real YouTube video players embedded inline |
| **Activity Calendar** | 100% real data from Supabase submissions |
| **Fresh New Users** | Zero progress, zero XP, zero streak — all earned in real-time |
| **Gamification** | XP, levels, streaks, badges — all saved to Supabase |
| **Leaderboard** | Live from Supabase users table ordered by XP |
| **Forum** | Full CRUD — create posts, vote, view answers |
| **Responsive** | Mobile-friendly design |
| **Dark Mode** | Full dark theme with toggle |

---

## 🗄️ Supabase SQL Setup

Copy and run the SQL from the comment at the bottom of `src/services/supabase.js` in your Supabase SQL editor. It creates:

- `users` — profiles, XP, level, streak, solved problems, badges
- `submissions` — every code submission with verdict, runtime, memory
- `course_progress` — per-user course completion (fresh = 0 for new users)
- `quiz_results` — quiz scores and XP earned
- `forum_posts` — discussion threads with votes
- `forum_answers` — answers to forum posts
- Row Level Security policies
- Storage bucket for avatars

---

## 🚀 Deploy

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Firebase Hosting
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting  # select build/ folder, SPA: yes
firebase deploy
```

---

## 🔑 Judge0 Setup (Real Code Execution)
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Subscribe (free tier: 100 requests/day)
3. Copy your API key to `.env` as `REACT_APP_JUDGE0_KEY`

Without the key, the editor runs in **demo mode** — it simulates "Accepted" responses so you can test the UI.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Framer Motion |
| State | Zustand (with localStorage persist) |
| Auth | Firebase Authentication |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Code Editor | Monaco Editor |
| Code Execution | Judge0 CE API |
| Styling | Custom CSS Variables + Design System |
| Toasts | react-hot-toast |
| Markdown | react-markdown |
