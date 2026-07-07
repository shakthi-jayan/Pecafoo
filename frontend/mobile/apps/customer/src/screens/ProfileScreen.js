import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { Avatar, Card, Button } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { Ionicons } from '@expo/vector-icons';

const BRAND = colors.brand.customer;

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: 'location-outline', label: 'Addresses', onPress: () => navigation.navigate('Addresses') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: 'card-outline', label: 'Payment Methods', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar uri={user?.profile_image} name={`${user?.first_name} ${user?.last_name}`} size={72} color={BRAND} />
          <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Sign Out" onPress={logout} variant="outline" color={colors.semantic.error} style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  profileHeader: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  name: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.md },
  email: { fontSize: typography.sizes.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  menu: { paddingHorizontal: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: spacing.md },
  menuLabel: { flex: 1, fontSize: typography.sizes.body, color: colors.textPrimary },
  logoutBtn: { margin: spacing.lg },
});

export default ProfileScreen;
