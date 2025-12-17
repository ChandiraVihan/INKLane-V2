# 🚀 INKLane V2 - Smart Learning Tracker

| MongoDB | Express | React | Node | Vercel |
| :---: | :---: | :---: | :---: | :---: |
| ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) | ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) | ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) |)


![Project Banner](https://i.postimg.cc/Kj3GBHrk/INK-home.png)


## 🌟 Introduction
INKLane V2 is a full-stack **MERN** application designed to help users track their learning progress and manage tasks. It features secure authentication, real-time database updates, and an **AI-powered assistant** to help answer questions based on conversation history.

🔗 **Live Demo:** [https://ink-lane-v2.vercel.app](https://ink-lane-v2.vercel.app)

## ✨ Key Features
* **🔐 Secure Auth:** User registration and login using JWT & Bcrypt.
* **🤖 AI Assistant:** Integrated with Groq API (Llama-3 model) for intelligent chat.
* **📝 Todo Management:** Create, pin, prioritize, and delete tasks.
* **📊 Progress Tracking:** Visual tracking of learning milestones.
* **📱 Responsive Design:** Built with React & Vite for a fast, mobile-friendly UI.

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Axios, React Router
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **AI Engine:** Groq API (Llama-3.3)
* **Deployment:** Vercel

## 📸 Screenshots
| Login Page | Dashboard |
| :---: | :---: |
| ![Login](https://i.postimg.cc/SKwkqrph/INK-login.png) | ![Dashboard](https://i.postimg.cc/kGTHMJtN/INK-dash.png) |

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone [https://github.com/ChandiraVihan/INKLane-V2.git](https://github.com/ChandiraVihan/INKLane-V2.git)
cd INKLane-V2 
```

### 2. Install Dependencies
You need to install packages for both the frontend (root) and backend.
```bash

# Install root dependencies
npm install

# Install backend dependencies (if separate folder)
cd api
npm install
```

### 3. Configure Environment Variables
Create a .env file in the root directory and add:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
VITE_API_URL=http://localhost:3001
```

### 4. Run the App

```bash
# Run Backend
node api/index.js

# Run Frontend (in a new terminal)
npm run dev
```

### 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

### 📄 License
This project is licensed under the MIT License.

