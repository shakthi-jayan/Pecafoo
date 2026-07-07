import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency } from '@pecafoo/utils';
import restaurantsService from '../services/restaurants';
const BRAND = colors.brand.restaurant;

const MenuItemsScreen = ({ navigation, route }) => {
  const { restaurantId, categoryName } = route.params;
  const { data, isLoading } = useQuery({ queryKey: ['menuItems', restaurantId], queryFn: () => restaurantsService.getMenuItems(restaurantId).then(r => r.data) });
  const items = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title={categoryName || 'Menu Items'} onBack={() => navigation.goBack()} />
      <FlatList data={items} keyExtractor={i => i.id?.toString()} contentContainerStyle={s.list}
        ListEmptyComponent={<EmptyState icon="fast-food-outline" title="No items" message="Add menu items" />}
        renderItem={({ item }) => (<Card style={s.card}><Text style={s.name}>{item.name}</Text><Text style={s.price}>{formatCurrency(item.price)}</Text>{item.is_available === false && <Text style={s.unavail}>Unavailable</Text>}</Card>)} />
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, list: { padding: spacing.base, gap: spacing.sm, flexGrow: 1 }, card: {}, name: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary }, price: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: BRAND, marginTop: spacing.xs }, unavail: { fontSize: typography.sizes.caption, color: colors.semantic.error, marginTop: 2 } });
export default MenuItemsScreen;
