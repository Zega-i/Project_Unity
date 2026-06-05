import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { authStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';

// ── Auth ──────────────────────────────────────────────
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// ── Student ───────────────────────────────────────────
import DashboardScreen from '../screens/student/DashboardScreen';
import ClassScreen from '../screens/student/ClassScreen';
import QuizScreen from '../screens/student/QuizScreen';
import AssignmentsScreen from '../screens/student/AssignmentsScreen';
import MaterialsScreen from '../screens/student/MaterialsScreen';
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

// ── Teacher ───────────────────────────────────────────
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import TeacherClassScreen from '../screens/teacher/TeacherClassScreen';
import TeacherStudentsScreen from '../screens/teacher/TeacherStudentsScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';
import TeacherClassDetailScreen from '../screens/teacher/TeacherClassDetailScreen';
import TeacherStudentDetailScreen from '../screens/teacher/TeacherStudentDetailScreen';
import TeacherAddMaterialScreen from '../screens/teacher/TeacherAddMaterialScreen';
import TeacherAddAssignmentScreen from '../screens/teacher/TeacherAddAssignmentScreen';
import TeacherAddClassScreen from '../screens/teacher/TeacherAddClassScreen';
import TeacherAddQuizScreen from '../screens/teacher/TeacherAddQuizScreen';
import TeacherAIScreen from '../screens/teacher/TeacherAIScreen';
import TeacherAnalyticsScreen from '../screens/teacher/TeacherAnalyticsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const PURPLE = '#7C3AED';
const GREEN  = '#16A34A';

const TabIcon = ({
  name, label, focused, accentColor,
}: {
  name: any; label: string; focused: boolean; accentColor: string;
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.tabIconWrap}>
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={22}
        color={focused ? accentColor : colors.textSecondary}
      />
      <Text
        style={[styles.tabLabel, { color: focused ? accentColor : colors.textSecondary }]}
        numberOfLines={1}
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
          height: 65, paddingBottom: 8, paddingTop: 4,
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          elevation: 0, shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="StudentDashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Beranda" focused={focused} accentColor={PURPLE} /> }}
      />
      <Tab.Screen
        name="Kelas"
        component={ClassScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="library" label="Kelas" focused={focused} accentColor={PURPLE} /> }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" label="Progress" focused={focused} accentColor={PURPLE} /> }}
      />
      <Tab.Screen
        name="StudentProfile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" label="Profil" focused={focused} accentColor={PURPLE} /> }}
      />
    </Tab.Navigator>
  );
};

const TeacherTabs = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 65, paddingBottom: 8, paddingTop: 4,
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          elevation: 0, shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="TeacherDashboard"
        component={TeacherDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Beranda" focused={focused} accentColor={GREEN} /> }}
      />
      <Tab.Screen
        name="TeacherKelas"
        component={TeacherClassScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="library" label="Kelas" focused={focused} accentColor={GREEN} /> }}
      />
      <Tab.Screen
        name="TeacherAI"
        component={TeacherAIScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="sparkles" label="AI" focused={focused} accentColor={GREEN} /> }}
      />
      <Tab.Screen
        name="TeacherInsight"
        component={TeacherAnalyticsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" label="Insight" focused={focused} accentColor={GREEN} /> }}
      />
      <Tab.Screen
        name="TeacherProfil"
        component={TeacherProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" label="Profil" focused={focused} accentColor={GREEN} /> }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const user = authStore.getUserSync();
  const isTeacher = user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'guru';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Splash"    component={SplashScreen}    />
          <Stack.Screen name="Login"     component={LoginScreen}     />
          <Stack.Screen name="Register"  component={RegisterScreen}  />
        </>
      ) : (
        <>
          {isTeacher ? (
            <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
          ) : (
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
          )}

          {/* Shared Details */}
          <Stack.Screen name="Settings"        component={SettingsScreen}       />
          <Stack.Screen name="Help"            component={HelpScreen}           />
          <Stack.Screen name="About"           component={AboutScreen}          />
          <Stack.Screen name="ChangePassword"  component={ChangePasswordScreen} />
          <Stack.Screen name="PrivacyData"     component={PrivacyDataScreen}    />

          {/* Teacher Only */}
          <Stack.Screen name="TeacherClassDetail"   component={TeacherClassDetailScreen} />
          <Stack.Screen name="TeacherStudentDetail" component={TeacherStudentDetailScreen} />
          <Stack.Screen name="TeacherAddClass"      component={TeacherAddClassScreen}    />
          <Stack.Screen name="TeacherAddQuiz"       component={TeacherAddQuizScreen}     />
          <Stack.Screen name="TeacherAddMaterial"   component={TeacherAddMaterialScreen} />
          <Stack.Screen name="TeacherAddAssignment" component={TeacherAddAssignmentScreen} />
          <Stack.Screen name="TeacherAIChat"        component={TeacherAIScreen} />
          <Stack.Screen name="TeacherAnalytics"     component={TeacherAnalyticsScreen} />

          {/* Student Only */}
          <Stack.Screen name="Recommendations" component={RecommendationsScreen}/>
          <Stack.Screen name="Notifications"   component={NotificationsScreen}  />
          <Stack.Screen name="JoinClass"       component={JoinClassScreen}      />
          <Stack.Screen name="SubjectModules"  component={SubjectModulesScreen} />
          <Stack.Screen name="MaterialDetail"  component={MaterialDetailScreen} />
          <Stack.Screen name="Quiz"            component={QuizScreen}           />
          <Stack.Screen name="Assignments"     component={AssignmentsScreen}    />
          <Stack.Screen name="Materials"       component={MaterialsScreen}      />
          <Stack.Screen name="AITutor"         component={AITutorScreen}        />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 6, width: '100%' },
  tabLabel:    { fontSize: 9, fontWeight: '600', marginTop: 2, lineHeight: 11 },
});

export default AppNavigator;