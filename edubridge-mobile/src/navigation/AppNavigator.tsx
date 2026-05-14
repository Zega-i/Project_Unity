import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { authStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/student/DashboardScreen';
import ClassScreen from '../screens/student/ClassScreen';
import QuizScreen from '../screens/student/QuizScreen';
import AITutorScreen from '../screens/student/AITutorScreen';
import ProgressScreen from '../screens/student/ProgressScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import SettingsScreen from '../screens/student/SettingsScreen';
import JoinClassScreen from '../screens/student/JoinClassScreen';
import SubjectModulesScreen from '../screens/student/SubjectModulesScreen';
import MaterialDetailScreen from '../screens/student/MaterialDetailScreen';
import RecommendationsScreen from '../screens/student/RecommendationsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ChangePasswordScreen from '../screens/student/ChangePasswordScreen';
import PrivacyDataScreen from '../screens/student/PrivacyDataScreen';
import HelpScreen from '../screens/student/HelpScreen';
import AboutScreen from '../screens/student/AboutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = '#7C3AED';

const TabIcon = ({ name, label, focused }: { name: any; label: string; focused: boolean }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.tabIconWrap}>
      <Ionicons name={focused ? name : `${name}-outline`} size={22} color={focused ? PURPLE : colors.textSecondary} />
      <Text
        style={[styles.tabLabel, { color: focused ? PURPLE : colors.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
};

const StudentTabs = () => {
  const { colors } = useTheme();
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        height: 65,
        paddingBottom: 8,
        paddingTop: 4,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
};

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
          <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="PrivacyData" component={PrivacyDataScreen} />
          <Stack.Screen name="JoinClass" component={JoinClassScreen} />
          <Stack.Screen name="SubjectModules" component={SubjectModulesScreen} />
          <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="AITutor" component={AITutorScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 6, width: '100%' },
  tabLabel: { fontSize: 9, fontWeight: '600', marginTop: 2, lineHeight: 11, maxWidth: '100%' },
});

export default AppNavigator;