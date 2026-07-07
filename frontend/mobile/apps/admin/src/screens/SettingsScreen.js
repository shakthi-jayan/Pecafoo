import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@pecafoo/auth';
import { Button } from '@pecafoo/ui';
import { colors, spacing } from '@pecafoo/theme';

const SettingsScreen = () => {
  const { logout } = useAuth();
  return (
    <View style={s.container}>
      <Button title="Sign Out" onPress={logout} color={colors.semantic.error} />
    </View>
  );
};
const s = StyleSheet.create({ container: { flex: 1, padding: spacing.lg, justifyContent: 'center' } });
export default SettingsScreen;
