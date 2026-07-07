import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '@pecafoo/auth';
import { LoadingScreen } from '@pecafoo/ui';
import { colors } from '@pecafoo/theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import UsersScreen from '../screens/UsersScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const BRAND = colors.brand.admin;

const AuthStack = () => (<Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Login" component={LoginScreen} /></Stack.Navigator>);

const MainDrawer = () => (
  <Drawer.Navigator screenOptions={{ headerTintColor: BRAND, drawerActiveTintColor: BRAND }}>
    <Drawer.Screen name="Dashboard" component={DashboardScreen} />
    <Drawer.Screen name="Restaurants" component={RestaurantsScreen} />
    <Drawer.Screen name="Orders" component={OrdersScreen} />
    <Drawer.Screen name="Users" component={UsersScreen} />
    <Drawer.Screen name="Settings" component={SettingsScreen} />
  </Drawer.Navigator>
);

export default function RootNavigator() {
  const { isAuthenticated, loading, activeRole } = useAuth();
  if (loading) return <LoadingScreen color={BRAND} />;
  // Only allow admin role
  const isReady = isAuthenticated && activeRole === 'admin';
  return <NavigationContainer>{isReady ? <MainDrawer /> : <AuthStack />}</NavigationContainer>;
}
