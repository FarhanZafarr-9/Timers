// React & React Native core
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Gesture Handler
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import Home from './screens/Home';
import Settings from './screens/Settings';
import About from './screens/About';
import Timers from './screens/Timers';
import Pomodoro from './screens/Pomodoro';
import Splash from './screens/Splash';

// Components
import NavBar from './components/navigation/NavBar';
import Toast from 'react-native-toast-message';
import AuthContext from './contexts/AuthContext';
import ChangeLogSheet from './components/sheets/ChangeLogSheet';

// Context Providers
import { TimerProvider } from './contexts/TimerContext';
import { SecurityProvider, useSecurity } from './contexts/SecurityContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NavBarProvider } from './contexts/NavContext';

// Hooks
import { useCheckForUpdate } from './utils/updates/updateUtils';

// Utils & Helpers
import { requestNotificationPermissions } from './utils/notifications/Notify';
import { checkForUpdateAndReload, toastConfig } from './utils/functions';
import { setupIgnoredWarnings } from './utils/warnings/ignoreWarnings';

setupIgnoredWarnings();

export async function runUpdateCheck() {
  await checkForUpdateAndReload();
}

const Tab = createBottomTabNavigator();

function AppContent() {
  const { variables, colors, border } = useTheme();
  const { loading } = useSecurity();
  const [showSplash, setShowSplash] = useState(true);
  const [showChangelog, setShowChangelog] = useCheckForUpdate();

  useEffect(() => {
    const runStartup = async () => {
      await runUpdateCheck();
      await new Promise((res) => setTimeout(res, 900));
      setShowSplash(false);
    };
    runStartup();
  }, []);

  useEffect(() => {
    requestNotificationPermissions();
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
      <ChangeLogSheet visible={showChangelog} onClose={() => setShowChangelog(false)} />
      <Toast config={toastConfig(colors, variables, border)} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SecurityProvider>
        <ThemeProvider>
          <NavBarProvider>
            <TimerProvider>
              <AppContent />
            </TimerProvider>
          </NavBarProvider>
        </ThemeProvider>
      </SecurityProvider>
    </GestureHandlerRootView>
  );
}