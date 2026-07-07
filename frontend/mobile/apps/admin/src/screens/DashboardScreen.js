import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';

const DashboardScreen = () => (
  <View style={s.container}>
    <Card style={s.card}><Text style={s.title}>Platform Health</Text><Text style={s.val}>All systems operational</Text></Card>
    <Card style={s.card}><Text style={s.title}>Pending Verifications</Text><Text style={s.val}>12 Restaurants</Text></Card>
  </View>
);
const s = StyleSheet.create({ container: { flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bgBase }, card: { padding: spacing.lg }, title: { fontSize: typography.sizes.body, color: colors.textSecondary }, val: { fontSize: typography.sizes.h2, fontWeight: 'bold', color: colors.textPrimary, marginTop: spacing.sm } });
export default DashboardScreen;
