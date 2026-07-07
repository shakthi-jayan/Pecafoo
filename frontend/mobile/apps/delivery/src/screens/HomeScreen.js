import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@pecafoo/auth';
import { Card, LoadingScreen, Button } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
import deliveryService from '../services/delivery';
const BRAND = colors.brand.delivery;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['deliveryProfile'], queryFn: () => deliveryService.getProfile().then(r => r.data) });
  const toggleMutation = useMutation({ mutationFn: (is_online) => deliveryService.toggleAvailability({ is_online }), onSuccess: () => qc.invalidateQueries(['deliveryProfile']) });

  if (isLoading) return <LoadingScreen color={BRAND} />;
  const isOnline = profile?.is_online;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}><Text style={s.greeting}>Hello, {user?.first_name} 🛵</Text><Text style={s.title}>Dashboard</Text></View>
        <Card style={s.statusCard}>
          <View style={s.statusRow}>
            <View style={s.statusInfo}>
              <Text style={s.statusTitle}>{isOnline ? "You're Online" : "You're Offline"}</Text>
              <Text style={s.statusSub}>{isOnline ? 'Waiting for delivery requests...' : 'Go online to start earning'}</Text>
            </View>
            <Switch value={isOnline} onValueChange={(val) => toggleMutation.mutate(val)} trackColor={{ true: BRAND, false: colors.border }} />
          </View>
        </Card>
        <View style={s.actions}>
          <Button title="Available Orders" onPress={() => navigation.navigate('Orders', { screen: 'Available' })} color={BRAND} style={s.btn} icon={<Ionicons name="list" size={20} color="#fff" />} />
          <Button title="Current Delivery" onPress={() => navigation.navigate('Orders', { screen: 'CurrentDelivery' })} variant="outline" color={BRAND} style={s.btn} icon={<Ionicons name="navigate-outline" size={20} color={BRAND} />} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, content: { padding: spacing.lg }, header: { marginBottom: spacing.xl }, greeting: { fontSize: typography.sizes.body, color: colors.textSecondary }, title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.xs }, statusCard: { marginBottom: spacing.xl, padding: spacing.lg }, statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, statusInfo: { flex: 1 }, statusTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary }, statusSub: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: 4 }, actions: { gap: spacing.md }, btn: { flex: 1 } });
export default HomeScreen;
