import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/utils/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/(tabs)');
      }
    })()
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Auth screens live on the root stack so they don't occupy tab bar slots */}
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
