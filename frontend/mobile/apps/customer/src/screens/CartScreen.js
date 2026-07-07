import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, EmptyState, LoadingScreen, Badge } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency } from '@pecafoo/utils';
import customersService from '../services/customers';

const BRAND = colors.brand.customer;

const CartScreen = ({ navigation }) => {
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => customersService.getCart().then(r => r.data),
  });

  const items = cartData?.items || [];
  const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  if (isLoading) return <LoadingScreen color={BRAND} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Your Cart" />
      {items.length === 0 ? (
        <EmptyState icon="cart-outline" title="Cart is empty" message="Add items from a restaurant to get started" />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price * (item.quantity || 1))}</Text>
                </View>
              </Card>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.checkoutBtn}>
              <Text style={styles.checkoutText} onPress={() => navigation.navigate('Checkout')}>Proceed to Checkout</Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  list: { padding: spacing.base, gap: spacing.sm },
  itemCard: {},
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  itemQty: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.textPrimary },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.bgCard },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.base },
  totalLabel: { fontSize: typography.sizes.h3, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  totalValue: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: BRAND },
  checkoutBtn: { backgroundColor: BRAND, padding: spacing.base, borderRadius: 16, alignItems: 'center' },
  checkoutText: { color: '#FFFFFF', fontSize: typography.sizes.body, fontWeight: typography.weights.semibold },
});

export default CartScreen;
