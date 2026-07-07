import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, Badge, LoadingScreen, ErrorScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@pecafoo/utils';
import ordersService from '../services/orders';

const BRAND = colors.brand.customer;

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrder(orderId).then(r => r.data),
  });

  if (isLoading) return <LoadingScreen color={BRAND} />;
  if (isError) return <ErrorScreen onRetry={refetch} color={BRAND} />;

  const items = order?.items || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={`Order #${orderId}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.statusCard}>
          <Badge label={ORDER_STATUS_LABELS[order?.status] || order?.status} variant="info" />
          <Text style={styles.date}>{formatDate(order?.created_at, 'long')}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Items</Text>
        {items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.quantity || 1}x {item.name || item.food_item_name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price * (item.quantity || 1))}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order?.total)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  date: { fontSize: typography.sizes.caption, color: colors.textSecondary },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  itemName: { fontSize: typography.sizes.body, color: colors.textPrimary, flex: 1 },
  itemPrice: { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, paddingTop: spacing.base, borderTopWidth: 2, borderTopColor: colors.textPrimary },
  totalLabel: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary },
  totalValue: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: BRAND },
});

export default OrderDetailScreen;
