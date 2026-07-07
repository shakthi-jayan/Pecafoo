import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, Badge, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@pecafoo/utils';
import ordersService from '../services/orders';
const BRAND = colors.brand.restaurant;

const OrdersScreen = ({ navigation }) => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['restaurantOrders'], queryFn: () => ordersService.getRestaurantOrders().then(r => r.data) });
  const orders = Array.isArray(data) ? data : data?.results || [];
  if (isLoading) return <LoadingScreen color={BRAND} />;
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title="Orders" />
      <FlatList data={orders} keyExtractor={i => i.id?.toString()} contentContainerStyle={s.list}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders" />}
        renderItem={({ item }) => (
          <Card style={s.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={s.row}><Text style={s.id}>#{item.id}</Text><Badge label={ORDER_STATUS_LABELS[item.status] || item.status} variant={item.status === 'delivered' ? 'success' : 'info'} /></View>
            <Text style={s.total}>{formatCurrency(item.total)} · {formatDate(item.created_at, 'relative')}</Text>
          </Card>
        )} />
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, list: { padding: spacing.base, gap: spacing.sm }, card: {}, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }, id: { fontWeight: typography.weights.bold, fontSize: typography.sizes.body, color: colors.textPrimary }, total: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary } });
export default OrdersScreen;
