import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Header } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
const BRAND = colors.brand.restaurant;

const VerificationScreen = ({ navigation }) => (
  <SafeAreaView style={s.container}><Header title="Verification" onBack={() => navigation.goBack()} />
    <View style={s.content}><Text style={s.title}>Restaurant Verification</Text><Text style={s.sub}>Your account is under review. We'll notify you once approved.</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} color={BRAND} style={s.btn} /></View>
  </SafeAreaView>
);
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, content: { flex: 1, justifyContent: 'center', padding: spacing.lg }, title: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary, textAlign: 'center' }, sub: { fontSize: typography.sizes.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, lineHeight: 24 }, btn: { marginTop: spacing.xl } });
export default VerificationScreen;
