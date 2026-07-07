import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { Button, Input } from '@pecafoo/ui';
import { colors, spacing, typography, radius } from '@pecafoo/theme';
import { isEmail, isStrongPassword, isRequired } from '@pecafoo/utils';
const BRAND = colors.brand.delivery;

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false); const [errors, setErrors] = useState({});
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    const errs = {};
    if (isRequired(form.first_name, 'First name')) errs.first_name = isRequired(form.first_name, 'First name');
    if (isEmail(form.email)) errs.email = isEmail(form.email);
    if (isStrongPassword(form.password)) errs.password = isStrongPassword(form.password);
    if (form.password !== form.password2) errs.password2 = 'Passwords do not match';
    setErrors(errs); if (Object.keys(errs).length) return;
    setLoading(true);
    try { const data = await register({ ...form, requested_role: 'delivery_partner' }); if (data) navigation.navigate('Verification'); }
    catch (e) { if (e.isAccountExists) navigation.navigate('Login'); else setErrors({ form: 'Registration failed.' }); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Apply to Ride</Text><Text style={s.subtitle}>Deliver food and earn money on your schedule</Text>
        {errors.form && <View style={s.err}><Text style={s.errText}>{errors.form}</Text></View>}
        <Input label="First Name" leftIcon="person-outline" value={form.first_name} onChangeText={v => update('first_name', v)} error={errors.first_name} brandColor={BRAND} />
        <Input label="Last Name" leftIcon="person-outline" value={form.last_name} onChangeText={v => update('last_name', v)} brandColor={BRAND} />
        <Input label="Email" leftIcon="mail-outline" value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" error={errors.email} brandColor={BRAND} />
        <Input label="Password" leftIcon="lock-closed-outline" value={form.password} onChangeText={v => update('password', v)} secureTextEntry error={errors.password} brandColor={BRAND} />
        <Input label="Confirm Password" leftIcon="lock-closed-outline" value={form.password2} onChangeText={v => update('password2', v)} secureTextEntry error={errors.password2} brandColor={BRAND} />
        <Button title="Submit Application" onPress={handleRegister} loading={loading} color={BRAND} style={s.btn} />
        <View style={s.footer}><Text style={s.ft}>Already applied? </Text><TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={{ color: BRAND, fontWeight: '600', fontSize: 14 }}>Sign in</Text></TouchableOpacity></View>
      </ScrollView>
    </KeyboardAvoidingView></SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, flex: { flex: 1 }, scroll: { padding: spacing.lg, paddingTop: spacing['2xl'] }, title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.xs }, subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginBottom: spacing.xl }, err: { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.base }, errText: { color: colors.semantic.error, fontSize: 14 }, btn: { marginTop: spacing.sm }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }, ft: { fontSize: 14, color: colors.textSecondary } });
export default RegisterScreen;
