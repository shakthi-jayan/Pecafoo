import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';

const BRAND = colors.brand.customer;

const OnboardingScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>Welcome to Pecafoo! 🎉</Text>
      <Text style={styles.subtitle}>Your account is being set up. You'll be able to start ordering once onboarding completes.</Text>
      <Button title="Continue" onPress={() => navigation.goBack()} color={BRAND} style={styles.button} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, lineHeight: typography.sizes.body * 1.5 },
  button: { marginTop: spacing.xl },
});

export default OnboardingScreen;
