import { useEffect, useState } from 'react';
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
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './utils/ThemeContext';
import { DataProvider } from './utils/DataContext';
import SplashScreen from './screens/SplashScreen';

const Tab = createBottomTabNavigator();

async function setupNotificationChannel() {
  await Notifications.setNotificationChannelAsync('timer-alerts', {
    name: 'Timer Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibrationPattern: [0, 250, 250, 250],
  });
}

function AppContent() {
  const { variables, colors } = useTheme();
  const { loading } = useSecurity();
  const [showSplash, setShowSplash] = useState(true);

  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      await setupNotificationChannel();

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    setupNotifications();
  }, []);

  if ((showSplash && !splashDone) || loading) {
    return (
      <>
        <StatusBar hidden />
        <SplashScreen visible={(showSplash && !splashDone) || loading} colors={colors} variables={variables} />
      </>
    );
  }

  return (
    <>
      <StatusBar hidden />
      <Toast
        position="bottom"
        bottomOffset={20}
        visibilityTime={2000}
        autoHide={true}
        topOffset={0}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        textStyle={{ color: 'white', fontSize: 16, fontWeight: '500' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
      />
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