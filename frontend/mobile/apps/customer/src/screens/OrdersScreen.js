import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, Badge, EmptyState, LoadingScreen, ErrorScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@pecafoo/utils';
import ordersService from '../services/orders';

const BRAND = colors.brand.customer;

const statusVariant = (status) => {
  if (['delivered'].includes(status)) return 'success';
  if (['cancelled'].includes(status)) return 'error';
  if (['pending'].includes(status)) return 'warning';
  return 'info';
};

const OrdersScreen = ({ navigation }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => ordersService.getMyOrders().then(r => r.data),
  });

  const orders = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;
  if (isError) return <ErrorScreen onRetry={refetch} color={BRAND} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Orders" />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders yet" message="Your orders will appear here" />}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <Badge label={ORDER_STATUS_LABELS[item.status] || item.status} variant={statusVariant(item.status)} />
            </View>
            <Text style={styles.restaurant}>{item.restaurant_name || 'Restaurant'}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.total}>{formatCurrency(item.total)}</Text>
              <Text style={styles.date}>{formatDate(item.created_at, 'relative')}</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  list: { padding: spacing.base, gap: spacing.sm },
  card: {},
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  orderId: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.textPrimary },
  restaurant: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: BRAND },
  date: { fontSize: typography.sizes.caption, color: colors.textTertiary },
});

export default OrdersScreen;
