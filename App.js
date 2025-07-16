// React & React Native core
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import TimersScreen from './screens/TimersScreen';
import PomodoroScreen from './screens/PomodoroScreen';
import SplashScreen from './screens/SplashScreen';

// Components
import CustomTabBar from './components/CustomTabBar';
import Toast from 'react-native-toast-message';
import AuthComponent from './utils/AuthComponent';
import BottomSheetChangelog from './components/BottomSheetChnageLog';

// Context Providers
import { TimerProvider } from './utils/TimerContext';
import { SecurityProvider, useSecurity } from './utils/SecurityContext';
import { ThemeProvider, useTheme } from './utils/ThemeContext';
import { DataProvider } from './utils/DataContext';

// Hooks
import { useCheckForUpdate } from './utils/useCheckForUpdate';

// Utils & Helpers
import { initializeNotifications } from './utils/Notificationhelper';
import { checkForUpdateAndReload, toastConfig } from './utils/functions';

import AsyncStorage from '@react-native-async-storage/async-storage';

export function useForceUpdateOnLoad() {
  useEffect(() => {
    checkForUpdateAndReload();
  }, []);
}

const Tab = createBottomTabNavigator();

function AppContent() {

  useForceUpdateOnLoad();
  const { variables, colors, border } = useTheme();
  const { loading } = useSecurity();
  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [showChangelog, setShowChangelog] = useCheckForUpdate();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    initializeNotifications();
  }, []);

  if ((showSplash && !splashDone) || loading) {
    return (
      <>
        <StatusBar hidden />
        <SplashScreen visible colors={colors} variables={variables} />
      </>
    );
  }

  return (
    <>
      <StatusBar hidden />
      <AuthComponent>
        <NavigationContainer>
          <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="CountUps" component={TimersScreen} initialParams={{ mode: 'countup' }} />
            <Tab.Screen name="CountDowns" component={TimersScreen} initialParams={{ mode: 'countdown' }} />
            <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
            <Tab.Screen name="About" component={AboutScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AuthComponent>
      <BottomSheetChangelog visible={showChangelog} onClose={() => setShowChangelog(false)} />
      <Toast config={toastConfig(colors, variables, border)} />
    </>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <ThemeProvider>
        <DataProvider>
          <TimerProvider>
            <AppContent />
          </TimerProvider>
        </DataProvider>
      </ThemeProvider>
    </SecurityProvider>
  );
}