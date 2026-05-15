# EduBridge AI Backend

Adaptive AI learning platform backend for Indonesian students. Built with Express.js, TypeScript, Prisma, and Groq/Llama API.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (Neon)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

The server will run on `http://localhost:3000`

## 📁 Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Prisma client setup
│   │   ├── Groq/Llama.ts    # Groq/Llama API configuration
│   │   └── uploadthing.ts
│   ├── controllers/     # Business logic controllers
│   │   ├── AuthController.ts
│   │   ├── QuizController.ts
│   │   └── AIController.ts
│   ├── middleware/      # Express middleware
│   │   └── auth.ts      # JWT authentication
│   ├── routes/          # API route definitions
│   │   ├── auth.ts
│   │   ├── quiz.ts
│   │   ├── ai.ts
│   │   └── upload.ts
│   ├── services/        # Business service layer
│   │   ├── AdaptiveQuizService.ts
│   │   └── Groq/LlamaService.ts
│   └── index.ts         # Express app entry point
├── prisma/
│   └── schema.prisma    # Database schema (13 models)
├── package.json
├── tsconfig.json
└── .env                 # Environment variables
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user

### Quiz
- `POST /api/quiz/start` - Start a quiz session
- `POST /api/quiz/answer` - Submit quiz answer
- `POST /api/quiz/finish` - End quiz session

### AI
- `POST /api/ai/tutor` - Chat with AI tutor
- `POST /api/ai/generate-quiz` - Generate quiz from text
- `POST /api/ai/analyze-errors` - Analyze student errors

### Upload
- `POST /api/upload/upload` - Upload learning materials

## 🗄️ Database Models (13 Models)

1. **User** - User accounts (Student, Teacher, Admin)
2. **StudentProfile** - Student-specific data
3. **TeacherProfile** - Teacher-specific data
4. **AdminProfile** - Admin-specific data
5. **Class** - Course/class information
6. **ClassStudent** - Student enrollment in classes
7. **Question** - Quiz questions with difficulty levels
8. **QuizSession** - Quiz attempt tracking
9. **QuizAnswer** - Individual question answers
10. **Material** - Learning materials (PDF, video, article, etc.)
11. **MaterialView** - Material viewing analytics
12. **AiGeneratedMaterial** - AI-generated content metadata
13. **StudentRiskScore** - Risk assessment scores
14. **LearningPath** - Personalized learning paths
15. **LearningPathItem** - Items in learning paths
16. **Notification** - User notifications
17. **LoginHistory** - Login tracking
18. **QuizErrorAnalysis** - Error pattern analysis

## 🧠 Key Features

### Adaptive Quiz System
- Increases difficulty on correct answers
- Decreases difficulty on wrong answers
- Tracks student performance and learning patterns

### AI Tutor Integration
- Chat-based tutoring with Groq/Llama API
- Quiz generation from learning materials
- Automated error analysis and suggestions

### Risk Assessment
- Real-time student risk scoring
- Multi-factor analysis (performance, engagement, etc.)
- Personalized intervention suggestions

### Learning Paths
- AI-generated personalized learning paths
- Material sequencing based on student level
- Progress tracking and completion monitoring

## 📝 Environment Variables

```env
DATABASE_URL=postgresql://...  # Neon PostgreSQL
Groq/Llama_API_KEY=...             # Google Groq/Llama API key
JWT_SECRET=...                 # JWT signing secret
PORT=3000                      # Server port
UPLOADTHING_TOKEN=...          # File upload service
```

## 🛠️ Development Commands

```bash
# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Prisma commands
npm run prisma:generate        # Generate Prisma Client
npm run prisma:push            # Push schema to database
npm run prisma:pull            # Pull existing schema from database
```

## 🔒 Authentication

Uses JWT tokens for authentication. Include in requests:
```
Authorization: Bearer <token>
```

## 📚 Stack

- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.1
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 5.8
- **AI**: Google Groq/Llama API
- **File Upload**: Uploadthing
- **Dev Tools**: Nodemon, ts-node

## 🚀 Deployment

Build and start:
```bash
npm run build
npm start
```

The application is ready for deployment on platforms supporting Node.js (Heroku, Railway, Vercel, AWS, GCP, etc.).

## 📄 License

Part of EduBridge AI - UNITY Competition #14
