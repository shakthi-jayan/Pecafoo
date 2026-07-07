import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@pecafoo/auth';
import { Card, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography, shadows } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
import restaurantsService from '../services/restaurants';
import ordersService from '../services/orders';
const BRAND = colors.brand.restaurant;

const DashboardScreen = () => {
  const { user } = useAuth();
  const { data: restaurants, isLoading: rl } = useQuery({ queryKey: ['myRestaurants'], queryFn: () => restaurantsService.getMyRestaurants().then(r => r.data) });
  const { data: orders, isLoading: ol, refetch } = useQuery({ queryKey: ['restaurantOrders'], queryFn: () => ordersService.getRestaurantOrders().then(r => r.data) });

  const restList = Array.isArray(restaurants) ? restaurants : restaurants?.results || [];
  const orderList = Array.isArray(orders) ? orders : orders?.results || [];
  const pendingOrders = orderList.filter(o => ['pending', 'confirmed'].includes(o.status));

  if (rl || ol) return <LoadingScreen color={BRAND} />;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={BRAND} />}>
        <View style={s.header}><Text style={s.greeting}>Hello, {user?.first_name} 👨‍🍳</Text><Text style={s.title}>Dashboard</Text></View>
        <View style={s.statsRow}>
          <Card style={[s.statCard, { borderLeftColor: BRAND }]}>
            <Ionicons name="restaurant-outline" size={24} color={BRAND} /><Text style={s.statNum}>{restList.length}</Text><Text style={s.statLabel}>Restaurants</Text>
          </Card>
          <Card style={[s.statCard, { borderLeftColor: colors.semantic.warning }]}>
            <Ionicons name="time-outline" size={24} color={colors.semantic.warning} /><Text style={s.statNum}>{pendingOrders.length}</Text><Text style={s.statLabel}>Pending</Text>
          </Card>
          <Card style={[s.statCard, { borderLeftColor: colors.semantic.success }]}>
            <Ionicons name="receipt-outline" size={24} color={colors.semantic.success} /><Text style={s.statNum}>{orderList.length}</Text><Text style={s.statLabel}>Total Orders</Text>
          </Card>
        </View>
        <View style={s.section}><Text style={s.sectionTitle}>Recent Orders</Text>
          {pendingOrders.slice(0, 5).map(order => (
            <Card key={order.id} style={s.orderCard}><Text style={s.orderId}>#{order.id}</Text><Text style={s.orderStatus}>{order.status}</Text></Card>
          ))}
          {pendingOrders.length === 0 && <Text style={s.empty}>No pending orders</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase }, header: { padding: spacing.lg }, greeting: { fontSize: typography.sizes.body, color: colors.textSecondary },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm }, statCard: { flex: 1, alignItems: 'center', borderLeftWidth: 3, paddingVertical: spacing.md },
  statNum: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.xs }, statLabel: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
  section: { padding: spacing.lg }, sectionTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  orderCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }, orderId: { fontWeight: typography.weights.semibold, color: colors.textPrimary },
  orderStatus: { color: colors.textSecondary, textTransform: 'capitalize' }, empty: { color: colors.textTertiary, fontSize: typography.sizes.body },
});
export default DashboardScreen;
