import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@pecafoo/auth';
import { colors, spacing, typography } from '@pecafoo/theme';

const RoleSelectionScreen = ({ navigation }) => {
  const { pendingLogin, completeLogin } = useAuth();
  const roles = pendingLogin?.available_roles || [];

  const handleSelect = async (role) => {
    try {
      await completeLogin(pendingLogin.login_ticket, role.id);
    } catch { /* error handled in context */ }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select your role</Text>
        <Text style={styles.subtitle}>You have multiple roles on Pecafoo</Text>
        <FlatList
          data={roles}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.roleCard} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <Text style={styles.roleName}>{item.name || item.role}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing['2xl'] },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  list: { gap: spacing.md },
  roleCard: { backgroundColor: colors.bgCard, padding: spacing.lg, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  roleName: { fontSize: typography.sizes.h3, fontWeight: typography.weights.semibold, color: colors.textPrimary },
});

export default RoleSelectionScreen;
