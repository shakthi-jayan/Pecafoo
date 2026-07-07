import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { formatDate } from '@pecafoo/utils';
import { Ionicons } from '@expo/vector-icons';
import notificationsService from '../services/notifications';

const BRAND = colors.brand.customer;

const NotificationsScreen = ({ navigation }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll().then(r => r.data),
  });

  const notifications = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) return <LoadingScreen color={BRAND} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Notifications" onBack={() => navigation.goBack()} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="No notifications" message="You're all caught up!" />}
        renderItem={({ item }) => (
          <Card style={[styles.card, !item.is_read && styles.unread]}>
            <View style={styles.row}>
              <Ionicons name="notifications" size={20} color={item.is_read ? colors.textTertiary : BRAND} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{formatDate(item.created_at, 'relative')}</Text>
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
  unread: { borderLeftWidth: 3, borderLeftColor: colors.brand.customer },
  row: { flexDirection: 'row', gap: spacing.md },
  info: { flex: 1 },
  title: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  message: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: 2 },
  time: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: spacing.xs },
});

export default NotificationsScreen;
