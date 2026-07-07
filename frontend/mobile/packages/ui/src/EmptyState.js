import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@pecafoo/theme';

/**
 * Empty list placeholder with icon and message.
 *
 * @param {object} props
 * @param {string} [props.icon] - Ionicons name
 * @param {string} [props.title]
 * @param {string} [props.message]
 */
const EmptyState = ({
  icon = 'file-tray-outline',
  title = 'Nothing here yet',
  message = '',
}) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={56} color={colors.textTertiary} />
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  message: {
    fontSize: typography.sizes.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.sizes.bodySmall * typography.lineHeights.relaxed,
  },
});

export default EmptyState;
