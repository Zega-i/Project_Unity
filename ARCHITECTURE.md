# 🏗️ EduBridge AI - Architecture Documentation

Dokumentasi lengkap arsitektur sistem EduBridge AI

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Native Mobile App (Expo)                    │   │
│  │  - 11 Screens (Auth, Student, Teacher, Admin)     │   │
│  │  - Stack + Bottom Tab Navigation                  │   │
│  │  - AsyncStorage (offline persistence)            │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP / REST / JSON
                    (Bearer Token Auth)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express.js + TypeScript (Port 3000)               │   │
│  │  - CORS Middleware                                 │   │
│  │  - JWT Auth Middleware                             │   │
│  │  - JSON Body Parser                                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Router → Controller
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                       │
│  ┌─────────────┬──────────────┬──────────────────────────┐  │
│  │ AuthControl │ QuizControl  │ AIController            │  │
│  │             │              │                          │  │
│  │ - Register  │ - Start quiz │ - Tutor chat           │  │
│  │ - Login     │ - Answer     │ - Generate quiz         │  │
│  │ - Profile   │ - Finish     │ - Analyze errors        │  │
│  └─────────────┴──────────────┴──────────────────────────┘  │
│                           │                                  │
│          ┌────────────────┼────────────────┐                │
│          │                │                │                │
│  ┌───────▼──────┐ ┌──────▼─────────┐ ┌────▼─────────────┐  │
│  │ AdaptiveQuiz │ │ GeminiService  │ │ (Future Services) │  │
│  │ Service      │ │                │ │                   │  │
│  │              │ │ - Chat         │ │                   │  │
│  │ - Increase   │ │ - Generate     │ │                   │  │
│  │   difficulty │ │ - Analyze      │ │                   │  │
│  │ - Decrease   │ └────────────────┘ └───────────────────┘  │
│  │   difficulty │                                            │
│  └──────────────┘                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
            Prisma ORM ← PostgreSQL Driver →
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Prisma Client                                     │   │
│  │  - Query Builder                                   │   │
│  │  - Type-safe database operations                  │   │
│  │  - Migration management                           │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    TCP Connection
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Neon Cloud)                           │   │
│  │  - 18 Relational Tables                            │   │
│  │  - Indexes for performance                         │   │
│  │  - Foreign keys for integrity                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture Layers

### 1. **Presentation Layer** (Express Router)

Routes map HTTP requests to controllers:

```
POST /api/auth/login
    ↓
authRouter.post('/login', AuthController.login)
    ↓
Forwards to AuthController
```

**Files**: `src/routes/auth.ts`, `src/routes/quiz.ts`, `src/routes/ai.ts`, `src/routes/upload.ts`

### 2. **Business Logic Layer** (Controllers)

Controllers handle request/response logic:

```typescript
// AuthController.login()
1. Get email & password from request body
2. Query database untuk user
3. Compare password dengan bcrypt
4. Generate JWT token
5. Return token + user data
```

**Files**: `src/controllers/AuthController.ts`, `src/controllers/QuizController.ts`, `src/controllers/AIController.ts`

### 3. **Service Layer** (Business Services)

Services menghandle complex logic:

```typescript
// AdaptiveQuizService
- increaseDifficulty(questionId)     // Naik jika jawab benar
- decreaseDifficulty(questionId)     // Turun jika jawab salah
- getAdaptiveQuestions(classId, level)

// GeminiService
- generateQuizFromText(text, count)
- chatWithTutor(message, context)
- analyzeErrors(wrongAnswers)
```

**Files**: `src/services/AdaptiveQuizService.ts`, `src/services/GeminiService.ts`

### 4. **Data Access Layer** (Prisma)

Prisma menangani semua database operations:

```typescript
// Query
const user = await prisma.user.findUnique({ where: { email } })

// Create
const quiz = await prisma.quizSession.create({
  data: { studentId, classId, totalQuestions }
})

// Update
await prisma.question.update({
  where: { id: questionId },
  data: { difficulty: newDifficulty }
})
```

### 5. **Configuration Layer**

- `config/database.ts` - Prisma client instance
- `config/gemini.ts` - Google Gemini API setup
- `config/uploadthing.ts` - File upload configuration

### 6. **Middleware Layer**

- `middleware/auth.ts` - JWT verification & token injection

---

## Mobile Architecture

### Navigation Structure

```
App.tsx
    ↓
AppNavigator
    ├── AuthStack (Unauthenticated)
    │   ├── Splash
    │   ├── Login
    │   └── Register
    │
    └── MainStack (Authenticated)
        ├── StudentTabs (if role === 'STUDENT')
        │   ├── Dashboard (icon: home)
        │   ├── Quiz (icon: help-circle)
        │   ├── AITutor (icon: chatbubbles)
        │   ├── Progress (icon: bar-chart)
        │   └── Profile (icon: person)
        │
        └── TeacherTabs (if role === 'TEACHER')
            ├── Dashboard (icon: home)
            └── Profile (icon: person)
```

### Screen Hierarchy

**Screen**: React Component yang mengisi full screen

```
DashboardScreen.tsx
├── ScrollView (untuk scroll content)
├── SafeAreaView (untuk handle notch/status bar)
├── View (greeting section)
├── FlatList (stats grid)
├── View (recommendations)
└── View (subjects)
```

### State Management

```
App.tsx
    │
    ├─→ AsyncStorage (Persistent)
    │   ├── auth_token (JWT)
    │   └── auth_user (User profile)
    │
    └─→ Local Screen State (useState)
        ├── Form inputs
        ├── Loading states
        ├── UI states (messages, selections)
        └── Temporary data
```

---

## Data Flow Diagrams

### Authentication Flow

```
User Input (Email/Password)
        ↓
LoginScreen.handleLogin()
        ↓
API: authAPI.login(email, password)
        ↓
Backend: POST /api/auth/login
        ↓
AuthController.login()
        ↓
1. Find user by email
2. Hash compare password
3. Generate JWT token
        ↓
Response: { token, user }
        ↓
authStore.setAuth(token, user)
        ↓
AsyncStorage: save token + user
        ↓
Navigation → StudentTabs / TeacherTabs
```

### Quiz Flow

```
User: Press Start Quiz
        ↓
QuizScreen mounted
        ↓
API: quizAPI.startQuiz(classId, questionCount)
        ↓
Backend: POST /api/quiz/start
        ↓
QuizController.startQuiz()
        ↓
1. Get questions from database
2. Create quiz session
3. Return questions
        ↓
Display: Question + 4 answers + timer
        ↓
User: Select answer
        ↓
API: quizAPI.answerQuestion(sessionId, questionId, answer)
        ↓
Backend: POST /api/quiz/answer
        ↓
QuizController.answerQuestion()
        ↓
1. Check correctness
2. Update difficulty (AdaptiveQuizService)
3. Return feedback + explanation
        ↓
Display: Feedback → Next Question
        ↓
Repeat until all questions done
        ↓
User: Press Finish
        ↓
API: quizAPI.finishQuiz(sessionId)
        ↓
Backend: Calculate score
        ↓
Response: { score, correctAnswers }
```

### AI Tutor Flow

```
User: Type message
        ↓
AITutorScreen.handleSend()
        ↓
1. Add user message to messages array
2. Display immediately (optimistic update)
        ↓
API: aiAPI.tutorChat(message, context)
        ↓
Backend: POST /api/ai/tutor
        ↓
AIController.tutorChat()
        ↓
GeminiService.chatWithTutor(message, context)
        ↓
Send to Google Gemini API
        ↓
Receive response
        ↓
Response: { response: "..." }
        ↓
Display AI message in chat
        ↓
(User dapat lanjut chat)
```

---

## Database Schema Relationships

```
User (1) ──→ (many) StudentProfile
     ├──→ (many) TeacherProfile
     ├──→ (many) AdminProfile
     └──→ (many) LoginHistory

Student (1) ──→ (many) ClassStudent
        ├──→ (many) QuizSession
        ├──→ (many) LearningPath
        ├──→ (many) StudentRiskScore
        └──→ (many) MaterialView

Class (1) ──→ (many) ClassStudent
      ├──→ (many) Question
      ├──→ (many) Material
      └──→ (many) LearningPath

Question (1) ──→ (many) QuizAnswer
         └──→ (many) QuizErrorAnalysis

QuizSession (1) ──→ (many) QuizAnswer

Material (1) ──→ (many) MaterialView
        └──→ (one) AiGeneratedMaterial

LearningPath (1) ──→ (many) LearningPathItem
```

---

## API Request/Response Flow

### Request Pipeline

```
1. Client sends HTTP request
   Headers: { Authorization: "Bearer <token>" }
   Body: { data }

2. Express receives request

3. Middleware chain:
   - app.use(cors())
   - app.use(express.json())
   - app.use(authMiddleware)  // For protected routes

4. Router matches path & method

5. Controller executes logic:
   - Validate input
   - Call service/database
   - Handle errors

6. Response sent back:
   - Status code (200, 201, 400, 401, 500, etc)
   - JSON body
   - Headers
```

### Error Handling

```
try {
  // Business logic
} catch (error) {
  if (error instanceof PrismaError) {
    // Database error
    res.status(400).json({ error: message })
  } else if (error instanceof ValidationError) {
    // Validation error
    res.status(400).json({ error: message })
  } else {
    // Unexpected error
    res.status(500).json({ error: "Internal server error" })
  }
}
```

---

## Performance Optimization

### Backend

1. **Database**: Indexes on frequently queried columns
2. **Caching**: Cache Gemini responses
3. **Pagination**: Limit query results
4. **Query Optimization**: Select only needed fields

### Mobile

1. **FlatList**: Use for long lists (not ScrollView)
2. **Memoization**: useMemo for expensive calculations
3. **Lazy Loading**: Load screens on demand
4. **Image Optimization**: Optimize image sizes

---

## Security Architecture

### Authentication & Authorization

```
User Login
    ↓
Bcrypt hash password check
    ↓
JWT token generation (exp: 7 days)
    ↓
Token stored in AsyncStorage
    ↓
Every API request includes token
    ↓
Backend validates JWT signature
    ↓
Extract user info from token
    ↓
Allow/deny based on user role
```

### Data Protection

- Passwords: Bcrypt hashing (10 rounds)
- Tokens: HS256 algorithm
- Database: PostgreSQL with SSL
- API: CORS enabled for trusted origins

---

## Scalability Considerations

### Horizontal Scaling

- Backend dapat dijalankan di multiple instances dengan load balancer
- Database dapat di-replicate dengan read replicas
- Mobile app otomatis mendistribusikan requests

### Vertical Scaling

- Optimize database queries
- Add caching layer (Redis)
- Optimize API response times

### Future Enhancements

1. Microservices (Authentication, Quiz, AI services terpisah)
2. Message Queue (Kafka/RabbitMQ untuk async tasks)
3. Caching Layer (Redis untuk session & frequently accessed data)
4. File Storage (S3 untuk materials & uploads)

---

## Deployment Architecture

```
GitHub Repository (Monorepo)
    ├── /backend → Railway
    │   ├── Auto-deploy on push
    │   ├── Environment: Production
    │   └── Database: Neon PostgreSQL
    │
    └── /mobile → EAS Build
        ├── Build on demand
        ├── APK/IPA generated
        └── Distribute via Expo/PlayStore
```

---

**Version**: 1.0.0  
**Last Updated**: May 13, 2026
