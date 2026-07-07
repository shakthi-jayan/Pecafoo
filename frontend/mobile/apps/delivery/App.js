import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@pecafoo/auth';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import RootNavigator from './src/navigation/RootNavigator';

Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '', debug: false });

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } } });

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><QueryClientProvider client={queryClient}>
      <AuthProvider defaultRole="delivery_partner"><StatusBar style="dark" /><RootNavigator /></AuthProvider>
    </QueryClientProvider></SafeAreaProvider></GestureHandlerRootView>
  );
}
export default Sentry.wrap(App);
