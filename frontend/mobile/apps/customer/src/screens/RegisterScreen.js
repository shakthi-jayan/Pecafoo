import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { Button, Input } from '@pecafoo/ui';
import { colors, spacing, typography, radius } from '@pecafoo/theme';
import { isEmail, isStrongPassword, isRequired } from '@pecafoo/utils';

const BRAND = colors.brand.customer;

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const errs = {};
    const nameErr = isRequired(form.first_name, 'First name');
    if (nameErr) errs.first_name = nameErr;
    const emailErr = isEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const pwErr = isStrongPassword(form.password);
    if (pwErr) errs.password = pwErr;
    if (form.password !== form.password2) errs.password2 = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ ...form, requested_role: 'customer' });
    } catch (err) {
      if (err.isAccountExists) {
        navigation.navigate('Login');
        return;
      }
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, msgs]) => {
          fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start ordering your favourite food</Text>
          </View>

          {errors.form && <View style={styles.errorBanner}><Text style={styles.errorText}>{errors.form}</Text></View>}

          <Input label="First Name" leftIcon="person-outline" placeholder="John" value={form.first_name} onChangeText={v => update('first_name', v)} error={errors.first_name} brandColor={BRAND} />
          <Input label="Last Name" leftIcon="person-outline" placeholder="Doe" value={form.last_name} onChangeText={v => update('last_name', v)} error={errors.last_name} brandColor={BRAND} />
          <Input label="Email" leftIcon="mail-outline" placeholder="you@example.com" value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" error={errors.email} brandColor={BRAND} />
          <Input label="Password" leftIcon="lock-closed-outline" placeholder="Min. 8 characters" value={form.password} onChangeText={v => update('password', v)} secureTextEntry error={errors.password} brandColor={BRAND} />
          <Input label="Confirm Password" leftIcon="lock-closed-outline" placeholder="Re-enter password" value={form.password2} onChangeText={v => update('password2', v)} secureTextEntry error={errors.password2} brandColor={BRAND} />

          <Button title="Create Account" onPress={handleRegister} loading={loading} color={BRAND} style={styles.mainButton} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: BRAND }]}>Sign in</Text>
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
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing.xs },
  errorBanner: { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.base },
  errorText: { fontSize: typography.sizes.bodySmall, color: colors.semantic.error },
  mainButton: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary },
  linkText: { fontSize: typography.sizes.bodySmall, fontWeight: typography.weights.semibold },
});

export default RegisterScreen;
