# 🎓 IIIT Surat Modifications (NUSMods Clone)

Welcome to the official repository for the IIIT Surat MODs! This is an open-source, student-led platform designed to streamline timetables, course syllabi, and academic materials for our college community.

The architecture and database schema follow the official blueprints outlined in our project design documentation.

---

## 📁 Repository Structure

The project is split into two main sections:
- **`client/`** - The React.js frontend application (The Face).
- **`server/`** - The Node.js & Express.js backend API (The Engine).

---

## 🛠️ Tech Stack
- **Frontend:** React.js, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)

---

## 🚀 Getting Started Locally

To run this project on your machine, you will need to open **two separate terminal windows**—one to run the frontend interface and one to run the backend server.

### 1. Frontend Setup (React)
Open your first terminal window and run:
```bash
cd client
npm install
npm run dev
```

### 2. Backend Setup (Express)
Open your second terminal window and run:
```bash
cd server
npm install
npm run dev
```
---

## Environment Variables(.env)
Inside your server folder create a file named ".env" and add the following line:
PORT=5000

Note: when we start using live database addtional secret database keys will be shared with you privately.