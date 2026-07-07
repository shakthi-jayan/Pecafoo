import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@pecafoo/auth';
import { Button, Input, Header } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { isEmail } from '@pecafoo/utils';

const BRAND = colors.brand.customer;

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const emailErr = isEmail(email);
    if (emailErr) { setError(emailErr); return; }
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Reset Password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>We sent a password reset link to {email}</Text>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} color={BRAND} style={styles.button} />
          </View>
        ) : (
          <>
            <Text style={styles.description}>Enter your email and we'll send you a link to reset your password.</Text>
            <Input label="Email" leftIcon="mail-outline" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={error} brandColor={BRAND} />
            <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} color={BRAND} style={styles.button} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  description: { fontSize: typography.sizes.body, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: typography.sizes.body * typography.lineHeights.relaxed },
  button: { marginTop: spacing.base },
  successBox: { alignItems: 'center', paddingTop: spacing['2xl'] },
  successTitle: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  successText: { fontSize: typography.sizes.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
});

export default ForgotPasswordScreen;
