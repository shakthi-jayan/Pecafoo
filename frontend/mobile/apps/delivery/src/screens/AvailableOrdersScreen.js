import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, Card, EmptyState, LoadingScreen, Button } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency, formatDistance } from '@pecafoo/utils';
import ordersService from '../services/orders';
import deliveryService from '../services/delivery';
const BRAND = colors.brand.delivery;

const AvailableOrdersScreen = ({ navigation }) => {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({ queryKey: ['availableOrders'], queryFn: () => ordersService.getAvailableOrders().then(r => r.data) });
  const acceptMutation = useMutation({ mutationFn: (id) => deliveryService.acceptOrder(id), onSuccess: (_, id) => { qc.invalidateQueries(['availableOrders']); navigation.navigate('CurrentDelivery', { orderId: id }); } });
  const orders = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title="Available Orders" />
      <FlatList data={orders} keyExtractor={i => i.id?.toString()} contentContainerStyle={s.list} refreshing={false} onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="list-outline" title="No orders nearby" />}
        renderItem={({ item }) => (
          <Card style={s.card}>
            <View style={s.row}><Text style={s.restaurant}>{item.restaurant_name}</Text><Text style={s.earnings}>{formatCurrency(item.delivery_fee || 50)}</Text></View>
            <View style={s.details}><Text style={s.address}>To: {item.delivery_address?.label || 'Customer'}</Text>{item.distance && <Text style={s.distance}>{formatDistance(item.distance)}</Text>}</View>
            <Button title="Accept Delivery" onPress={() => acceptMutation.mutate(item.id)} loading={acceptMutation.isPending} color={BRAND} style={s.btn} />
          </Card>
        )} />
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, list: { padding: spacing.base, gap: spacing.sm }, card: { padding: spacing.lg }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, restaurant: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.textPrimary }, earnings: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: BRAND }, details: { marginTop: spacing.md, marginBottom: spacing.lg }, address: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary }, distance: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: 4 }, btn: { marginTop: 'auto' } });
export default AvailableOrdersScreen;
