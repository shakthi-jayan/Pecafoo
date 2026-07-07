import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Header, Card, EmptyState, LoadingScreen } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
import customersService from '../services/customers';

const BRAND = colors.brand.customer;

const AddressesScreen = ({ navigation }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => customersService.getAddresses().then(r => r.data),
  });

  const addresses = Array.isArray(data) ? data : [];

  if (isLoading) return <LoadingScreen color={BRAND} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Addresses" onBack={() => navigation.goBack()} />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="location-outline" title="No addresses" message="Add a delivery address" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="location" size={20} color={BRAND} />
              <View style={styles.info}>
                <Text style={styles.label}>{item.label || 'Address'}</Text>
                <Text style={styles.address} numberOfLines={2}>{item.address_line || item.full_address || ''}</Text>
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
  row: { flexDirection: 'row', gap: spacing.md },
  info: { flex: 1 },
  label: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  address: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: 2 },
});

export default AddressesScreen;
