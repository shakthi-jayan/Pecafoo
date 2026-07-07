import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { Avatar, Button, Header } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';
const BRAND = colors.brand.restaurant;

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title="Settings" />
      <ScrollView>
        <View style={s.profile}><Avatar uri={user?.profile_image} name={`${user?.first_name} ${user?.last_name}`} size={64} color={BRAND} /><Text style={s.name}>{user?.first_name} {user?.last_name}</Text><Text style={s.email}>{user?.email}</Text></View>
        {['Restaurant Details', 'Business Hours', 'Notifications', 'Help & Support'].map((item, i) => (
          <TouchableOpacity key={i} style={s.menuItem}><Text style={s.menuLabel}>{item}</Text><Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /></TouchableOpacity>
        ))}
        <Button title="Sign Out" onPress={logout} variant="outline" color={colors.semantic.error} style={s.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, profile: { alignItems: 'center', paddingVertical: spacing['2xl'] }, name: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.md }, email: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: spacing.xs }, menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.base, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider }, menuLabel: { fontSize: typography.sizes.body, color: colors.textPrimary }, logoutBtn: { margin: spacing.lg } });
export default SettingsScreen;
