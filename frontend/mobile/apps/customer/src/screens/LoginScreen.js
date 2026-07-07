import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { Button, Input, Divider } from '@pecafoo/ui';
import { colors, spacing, typography, radius } from '@pecafoo/theme';
import { isEmail, isStrongPassword } from '@pecafoo/utils';
import { Ionicons } from '@expo/vector-icons';

const BRAND = colors.brand.customer;

const LoginScreen = ({ navigation }) => {
  const { login, googleLogin, requestPhoneOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const emailErr = isEmail(email);
    if (emailErr) errs.email = emailErr;
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(email, password, 'customer');
      if (data.next_action === 'ROLE_SELECTION') {
        // Handled by RootNavigator via pendingLogin state
      }
    } catch (err) {
      setErrors({ form: err.response?.data?.detail || 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍕 Pecafoo</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue ordering</Text>
          </View>

          {/* Form */}
          {errors.form && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.semantic.error} />
              <Text style={styles.errorText}>{errors.form}</Text>
            </View>
          )}

          <Input
            label="Email"
            leftIcon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            brandColor={BRAND}
          />

          <Input
            label="Password"
            leftIcon="lock-closed-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            brandColor={BRAND}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={[styles.linkText, { color: BRAND }]}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            color={BRAND}
            style={styles.mainButton}
          />

          <Divider label="or continue with" />

          {/* Social Login */}
          <Button
            title="Continue with Google"
            onPress={() => {/* expo-auth-session flow */}}
            variant="outline"
            color={BRAND}
            icon={<Ionicons name="logo-google" size={20} color={BRAND} />}
          />

          <Button
            title="Continue with Phone"
            onPress={() => {/* Phone OTP flow */}}
            variant="ghost"
            color={BRAND}
            icon={<Ionicons name="call-outline" size={20} color={BRAND} />}
            style={styles.phoneButton}
          />

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.linkText, { color: BRAND }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing['2xl'] },
  header: { marginBottom: spacing.xl },
  logo: { fontSize: typography.sizes.h2, marginBottom: spacing.base },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing.xs },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.base, gap: spacing.sm },
  errorText: { fontSize: typography.sizes.bodySmall, color: colors.semantic.error, flex: 1 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  linkText: { fontSize: typography.sizes.bodySmall, fontWeight: typography.weights.semibold },
  mainButton: { marginBottom: spacing.base },
  phoneButton: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary },
});

export default LoginScreen;
