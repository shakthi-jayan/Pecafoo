import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@pecafoo/theme';
import Button from './Button';

/**
 * Error screen with retry action.
 *
 * @param {object} props
 * @param {string} [props.message]
 * @param {() => void} [props.onRetry]
 * @param {string} [props.color]
 */
const ErrorScreen = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  color = '#D946EF',
}) => (
  <View style={styles.container}>
    <Ionicons name="alert-circle-outline" size={64} color={colors.semantic.error} />
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <Button
        title="Retry"
        onPress={onRetry}
        variant="outline"
        color={color}
        style={styles.button}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bgBase,
  },
  message: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.base,
    lineHeight: typography.sizes.body * typography.lineHeights.relaxed,
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 120,
  },
});

export default ErrorScreen;
