import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';

const AnalyticsScreen = () => (
  <SafeAreaView style={s.container} edges={['top']}><Header title="Analytics" />
    <View style={s.content}><Text style={s.title}>Analytics</Text><Text style={s.sub}>Detailed analytics and reports will be available here.</Text></View>
  </SafeAreaView>
);
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, title: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary }, sub: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' } });
export default AnalyticsScreen;
