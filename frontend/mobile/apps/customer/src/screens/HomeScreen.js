import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@pecafoo/auth';
import { Card, SearchBar, Avatar, Badge } from '@pecafoo/ui';
import { colors, spacing, typography, shadows } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
import restaurantsService from '../services/restaurants';

const BRAND = colors.brand.customer;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['platformCategories'],
    queryFn: () => restaurantsService.getPlatformCategories().then(r => r.data),
  });

  const { data: restaurants, isLoading: restLoading, refetch } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantsService.getAll().then(r => r.data),
  });

  const restaurantList = Array.isArray(restaurants) ? restaurants : restaurants?.results || [];
  const categoryList = Array.isArray(categories) ? categories : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={BRAND} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.first_name || 'there'} 👋</Text>
            <Text style={styles.tagline}>What would you like to eat?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Search')} style={styles.searchWrapper}>
          <SearchBar value="" onChangeText={() => {}} placeholder="Search restaurants, dishes..." editable={false} />
        </TouchableOpacity>

        {/* Categories */}
        {categoryList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={categoryList}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryChip}
                  onPress={() => navigation.navigate('Search', { category: item.id })}
                >
                  <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants near you</Text>
          {restaurantList.map((restaurant) => (
            <Card
              key={restaurant.id || restaurant.slug}
              style={styles.restaurantCard}
              onPress={() => navigation.navigate('RestaurantDetail', { slug: restaurant.slug })}
            >
              <View style={styles.restaurantInfo}>
                <Avatar uri={restaurant.logo} name={restaurant.name} size={48} color={BRAND} />
                <View style={styles.restaurantMeta}>
                  <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine} numberOfLines={1}>{restaurant.cuisine_type || restaurant.description || ''}</Text>
                  <View style={styles.restaurantStats}>
                    {restaurant.average_rating && (
                      <View style={styles.statRow}>
                        <Ionicons name="star" size={14} color="#FFCC00" />
                        <Text style={styles.statText}>{restaurant.average_rating}</Text>
                      </View>
                    )}
                    {restaurant.delivery_time && (
                      <View style={styles.statRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                        <Text style={styles.statText}>{restaurant.delivery_time} min</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {restaurant.is_open === false && <Badge label="Closed" variant="error" style={styles.closedBadge} />}
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm },
  greeting: { fontSize: typography.sizes.body, color: colors.textSecondary },
  tagline: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.xs },
  searchWrapper: { paddingHorizontal: spacing.lg, marginBottom: spacing.base },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  categoryList: { gap: spacing.sm },
  categoryChip: { backgroundColor: `${BRAND}15`, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: 9999 },
  categoryText: { fontSize: typography.sizes.bodySmall, fontWeight: typography.weights.medium, color: BRAND },
  restaurantCard: { marginBottom: spacing.md },
  restaurantInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  restaurantMeta: { flex: 1 },
  restaurantName: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  restaurantCuisine: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
  restaurantStats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: typography.sizes.caption, color: colors.textSecondary },
  closedBadge: { position: 'absolute', top: spacing.base, right: spacing.base },
});

export default HomeScreen;
