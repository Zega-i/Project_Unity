# 🚀 EduBridge AI - Quick Start Guide

Panduan praktis memulai development EduBridge AI dalam 5 menit

---

## ⚡ 5-Minute Setup

### Prerequisite Check

```bash
# Pastikan sudah terinstall
node --version          # v16+ required
npm --version           # v8+ required
git --version           # Required

# Untuk mobile testing
npm list -g expo-cli    # atau: npm install -g expo-cli
```

### Terminal 1: Start Backend

```bash
# Masuk backend directory
cd D:\EduBridge\backend

# Instal dependencies (skip jika sudah)
npm install

# Pastikan .env sudah di-set dengan:
# DATABASE_URL=postgresql://...
# GEMINI_API_KEY=AIzaSyC5...
# JWT_SECRET=edubridge_secret_2026_unity
# PORT=3000

# Generate Prisma (jika belum)
npx prisma generate

# RUN!
npm run dev

# Expected output:
# EduBridge backend running on http://localhost:3000
# Environment: development
```

### Terminal 2: Start Mobile

```bash
# Open new terminal
cd D:\EduBridge\edubridge-mobile

# Instal dependencies (skip jika sudah)
npm install --legacy-peer-deps

# RUN!
npm start

# Expected output:
# Ready at http://localhost:19000
# expo QR code...

# Pilih salah satu:
# [i] Open iOS Simulator
# [a] Open Android Emulator
# [w] Open in web browser
# Atau scan QR code dengan Expo Go app
```

---

## ✅ Verify Everything Works

### 1. Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Expected: {"status":"Server is running","timestamp":"..."}
```

### 2. Test Mobile Login

```
Email: student@edubridge.com
Password: password123

# Harusnya bisa login dan masuk ke Dashboard
```

---

## 📁 File Structure Quick Reference

```
backend/
├── src/
│   ├── index.ts              # Main server
│   ├── controllers/          # Business logic
│   ├── routes/               # API endpoints
│   ├── services/             # Helpers (AdaptiveQuiz, Gemini)
│   ├── middleware/           # Auth middleware
│   └── config/               # Database, APIs
├── prisma/
│   └── schema.prisma         # Database
├── .env                      # Configuration
└── package.json

edubridge-mobile/
├── src/
│   ├── screens/              # 11 screens
│   ├── navigation/           # App navigation
│   ├── services/             # API client
│   ├── store/                # Auth state
│   └── components/           # UI components
├── App.tsx                   # Entry point
├── .env                      # Config
└── package.json
```

---

## 🔌 Common API Endpoints

### Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@edubridge.com",
    "password": "password123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Quiz

```bash
# Start Quiz
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "class-123",
    "questionCount": 5
  }'

# Answer Question
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "questionId": "q-123",
    "answer": "A"
  }'
```

### AI

```bash
# Chat with Tutor
curl -X POST http://localhost:3000/api/ai/tutor \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Apa itu percepatan?",
    "context": "Fisika - BAB 2"
  }'

# Generate Quiz
curl -X POST http://localhost:3000/api/ai/generate-quiz \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hukum Newton adalah...",
    "questionCount": 5
  }'
```

---

## 🛠️ Common Commands

### Backend

```bash
# Development mode dengan auto-reload
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Open Prisma Studio (visual database)
npx prisma studio
```

### Mobile

```bash
# Start development server
npm start

# Build APK (Android)
eas build --platform android

# Build IPA (iOS)
eas build --platform ios

# Build web
npm run web

# Clear cache
npm start -- --clear
```

---

## 🎨 UI Theme Colors

Gunakan warna berikut untuk custom styling:

```javascript
// Purple Theme
const PURPLE = '#7C3AED'      // Primary
const DARK_PURPLE = '#5B21B6' // Secondary
const LIGHT = '#f5f5f5'       // Light bg
const DARK = '#1a1a1a'        // Dark text
const ALERT = '#FF6B6B'       // Alert/Error
```

---

## 🧪 Test Accounts

Gunakan akun ini untuk testing:

```
Student:
  Email: student@edubridge.com
  Password: password123
  Role: STUDENT

Teacher:
  Email: teacher@edubridge.com
  Password: password123
  Role: TEACHER
```

---

## 📊 Database Models Quick Reference

```
User
├── Student (profile)
│   ├── ClassStudent (enrollment)
│   ├── QuizSession
│   │   └── QuizAnswer
│   ├── LearningPath
│   │   └── LearningPathItem
│   ├── StudentRiskScore
│   └── MaterialView
│
├── Teacher (profile)
│   └── Class
│       ├── Question
│       │   ├── QuizAnswer
│       │   └── QuizErrorAnalysis
│       ├── Material
│       │   ├── MaterialView
│       │   └── AiGeneratedMaterial
│       └── LearningPath
│
└── LoginHistory
```

---

## 🚨 Troubleshooting

### Backend won't start?

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Mobile app crashes?

```bash
# Clear cache and restart
cd edubridge-mobile
npm start -- --clear

# Or full reset
rm -rf node_modules
npm install --legacy-peer-deps
npm start
```

### Can't connect to backend from mobile?

```bash
# Make sure backend is running on correct port
http://localhost:3000

# Update mobile .env:
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For Android emulator, use:
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

### Database connection error?

```bash
# Verify DATABASE_URL in .env
# Test connection with Prisma
npx prisma db push

# If that fails, check:
# 1. Neon database is active
# 2. Connection string is correct
# 3. Network allows connection
```

---

## 📚 Documentation Links

- **Main README**: `README.md` - Project overview
- **Architecture**: `ARCHITECTURE.md` - System design
- **Implementation Checklist**: `IMPLEMENTATION_CHECKLIST.md` - Feature status
- **Mobile Complete**: `MOBILE_COMPLETE.md` - Full feature list
- **Backend README**: `backend/README.md` - Backend specific
- **Mobile README**: `edubridge-mobile/README.md` - Mobile specific

---

## 🎯 Development Workflow

### 1. Make Changes

**Backend**: Edit files di `backend/src/`
```bash
# Changes auto-reload dengan nodemon
# Server restarts automatically
```

**Mobile**: Edit files di `edubridge-mobile/src/`
```bash
# Changes hot-reload via Expo
# Just save dan lihat perubahan langsung
```

### 2. Test Changes

**API**: Test dengan curl atau Postman
**Mobile**: Check di simulator/emulator

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

---

## 🚀 Next Steps

1. **Explore Code**
   - [ ] Read backend/README.md
   - [ ] Read edubridge-mobile/README.md
   - [ ] Understand ARCHITECTURE.md

2. **Make Changes**
   - [ ] Add new API endpoint
   - [ ] Create new screen
   - [ ] Modify database schema

3. **Test**
   - [ ] Test your changes locally
   - [ ] Test with multiple accounts
   - [ ] Test error scenarios

4. **Deploy**
   - [ ] Deploy backend to Railway
   - [ ] Build mobile app
   - [ ] Distribute to users

---

## 💡 Tips & Tricks

### Backend

```bash
# View database in visual editor
npx prisma studio

# See database schema changes
npx prisma db pull

# Run specific route test
# Create test.js and run with Node
```

### Mobile

```bash
# View console logs
npm start
# Press 'j' untuk open debugger

# Test specific screen
# Edit App.tsx to navigate directly to screen

# Profile app performance
# Use React DevTools (if installed)
```

---

## ❓ FAQ

**Q: Backend is running, but mobile can't connect?**
A: Check EXPO_PUBLIC_API_URL in .env. For Android emulator, use `http://10.0.2.2:3000/api`

**Q: How do I add a new database field?**
A: Edit `prisma/schema.prisma` → run `npx prisma db push` → restart server

**Q: How do I create a new screen?**
A: Create file in `src/screens/` → add to navigation → update routes

**Q: How do I test API locally?**
A: Use Postman, curl, or Insomnia. See section "Common API Endpoints"

**Q: Can I change the port?**
A: Yes, edit PORT in backend/.env

---

## 📞 Need Help?

1. Check TROUBLESHOOTING section above
2. Read relevant documentation file
3. Check git history: `git log --oneline`
4. Check error messages carefully
5. Search GitHub issues

---

**Ready to develop? Open terminals and run:**

```bash
# Terminal 1
cd D:\EduBridge\backend && npm run dev

# Terminal 2
cd D:\EduBridge\edubridge-mobile && npm start
```

**Happy coding! 🎉**

---

**Version**: 1.0.0  
**Last Updated**: May 13, 2026
