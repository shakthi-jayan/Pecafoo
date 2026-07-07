import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, Avatar, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { View, Text } from 'react-native';
import customersService from '../services/customers';

const BRAND = colors.brand.customer;

const WishlistScreen = ({ navigation }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => customersService.getWishlist().then(r => r.data),
  });

  const items = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Wishlist" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="heart-outline" title="No favourites" message="Save restaurants you love" />}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('Home', { screen: 'RestaurantDetail', params: { slug: item.restaurant_slug || item.slug } })}>
            <View style={styles.row}>
              <Avatar uri={item.restaurant_logo || item.logo} name={item.restaurant_name || item.name} size={44} color={BRAND} />
              <View style={styles.meta}>
                <Text style={styles.name}>{item.restaurant_name || item.name}</Text>
                <Text style={styles.sub}>{item.cuisine_type || ''}</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  list: { padding: spacing.base, gap: spacing.sm, flexGrow: 1 },
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meta: { flex: 1 },
  name: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  sub: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
});

export default WishlistScreen;
