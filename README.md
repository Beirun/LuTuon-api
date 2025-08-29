# 🔧 LuTuon API: REST API for the Filipino Cooking Simulator Companion Site

<p align="center">
  <img src="https://imgur.com/SWnJgun.png" alt="LuTuon Logo" width="500"/>
</p>

<div align="center">
   <img src="https://img.shields.io/badge/Framework-Express.js-000000?logo=express&logoColor=white" />
   &nbsp; &nbsp;
   <img src="https://img.shields.io/badge/Platform-API-green" />
   &nbsp; &nbsp;
   <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white" />
   &nbsp; &nbsp;
   <img src="https://img.shields.io/badge/License-MIT-blue.svg" />
   &nbsp; &nbsp;
   <img src="https://img.shields.io/badge/Status-In_Development-orange" />
   &nbsp; &nbsp;
   <img src="https://img.shields.io/badge/Contributors-4-blueviolet" />
</div>

<br>

---

## 🧑‍🍳 What is LuTuon API?

**LuTuon API** is the official REST API powering the **LuTuon Web** companion site for the mobile game **LuTuon** — a 3D cooking simulator for Filipino cuisine.  
Built with **Express.js** and **PostgreSQL (via Drizzle ORM)**, it serves recipe data, cultural tips, news, and game info through secure endpoints.

---

## 📡 API Features

- 🍲 **Recipes API** — Serve featured Filipino dishes and instructions  
- 📜 **Cultural Tips API** — Share Filipino cooking culture and traditions  
- 📢 **News & Updates** — Manage announcements and patch notes  
- 🔐 **Secure Routes** — Admin-only content management  

---

## 🛠️ Tech Stack

- **Backend Framework:** Express.js  
- **Database:** PostgreSQL (via Drizzle ORM)  
- **Authentication:** JWT (JSON Web Tokens)  
- **Environment Management:** dotenv  
- **Validation:** Zod / custom middleware  

---

## 📁 Folder Structure
```
lutuon-backend/
├─ src/
│  ├─ config/       # Server configs
│  ├─ routes/       # Express route handlers
│  ├─ controllers/  # Business logic
│  ├─ services/     # Service modules
│  ├─ schema/       # Drizzle ORM schemas
│  ├─ middleware/   # Auth & validation
│  └─ server.ts      # Entry point
├─ package.json
├─ tsconfig.json
└─ .env
```

---

## 🚀 Project Setup

### Clone the repo
```bash
git clone https://github.com/Beirun/lutuon-backend.git
cd lutuon-backend
```

### Install dependencies
```bash
npm install
```

### Setup environment
Create a `.env` file with:
```
PORT=4000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
EMAIL=your_email
PASSWORD=your_app_password
```

### Run in development
```bash
npm run dev
```

---

## 👥 Team

- 🧠 Project Manager: [@Bynib](https://github.com/Bynib)  
- 👨‍💻 Developer: [@Beirun](https://github.com/Beirun)  
- 🎨 Designer: [@Kenronix](https://github.com/Kenronix)  
- 📱 Tester: [@EdJaymarPilapil](https://github.com/EdJaymarPilapil)  

> We are a group of IT students from the University of Cebu, bringing tradition to technology.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 💬 Feedback & Contributions

We’d love your input!  
Open an [issue](https://github.com/Beirun/lutuon-backend/issues) or fork the project and send a pull request.

---

> "LuTuon Backend — Serving culture and cuisine, one API at a time."

