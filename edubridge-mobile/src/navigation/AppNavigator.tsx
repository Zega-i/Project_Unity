import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { authStore } from '../store/authStore';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/student/DashboardScreen';
import ClassScreen from '../screens/student/ClassScreen';
import QuizScreen from '../screens/student/QuizScreen';
import AITutorScreen from '../screens/student/AITutorScreen';
import ProgressScreen from '../screens/student/ProgressScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = '#7C3AED';

// Custom tab bar icon with label
const TabIcon = ({ name, label, color, focused }: { name: any; label: string; color: string; focused: boolean }) => (
  <View style={tabStyles.iconWrap}>
    <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
    <Text style={[tabStyles.tabLabel, { color }]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Student Tab Navigator — matches design: Beranda, Kelas, Progress, Profil
const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: PURPLE,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#F1F5F9',
        borderTopWidth: 1,
        height: 68,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 12,
      },
    }}
  >
    <Tab.Screen
      name="StudentDashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="home" label="Beranda" color={color} focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Kelas"
      component={ClassScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="library" label="Kelas" color={color} focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Quiz"
      component={QuizScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="help-circle" label="Kuis" color={color} focused={focused} />,
      }}
    />
    <Tab.Screen
      name="AITutor"
      component={AITutorScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="chatbubbles" label="AI Tutor" color={color} focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="bar-chart" label="Progres" color={color} focused={focused} />,
      }}
    />
    <Tab.Screen
      name="StudentProfile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="person" label="Profil" color={color} focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

// Teacher Tab Navigator
const TeacherTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: PURPLE,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#F1F5F9',
        borderTopWidth: 1,
        height: 68,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 12,
      },
    }}
  >
    <Tab.Screen
      name="TeacherDashboard"
      component={TeacherDashboardScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="home" label="Beranda" color={color} focused={focused} />,
      }}
    />
    <Tab.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{
        tabBarIcon: ({ color, focused }) => <TabIcon name="person" label="Profil" color={color} focused={focused} />,
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