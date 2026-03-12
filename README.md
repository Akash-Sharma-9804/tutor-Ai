# 🤖 AI Student Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-Database-00758F?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/AI-OpenAI%20%26%20Gemini-412991?style=for-the-badge&logo=openai" alt="AI">
  <img src="https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge" alt="License">
</p>

> An intelligent tutoring platform that combines AI-powered learning assistance with interactive features including book reading, OCR-based scanning, and real-time conversation capabilities.

---

## ✨ Features

### 👨‍🎓 Student Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Tutor** | Get instant help with homework and questions |
| 📷 **Scan & Learn** | Scan documents using OCR for instant analysis |
| 🗣️ **Talk to AI** | Voice-enabled AI conversation |
| 📖 **Book Reader** | Interactive reading with line-by-line navigation |
| 📚 **Subjects** | Browse and manage learning subjects |
| 📊 **Progress** | Monitor learning progress and achievements |
| ✅ **Tests** | Take interactive assessments |
| 👤 **Profile** | Customize your learning experience |

### 👨‍💼 Admin Features

| Feature | Description |
|---------|-------------|
| 🏫 **Schools** | Manage multiple schools |
| 🏠 **Classes** | Organize students into classes |
| 👥 **Users** | Manage students and teachers |
| 📚 **Content** | Upload and manage books and subjects |
| 📈 **Analytics** | View platform statistics |

---

## 🛠️ Tech Stack

### Frontend ⚛️

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&style=flat-square)
![Redux](https://img.shields.io/badge/Redux-764ABC?logo=redux&style=flat-square)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?logo=react-router&style=flat-square)
![Rive](https://img.shields.io/badge/Rive-FF5A5F?logo=rive&style=flat-square)
![Framer](https://img.shields.io/badge/Framer%20Motion-0055FF?logo=framer&style=flat-square)
![KaTeX](https://img.shields.io/badge/KaTeX-FFCE00?logo=katex&style=flat-square)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&style=flat-square)

### Backend 🖥️

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&style=flat-square)
![Express](https://img.shields.io/badge/Express-000000?logo=express&style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&style=flat-square)
![WebSocket](https://img.shields.io/badge/WebSocket-000000?logo=websocket&style=flat-square)
![JWT](https://img.shields.io/badge/JWT-000000?logo=json-web-tokens&style=flat-square)
![Google OAuth](https://img.shields.io/badge/Google%20OAuth-4285F4?logo=google&style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-8E25F9?logo=google-generative-ai&style=flat-square)

---

## 📁 Project Structure

```
ai-student-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── admin/         # Admin panel
│   │   ├── api/           # API configuration
│   │   ├── components/    # Shared components
│   │   ├── layouts/        # Layout components
│   │   ├── pages/         # Student pages
│   │   ├── routes/        # Route definitions
│   │   └── store/         # Redux store
│   └── public/            # Static assets
│
└── Server/                 # Express backend
    ├── config/            # Configuration files
    ├── controllers/       # Route controllers
    ├── middleware/        # Custom middleware
    ├── models/            # Database models
    ├── routes/            # API routes
    └── services/          # Business logic
```

## 🚀 Quick Start

```bash
# Clone and navigate
cd ai-student-dashboard

# Install dependencies
cd client && npm install && cd ..
cd Server && npm install && cd ..

# Configure environment (see below)
# Start backend
cd Server && npm run dev

# Start frontend (in new terminal)
cd client && npm run dev
```

---

## ⚙️ Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| MySQL | 8.0+ |
| npm / yarn | Latest |

### Installation

1. **Clone the repository**
   ```bash
   cd ai-student-dashboard
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../Server
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the Server directory:
   ```env
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ai_tutor
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENAI_API_KEY=your_openai_key
   GEMINI_API_KEY=your_gemini_key
   FTP_HOST=your_ftp_host
   FTP_USER=your_ftp_user
   FTP_PASSWORD=your_ftp_password
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd Server
   npm run dev
   ```
   > 🖥️ Server runs on http://localhost:4000

2. **Start the frontend**
   ```bash
   cd client
   npm run dev
   ```
   > 🌐 Client runs on http://localhost:5173

### Building for Production

```bash
# Build client
cd client
npm run build
```

---

## 🔌 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Student registration |
| `POST` | `/api/auth/login` | Student login |
| `POST` | `/api/auth/google` | Google OAuth login |
| `POST` | `/api/admin/auth/login` | Admin login |

### 👨‍🎓 Student

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/profile` | Get student profile |
| `PUT` | `/api/student/profile` | Update student profile |
| `GET` | `/api/student/progress` | Get learning progress |

### 📚 Subjects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subjects` | List all subjects |
| `GET` | `/api/subjects/:id` | Get subject details |

### 📖 Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books` | List all books |
| `GET` | `/api/books/:id` | Get book details |
| `GET` | `/api/books/:bookId/chapters` | Get book chapters |

### 🤖 AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Chat with AI tutor |
| `POST` | `/api/scans` | Process scanned documents |
| `POST` | `/api/scans/analyze` | Analyze scanned content |

### 👨‍💼 Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/schools` | List schools |
| `POST` | `/api/admin/schools` | Create school |
| `GET` | `/api/admin/students` | List students |
| `GET` | `/api/admin/books` | List books |

---

## 📄 License

<p align="center">
  <img src="https://img.shields.io/badge/License-ISC-yellow.svg" alt="License">
</p>

<p align="center">ISC License - feel free to use this project for learning and development.</p>