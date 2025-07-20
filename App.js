// React & React Native core
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import Home from './screens/Home';
import Settings from './screens/Settings';
import About from './screens/About';
import Timers from './screens/Timers';
import Pomodoro from './screens/Pomodoro';
import Splash from './screens/Splash';

// Components
import NavBar from './components/NavBar';
import Toast from 'react-native-toast-message';
import AuthContext from './utils/AuthContext';
import ChnageLogSheet from './components/ChnageLogSheet';

// Context Providers
import { TimerProvider } from './utils/TimerContext';
import { SecurityProvider, useSecurity } from './utils/SecurityContext';
import { ThemeProvider, useTheme } from './utils/ThemeContext';
import { NavBarProvider } from './utils/NavContext';

// Hooks
import { useCheckForUpdate } from './utils/useCheckForUpdate';

// Utils & Helpers
import { initializeNotifications } from './utils/Notify';
import { checkForUpdateAndReload, toastConfig } from './utils/functions';

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
  const [showChangelog, setShowChangelog] = useCheckForUpdate();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    initializeNotifications();
  }, []);

  if (showSplash || loading) {
    return (
      <>
        <StatusBar hidden />
        <Splash visible colors={colors} variables={variables} />
      </>
    );
  }

  return (
    <>
      <StatusBar hidden />
      <AuthContext>
        <NavigationContainer>
          <Tab.Navigator
            tabBar={(props) => <NavBar {...props} />}
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="CountUps" component={Timers} initialParams={{ mode: 'countup' }} />
            <Tab.Screen name="CountDowns" component={Timers} initialParams={{ mode: 'countdown' }} />
            <Tab.Screen name="Pomodoro" component={Pomodoro} />
            <Tab.Screen name="Settings" component={Settings} />
            <Tab.Screen name="About" component={About} />
          </Tab.Navigator>
        </NavigationContainer>
      </AuthContext>
      <ChnageLogSheet visible={showChangelog} onClose={() => setShowChangelog(false)} />
      <Toast config={toastConfig(colors, variables, border)} />
    </>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <ThemeProvider>
        <NavBarProvider>
          <TimerProvider>
            <AppContent />
          </TimerProvider>
        </NavBarProvider>
      </ThemeProvider>
    </SecurityProvider>
  );
}