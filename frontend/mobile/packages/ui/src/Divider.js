import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@pecafoo/theme';

/**
 * Horizontal divider with optional centered label.
 */
const Divider = ({ label, style }) => {
  if (!label) {
    return <View style={[styles.line, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.base,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  label: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    color: colors.textTertiary,
  },
});

export default Divider;
