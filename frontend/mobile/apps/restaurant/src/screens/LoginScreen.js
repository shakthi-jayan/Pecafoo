import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { Button, Input, Divider } from '@pecafoo/ui';
import { colors, spacing, typography, radius } from '@pecafoo/theme';
import { isEmail } from '@pecafoo/utils';
import { Ionicons } from '@expo/vector-icons';
const BRAND = colors.brand.restaurant;

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const errs = {}; if (isEmail(email)) errs.email = isEmail(email); if (!password) errs.password = 'Required';
    setErrors(errs); if (Object.keys(errs).length) return;
    setLoading(true);
    try { await login(email, password, 'restaurant_owner'); } catch (e) { setErrors({ form: e.response?.data?.detail || 'Login failed.' }); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}><Text style={s.logo}>🍳 Pecafoo Restaurant</Text><Text style={s.title}>Welcome back</Text><Text style={s.subtitle}>Manage your restaurant on the go</Text></View>
        {errors.form && <View style={s.errBanner}><Text style={s.errText}>{errors.form}</Text></View>}
        <Input label="Email" leftIcon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} brandColor={BRAND} placeholder="you@example.com" />
        <Input label="Password" leftIcon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} brandColor={BRAND} placeholder="Enter password" />
        <Button title="Sign In" onPress={handleLogin} loading={loading} color={BRAND} style={s.btn} />
        <Divider label="or" />
        <Button title="Register as Restaurant" onPress={() => navigation.navigate('Register')} variant="outline" color={BRAND} />
      </ScrollView>
    </KeyboardAvoidingView></SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase }, flex: { flex: 1 }, scroll: { padding: spacing.lg, paddingTop: spacing['2xl'] },
  header: { marginBottom: spacing.xl }, logo: { fontSize: typography.sizes.h2, marginBottom: spacing.base },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing.xs },
  errBanner: { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.base },
  errText: { fontSize: typography.sizes.bodySmall, color: colors.semantic.error }, btn: { marginBottom: spacing.base },
});
export default LoginScreen;
