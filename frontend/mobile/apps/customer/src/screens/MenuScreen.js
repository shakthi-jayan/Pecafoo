import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, LoadingScreen, ErrorScreen, EmptyState } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatCurrency } from '@pecafoo/utils';
import { View, Text } from 'react-native';
import restaurantsService from '../services/restaurants';

const BRAND = colors.brand.customer;

const MenuScreen = ({ navigation, route }) => {
  const { slug } = route.params;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['foodItems', slug],
    queryFn: () => restaurantsService.getFoodItems({ restaurant_slug: slug }).then(r => r.data),
  });

  const items = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;
  if (isError) return <ErrorScreen onRetry={refetch} color={BRAND} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Menu" onBack={() => navigation.goBack()} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="restaurant-outline" title="No items" message="This restaurant hasn't added any items yet." />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description && <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>}
            <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
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
  itemName: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  itemDesc: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: BRAND, marginTop: spacing.xs },
});

export default MenuScreen;
