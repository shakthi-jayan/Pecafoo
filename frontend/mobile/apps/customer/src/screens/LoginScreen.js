import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, isGoogleSignInAvailable } from '@pecafoo/auth';
import { Button, Input, Divider } from '@pecafoo/ui';
import { colors, spacing, typography, radius } from '@pecafoo/theme';
import { isEmail } from '@pecafoo/utils';
import { Ionicons } from '@expo/vector-icons';

const BRAND = colors.brand.customer;

// Google "G" logo colors for the official branding
const GOOGLE_COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
};

const LoginScreen = ({ navigation }) => {
  const { login, googleLogin, requestPhoneOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const googleAvailable = isGoogleSignInAvailable();

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
    setErrors({});
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

  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      await googleLogin();
      // Success — AuthContext handles navigation via user state
    } catch (err) {
      // Don't show error for user-cancelled sign-in
      if (err.message === 'Sign-in was cancelled.') {
        // Silent — user chose to cancel
      } else {
        setErrors({
          form: err.response?.data?.detail
            || err.message
            || 'Google sign-in failed. Please try again.',
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin]);

  const isAnyLoading = loading || googleLoading;

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

          {/* Error Banner */}
          {errors.form && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.semantic.error} />
              <Text style={styles.errorText}>{errors.form}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              label="Email"
              leftIcon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              brandColor={BRAND}
              editable={!isAnyLoading}
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
              editable={!isAnyLoading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotLink}
              disabled={isAnyLoading}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.linkText, { color: BRAND }]}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={isAnyLoading}
              color={BRAND}
              style={styles.mainButton}
            />
          </View>

          <Divider label="or continue with" />

          {/* Social Login — Google with official branding */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              (isAnyLoading || !googleAvailable) && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={isAnyLoading || !googleAvailable}
            activeOpacity={0.7}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={GOOGLE_COLORS.blue} style={styles.googleIcon} />
            ) : (
              <View style={styles.googleIconContainer}>
                <Ionicons name="logo-google" size={20} color={GOOGLE_COLORS.blue} />
              </View>
            )}
            <Text style={styles.googleButtonText}>
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Phone Login */}
          <Button
            title="Continue with Phone"
            onPress={() => {/* Phone OTP flow — implemented via bottom sheet in future */}}
            variant="ghost"
            color={BRAND}
            disabled={isAnyLoading}
            icon={<Ionicons name="call-outline" size={20} color={isAnyLoading ? colors.textTertiary : BRAND} />}
            style={styles.phoneButton}
          />

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isAnyLoading}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.linkText, { color: BRAND }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: typography.sizes.h2,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    // Subtle elevation for prominence
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 1,
      },
    }),
  },
  errorText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.semantic.error,
    flex: 1,
    lineHeight: typography.sizes.bodySmall * 1.4,
  },

  // Form card with Apple-style elevation
  formCard: {
    backgroundColor: colors.bgBase,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
    }),
  },

  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  linkText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
  },
  mainButton: {
    marginBottom: 0,
    minHeight: 52,
  },

  // Google button — official branding style
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  googleIcon: {
    marginRight: spacing.sm,
  },
  googleButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: '#3C4043',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  phoneButton: {
    marginTop: spacing.xs,
    minHeight: 52,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  footerText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.textSecondary,
  },
});

export default LoginScreen;
