import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import CustomTabBar from './components/CustomTabBar';
import TimersScreen from './screens/TimersScreen';
import { TimerProvider } from './utils/TimerContext';
import { StatusBar } from 'expo-status-bar';

import { SecurityProvider, useSecurity } from './utils/SecurityContext';
import AuthComponent from './utils/AuthComponent';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './utils/ThemeContext';
import { DataProvider } from './utils/DataContext';
import SplashScreen from './screens/SplashScreen';
import { useCheckForUpdate } from './utils/useCheckForUpdate';
import BottomSheetChangelog from './components/BottomSheetChnageLog';

import { initializeNotifications } from './utils/Notificationhelper';
import * as Notifications from 'expo-notifications';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { variables, colors } = useTheme();
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

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
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
            <Tab.Screen name="Settings" component={SettingsScreen} />
            <Tab.Screen name="About" component={AboutScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AuthComponent>
      <BottomSheetChangelog visible={showChangelog} onClose={() => setShowChangelog(false)} />
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