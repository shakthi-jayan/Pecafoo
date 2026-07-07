import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@pecafoo/theme';

const BADGE_COLORS = {
  success: { bg: '#DCFCE7', text: '#166534' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  neutral: { bg: '#F3F4F6', text: '#374151' },
};

/**
 * Status badge (e.g. "Active", "Pending", "Rejected").
 *
 * @param {object} props
 * @param {string} props.label
 * @param {'success'|'warning'|'error'|'info'|'neutral'} [props.variant='neutral']
 */
const Badge = ({ label, variant = 'neutral', style }) => {
  const colorSet = BADGE_COLORS[variant] || BADGE_COLORS.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: colorSet.bg }, style]}>
      <Text style={[styles.text, { color: colorSet.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default Badge;
