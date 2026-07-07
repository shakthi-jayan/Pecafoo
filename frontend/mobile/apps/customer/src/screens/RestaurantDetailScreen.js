import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, Avatar, Badge, LoadingScreen, ErrorScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@pecafoo/utils';
import restaurantsService from '../services/restaurants';

const BRAND = colors.brand.customer;

const RestaurantDetailScreen = ({ navigation, route }) => {
  const { slug } = route.params;

  const { data: restaurant, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => restaurantsService.getBySlug(slug).then(r => r.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['restaurantReviews', slug],
    queryFn: () => restaurantsService.getReviews(slug).then(r => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingScreen color={BRAND} />;
  if (isError) return <ErrorScreen onRetry={refetch} color={BRAND} />;

  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.results || [];
  const menuItems = restaurant?.menu_items || restaurant?.items || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={restaurant?.name || 'Restaurant'} onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={BRAND} />}>
        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Avatar uri={restaurant?.logo} name={restaurant?.name} size={64} color={BRAND} />
          <View style={styles.infoMeta}>
            <Text style={styles.name}>{restaurant?.name}</Text>
            <Text style={styles.cuisine}>{restaurant?.cuisine_type || restaurant?.description || ''}</Text>
            <View style={styles.statsRow}>
              {restaurant?.average_rating && (
                <View style={styles.stat}><Ionicons name="star" size={14} color="#FFCC00" /><Text style={styles.statText}>{restaurant.average_rating}</Text></View>
              )}
              {restaurant?.delivery_time && (
                <View style={styles.stat}><Ionicons name="time-outline" size={14} color={colors.textTertiary} /><Text style={styles.statText}>{restaurant.delivery_time} min</Text></View>
              )}
            </View>
          </View>
          <Badge label={restaurant?.is_open ? 'Open' : 'Closed'} variant={restaurant?.is_open ? 'success' : 'error'} />
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menuItems.map((item) => (
            <Card key={item.id} style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.menuDesc} numberOfLines={2}>{item.description || ''}</Text>
                  <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
                </View>
                {item.image && <Avatar uri={item.image} name={item.name} size={60} color={BRAND} />}
              </View>
            </Card>
          ))}
          {menuItems.length === 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Menu', { slug })} style={styles.viewMenuBtn}>
              <Text style={[styles.viewMenuText, { color: BRAND }]}>View Full Menu →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.slice(0, 5).map((review, idx) => (
              <Card key={review.id || idx} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Avatar name={review.customer_name || 'User'} size={32} color={BRAND} />
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{review.customer_name || 'Customer'}</Text>
                    <View style={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons key={i} name={i < (review.rating || 0) ? 'star' : 'star-outline'} size={12} color="#FFCC00" />
                      ))}
                    </View>
                  </View>
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  infoSection: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md, alignItems: 'flex-start' },
  infoMeta: { flex: 1 },
  name: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary },
  cuisine: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: typography.sizes.caption, color: colors.textSecondary },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  menuCard: { marginBottom: spacing.sm },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  menuInfo: { flex: 1 },
  menuName: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  menuDesc: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: 2 },
  menuPrice: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: BRAND, marginTop: spacing.xs },
  viewMenuBtn: { padding: spacing.md, alignItems: 'center' },
  viewMenuText: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold },
  reviewCard: { marginBottom: spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: typography.sizes.bodySmall, fontWeight: typography.weights.medium, color: colors.textPrimary },
  stars: { flexDirection: 'row', marginTop: 2 },
  reviewComment: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
});

export default RestaurantDetailScreen;
