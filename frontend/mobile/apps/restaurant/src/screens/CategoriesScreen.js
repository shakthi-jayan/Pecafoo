import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import restaurantsService from '../services/restaurants';
const BRAND = colors.brand.restaurant;

const CategoriesScreen = ({ navigation }) => {
  const { data: restaurants } = useQuery({ queryKey: ['myRestaurants'], queryFn: () => restaurantsService.getMyRestaurants().then(r => r.data) });
  const restList = Array.isArray(restaurants) ? restaurants : restaurants?.results || [];
  const firstRest = restList[0];
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories', firstRest?.id], queryFn: () => restaurantsService.getCategories(firstRest.id).then(r => r.data), enabled: !!firstRest?.id });
  const catList = Array.isArray(categories) ? categories : categories?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title="Categories" />
      <FlatList data={catList} keyExtractor={i => i.id?.toString()} contentContainerStyle={s.list}
        ListEmptyComponent={<EmptyState icon="albums-outline" title="No categories" message="Add menu categories" />}
        renderItem={({ item }) => (<Card style={s.card} onPress={() => navigation.navigate('MenuItems', { restaurantId: firstRest?.id, categoryId: item.id, categoryName: item.name })}><Text style={s.name}>{item.name}</Text></Card>)} />
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, list: { padding: spacing.base, gap: spacing.sm, flexGrow: 1 }, card: {}, name: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary } });
export default CategoriesScreen;
