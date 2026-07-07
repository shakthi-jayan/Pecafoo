import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@pecafoo/auth';
import { LoadingScreen } from '@pecafoo/ui';
import { colors } from '@pecafoo/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerificationScreen from '../screens/VerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import AvailableOrdersScreen from '../screens/AvailableOrdersScreen';
import CurrentDeliveryScreen from '../screens/CurrentDeliveryScreen';
import MapScreen from '../screens/MapScreen';
import EarningsScreen from '../screens/EarningsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const BRAND = colors.brand.delivery;

const AuthStack = () => (<Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Login" component={LoginScreen} /><Stack.Screen name="Register" component={RegisterScreen} /><Stack.Screen name="Verification" component={VerificationScreen} /></Stack.Navigator>);
const OrdersStack = () => (<Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Available" component={AvailableOrdersScreen} /><Stack.Screen name="CurrentDelivery" component={CurrentDeliveryScreen} /></Stack.Navigator>);
const EarningsStack = () => (<Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="EarningsMain" component={EarningsScreen} /><Stack.Screen name="History" component={HistoryScreen} /></Stack.Navigator>);

const MainTabs = () => (<Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: BRAND, tabBarInactiveTintColor: colors.textTertiary, tabBarStyle: { backgroundColor: colors.bgCard, borderTopColor: colors.divider, height: 60, paddingBottom: 4 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }, tabBarIcon: ({ color, size }) => { const icons = { Home: 'home', Orders: 'list', Map: 'map', Earnings: 'wallet', Profile: 'person' }; return <Ionicons name={`${icons[route.name]}-outline`} size={size} color={color} />; } })}>
  <Tab.Screen name="Home" component={HomeScreen} /><Tab.Screen name="Orders" component={OrdersStack} /><Tab.Screen name="Map" component={MapScreen} /><Tab.Screen name="Earnings" component={EarningsStack} /><Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>);

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen color={BRAND} />;
  return <NavigationContainer>{isAuthenticated ? <MainTabs /> : <AuthStack />}</NavigationContainer>;
}
