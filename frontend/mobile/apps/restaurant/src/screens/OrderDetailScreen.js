import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, Card, Badge, Button, LoadingScreen, ErrorScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency, ORDER_STATUSES, ORDER_STATUS_LABELS } from '@pecafoo/utils';
import ordersService from '../services/orders';
const BRAND = colors.brand.restaurant;

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready_for_pickup' };

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const qc = useQueryClient();
  const { data: order, isLoading, isError, refetch } = useQuery({ queryKey: ['order', orderId], queryFn: () => ordersService.getOrder(orderId).then(r => r.data) });
  const updateMutation = useMutation({ mutationFn: ({ id, status }) => ordersService.updateStatus(id, { status }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['restaurantOrders'] }); refetch(); } });

  if (isLoading) return <LoadingScreen color={BRAND} />;
  if (isError) return <ErrorScreen onRetry={refetch} color={BRAND} />;
  const nextStatus = NEXT_STATUS[order?.status];

  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title={`Order #${orderId}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.content}>
        <Card style={s.statusCard}><Badge label={ORDER_STATUS_LABELS[order?.status] || order?.status} variant="info" /></Card>
        <Text style={s.sectionTitle}>Items</Text>
        {(order?.items || []).map((item, idx) => (<View key={idx} style={s.itemRow}><Text style={s.itemName}>{item.quantity || 1}x {item.name || item.food_item_name}</Text><Text style={s.itemPrice}>{formatCurrency(item.price * (item.quantity || 1))}</Text></View>))}
        <View style={s.totalRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalVal}>{formatCurrency(order?.total)}</Text></View>
        {nextStatus && <Button title={`Mark as ${ORDER_STATUS_LABELS[nextStatus]}`} onPress={() => updateMutation.mutate({ id: orderId, status: nextStatus })} loading={updateMutation.isPending} color={BRAND} style={s.btn} />}
      </ScrollView>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, content: { padding: spacing.lg }, statusCard: { marginBottom: spacing.lg }, sectionTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md }, itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider }, itemName: { fontSize: typography.sizes.body, color: colors.textPrimary, flex: 1 }, itemPrice: { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textPrimary }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, paddingTop: spacing.base, borderTopWidth: 2, borderTopColor: colors.textPrimary }, totalLabel: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary }, totalVal: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: BRAND }, btn: { marginTop: spacing.xl } });
export default OrderDetailScreen;
