import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { authStore } from '../store/authStore';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/student/DashboardScreen';
import QuizScreen from '../screens/student/QuizScreen';
import AITutorScreen from '../screens/student/AITutorScreen';
import ProgressScreen from '../screens/student/ProgressScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = '#7C3AED';

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      tabBarActiveTintColor: PURPLE,
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#eee',
        borderTopWidth: 1,
      },
      headerStyle: {
        backgroundColor: PURPLE,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'StudentDashboard') iconName = 'home';
        else if (route.name === 'Quiz') iconName = 'help-circle';
        else if (route.name === 'AITutor') iconName = 'chatbubbles';
        else if (route.name === 'Progress') iconName = 'bar-chart';
        else iconName = 'person';

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="StudentDashboard"
      component={DashboardScreen}
      options={{
        title: 'Beranda',
        tabBarLabel: 'Beranda',
      }}
    />
    <Tab.Screen
      name="Quiz"
      component={QuizScreen}
      options={{
        title: 'Kuis',
        tabBarLabel: 'Kuis',
      }}
    />
    <Tab.Screen
      name="AITutor"
      component={AITutorScreen}
      options={{
        title: 'AI Tutor',
        tabBarLabel: 'Tutor AI',
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        title: 'Progres',
        tabBarLabel: 'Progres',
      }}
    />
    <Tab.Screen
      name="StudentProfile"
      component={ProfileScreen}
      options={{
        title: 'Profil',
        tabBarLabel: 'Profil',
      }}
    />
  </Tab.Navigator>
);

const TeacherTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      tabBarActiveTintColor: PURPLE,
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#eee',
        borderTopWidth: 1,
      },
      headerStyle: {
        backgroundColor: PURPLE,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      tabBarIcon: ({ color, size }) => {
        let iconName = route.name === 'TeacherDashboard' ? 'home' : 'person';
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="TeacherDashboard"
      component={TeacherDashboardScreen}
      options={{
        title: 'Beranda',
        tabBarLabel: 'Beranda',
      }}
    />
    <Tab.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{
        title: 'Profil',
        tabBarLabel: 'Profil',
      }}
    />
  </Tab.Navigator>
);

interface AppNavigatorProps {
  isLoggedIn: boolean;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ isLoggedIn }) => {
  const user = authStore.getUserSync();
  const userRole = user?.role || 'STUDENT';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : userRole === 'STUDENT' ? (
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
      ) : (
        <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;