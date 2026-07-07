import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { SearchBar, Card, Avatar, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
import restaurantsService from '../services/restaurants';

const BRAND = colors.brand.customer;

const SearchScreen = ({ navigation, route }) => {
  const [query, setQuery] = useState('');
  const initialCategory = route.params?.category;

  const { data, isLoading } = useQuery({
    queryKey: ['searchRestaurants', query, initialCategory],
    queryFn: () => restaurantsService.getAll({ search: query || undefined, category: initialCategory || undefined }).then(r => r.data),
    enabled: true,
  });

  const results = Array.isArray(data) ? data : data?.results || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search restaurants, dishes..." autoFocus />
        </View>
      </View>

      {isLoading ? (
        <LoadingScreen color={BRAND} />
      ) : results.length === 0 ? (
        <EmptyState icon="search-outline" title="No results" message={query ? `No restaurants found for "${query}"` : 'Start searching'} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id?.toString() || item.slug}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.resultCard} onPress={() => navigation.navigate('RestaurantDetail', { slug: item.slug })}>
              <View style={styles.row}>
                <Avatar uri={item.logo} name={item.name} size={44} color={BRAND} />
                <View style={styles.meta}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cuisine} numberOfLines={1}>{item.cuisine_type || ''}</Text>
                </View>
                {item.average_rating && (
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={12} color="#FFCC00" />
                    <Text style={styles.rating}>{item.average_rating}</Text>
                  </View>
                )}
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  searchWrap: { flex: 1 },
  list: { padding: spacing.base, gap: spacing.sm },
  resultCard: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meta: { flex: 1 },
  name: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  cuisine: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  rating: { fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold, color: '#92400E' },
});

export default SearchScreen;
