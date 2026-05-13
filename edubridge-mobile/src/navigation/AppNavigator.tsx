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
import JoinClassScreen from '../screens/student/JoinClassScreen';
import SubjectModulesScreen from '../screens/student/SubjectModulesScreen';
import MaterialDetailScreen from '../screens/student/MaterialDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = '#7C3AED';

const TabIcon = ({ name, label, focused }: { name: any; label: string; focused: boolean }) => (
  <View style={styles.tabIconWrap}>
    <Ionicons name={focused ? name : `${name}-outline`} size={24} color={focused ? PURPLE : '#94A3B8'} />
    <Text style={[styles.tabLabel, { color: focused ? PURPLE : '#94A3B8' }]}>{label}</Text>
  </View>
);

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        height: 70,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        elevation: 0,
        shadowOpacity: 0,
      },
    }}
  >
    <Tab.Screen
      name="StudentDashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="home" label="Beranda" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Kelas"
      component={ClassScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="library" label="Kelas" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" label="Progress" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="StudentProfile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="person" label="Profil" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
          <Stack.Screen name="JoinClass" component={JoinClassScreen} />
          <Stack.Screen name="SubjectModules" component={SubjectModulesScreen} />
          <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="AITutor" component={AITutorScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 10 },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});

export default AppNavigator;