# EduBridge AI Mobile App

React Native mobile app for EduBridge AI adaptive learning platform built with Expo and TypeScript.

## ?? Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (optional for testing)

### Installation

```bash
cd edubridge-mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# On terminal:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app
```

## ?? Project Structure

```
+-- src/
¦   +-- navigation/
¦   ¦   +-- AppNavigator.tsx         # Stack + Tab navigation
¦   +-- screens/
¦   ¦   +-- SplashScreen.tsx
¦   ¦   +-- auth/
¦   ¦   ¦   +-- LoginScreen.tsx
¦   ¦   ¦   +-- RegisterScreen.tsx
¦   ¦   +-- student/
¦   ¦   ¦   +-- DashboardScreen.tsx
¦   ¦   ¦   +-- QuizScreen.tsx
¦   ¦   ¦   +-- AITutorScreen.tsx
¦   ¦   ¦   +-- ProgressScreen.tsx
¦   ¦   ¦   +-- ProfileScreen.tsx
¦   ¦   +-- teacher/
¦   ¦       +-- TeacherDashboardScreen.tsx
¦   ¦       +-- TeacherProfileScreen.tsx
¦   +-- services/
¦   ¦   +-- api.ts                  # Axios + API calls
¦   +-- store/
¦       +-- authStore.ts            # AsyncStorage auth state
+-- App.tsx                         # Navigation setup
+-- package.json
+-- tsconfig.json
+-- .env
```

## ?? UI/UX

- **Purple Theme**: #7C3AED
- **Navigation**: Stack + Bottom Tabs (no expo-router)
- **Components**: React Native built-ins + expo-linear-gradient
- **Icons**: Ionicons from @expo/vector-icons

## ?? API Integration

The app connects to the backend API at `http://localhost:3000/api`:

- **Authentication**: Register, login, get profile
- **Quiz**: Start, answer, finish quizzes
- **AI**: Chat with tutor, generate quizzes

Tokens are stored in AsyncStorage and automatically added to requests.

## ?? Screens

### Authentication
- **Splash**: Purple gradient with logo and "Mulai Belajar" button
- **Login**: Email/password login with register link
- **Register**: Name/email/password with role picker (Student/Teacher)

### Student
- **Dashboard**: Stats grid, recommendations, subjects
- **Quiz**: Questions with progress bar and timer
- **AI Tutor**: Chat interface with AI
- **Progress**: Weekly stats and subject performance
- **Profile**: User info and settings

### Teacher
- **Dashboard**: Stats, at-risk student list
- **Profile**: User info and settings

## ??? Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## ?? Stack

- **React Native**: 0.73+
- **Expo**: SDK 49+
- **TypeScript**: 5.1+
- **Navigation**: @react-navigation (native-stack + bottom-tabs)
- **HTTP**: Axios
- **Storage**: @react-native-async-storage/async-storage
- **Icons**: @expo/vector-icons
- **Gradients**: expo-linear-gradient

## ?? Authentication

JWT-based authentication with AsyncStorage persistence. Tokens are:
- Stored locally on login
- Sent with every API request
- Cleared on logout

## ?? License

Part of EduBridge AI - UNITY Competition #14
