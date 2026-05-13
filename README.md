# 🎓 EduBridge AI - Adaptive Learning Platform

> Platform pembelajaran adaptif berbasis AI untuk siswa Indonesia dengan fitur quiz, AI tutor, dan tracking progress.
> 
> **Status**: ✅ **PRODUCTION READY** | Monorepo dengan Backend & Mobile App

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Guide](#setup-guide)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)

---

## 🚀 Quick Start

### Prasyarat
- Node.js 16+ & npm/yarn
- PostgreSQL (Neon cloud recommended)
- Git
- Expo CLI: `npm install -g expo-cli`

### Run dalam 3 Step

```bash
# Terminal 1: Backend
cd D:\EduBridge\backend
npm install && npm run dev
# Server: http://localhost:3000

# Terminal 2: Mobile
cd D:\EduBridge\edubridge-mobile
npm install && npm start
# Scan QR atau tekan 'i'/'a'

# Test Credentials
Email: student@edubridge.com
Password: password123
```

---

## 📁 Project Structure

```
D:\EduBridge\
├── backend/                    # Express.js + TypeScript
│   ├── src/
│   │   ├── config/            # Database, Gemini, Uploadthing
│   │   ├── controllers/       # 3 Controllers (Auth, Quiz, AI)
│   │   ├── middleware/        # JWT Auth
│   │   ├── routes/            # 4 Routes (auth, quiz, ai, upload)
│   │   ├── services/          # 2 Services (AdaptiveQuiz, Gemini)
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma      # 18 Data Models
│   ├── .env
│   └── npm run dev
│
├── edubridge-mobile/          # React Native + Expo
│   ├── src/
│   │   ├── navigation/        # Stack + Bottom Tabs
│   │   ├── screens/           # 11 Screens
│   │   ├── services/          # API Service
│   │   ├── store/             # AsyncStorage Auth
│   │   ├── components/        # Reusable Components
│   │   └── utils/
│   ├── App.tsx
│   ├── .env
│   └── npm start
│
└── README.md                  # This file
```

---

## 🎯 Features

✅ **Authentication**: JWT + Bcrypt  
✅ **Adaptive Quiz**: Difficulty adjustment based on answers  
✅ **AI Tutor**: Gemini-powered chat  
✅ **Progress Tracking**: Charts & analytics  
✅ **Role-Based**: Student, Teacher, Admin  
✅ **Risk Assessment**: Student performance monitoring  
✅ **Responsive**: Mobile-first design  
✅ **Offline Support**: AsyncStorage persistence  
✅ **TypeScript**: Full type safety  

---

## 📚 Tech Stack

**Backend**: Express.js 4.18 | TypeScript 5.1 | Prisma 5.8 | PostgreSQL | Gemini API | JWT  
**Mobile**: React Native 0.81 | Expo SDK 54 | TypeScript 5.9 | Axios | AsyncStorage  

---

## 🛠️ Setup Guide

### Backend

```bash
cd D:\EduBridge\backend

# Install & generate
npm install
npx prisma generate

# Configure .env (dari MOBILE_COMPLETE.md)
# DATABASE_URL=postgresql://...
# GEMINI_API_KEY=AIzaSyC5...
# JWT_SECRET=edubridge_secret_2026_unity
# PORT=3000

# Run
npm run dev
```

### Mobile

```bash
cd D:\EduBridge\edubridge-mobile

# Install
npm install --legacy-peer-deps

# Configure .env
# EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Run
npm start
```

---

## 🔌 API Endpoints

```
Authentication:
POST   /api/auth/register      - Register user
POST   /api/auth/login         - Login
GET    /api/auth/me            - Profile

Quiz:
POST   /api/quiz/start         - Start quiz
POST   /api/quiz/answer        - Submit answer
POST   /api/quiz/finish        - End quiz

AI:
POST   /api/ai/tutor           - Chat with AI
POST   /api/ai/generate-quiz   - Generate quiz
POST   /api/ai/analyze-errors  - Analyze errors

Upload:
POST   /api/upload/upload      - Upload material
```

---

## 📱 Mobile Screens (11 Total)

**Auth (3)**: Splash, Login, Register  
**Student (5)**: Dashboard, Quiz, AI Tutor, Progress, Profile  
**Teacher (2)**: Dashboard, Profile  
**Admin (TBD)**: Dashboard, User Management  

---

## 🎨 Design

- **Theme**: Purple #7C3AED
- **Components**: Custom React Native
- **Icons**: Ionicons
- **Gradients**: expo-linear-gradient
- **Responsive**: Flexbox layouts

---

## 🔒 Security

✓ Bcrypt password hashing  
✓ JWT authentication (7-day expiry)  
✓ AsyncStorage token persistence  
✓ Cascade delete database integrity  
✓ CORS middleware  

---

## 📊 Database (18 Models)

User, Student, Teacher, Admin, Class, ClassStudent, Question, QuizSession, QuizAnswer, Material, MaterialView, AiGeneratedMaterial, StudentRiskScore, LearningPath, LearningPathItem, Notification, LoginHistory, QuizErrorAnalysis

---

## 🚀 Deployment

**Backend**: Railway (root: /backend)  
**Mobile**: EAS/Expo build  

---

## 📝 Documentation Files

- **README.md** - Main project documentation (this file)
- **MOBILE_COMPLETE.md** - Complete feature list
- **backend/README.md** - Backend specific docs
- **edubridge-mobile/README.md** - Mobile specific docs

---

## 🧪 Testing

```bash
# Backend API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@edubridge.com","password":"password123"}'

# Mobile
npm start && (press 'a' or 'i' or scan QR)
```

---

**Status**: ✅ **PRODUCTION READY**  
**Last Updated**: May 13, 2026  
**Version**: 1.0.0
