# 🌐 SocialSphere — Real-Time Encrypted Chat Made Simple 💬🔒

Welcome to **SocialSphere** — a sleek, secure, and scalable real-time chat platform designed to keep conversations **flowing**, **safe**, and **always-on**.

🔗 **Live App**: [https://socialsphere-frontend-wt53.onrender.com](https://socialsphere-frontend-wt53.onrender.com)

---

## ⚡ What Makes SocialSphere Special?

> Built with a **cutting-edge PERN-inspired stack** (React + Node + Express + PostgreSQL) and powered by **WebSockets** for real-time communication!

### 💬 Instant Messaging
- Real-time messaging powered by **WebSockets**
- Smooth, blazing-fast chat updates with no refresh

### 🔐 Encrypted Conversations
- Messages are **securely encrypted** before storage
- Ensures **confidentiality** and **integrity** of your data

### 🔒 Seamless Authentication
- JWT-based login keeps users logged in effortlessly
- No repeated logins = better UX and session persistence

### 💻 Tech-First Design
- Clean, intuitive React UI powered by **Tailwind CSS**
- Optimized for speed, responsiveness, and modern feel

---

## 🛠️ Tech Stack

| Layer        | Tech Used                          |
|-------------|------------------------------------|
| **Frontend** | React.js + Tailwind CSS            |
| **Backend**  | Node.js + Express.js               |
| **Database** | PostgreSQL                         |
| **Auth**     | JWT (JSON Web Tokens)              |
| **Realtime** | WebSockets (Socket.IO / ws)        |
| **Deployment** | Render.com (Frontend + Backend) |

---

## 🚀 Quick Start (For Developers)

```bash
# Clone the repository
git clone https://github.com/your-username/socialsphere.git
cd socialsphere

# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install

# Set up .env files in both frontend and backend directories

# Start development servers
cd ../client && npm run dev
cd ../server && node server.js
