import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { radius, spacing, typography } from '@pecafoo/theme';

/**
 * Primary button component with brand-color variants.
 *
 * @param {object} props
 * @param {string} props.title - Button label
 * @param {() => void} props.onPress
 * @param {'primary'|'secondary'|'outline'|'ghost'} [props.variant='primary']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.color] - Brand color override
 * @param {object} [props.style] - Additional styles
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  color = '#D946EF',
  style,
  textStyle,
  icon,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    variant === 'primary' && { backgroundColor: color },
    variant === 'secondary' && { backgroundColor: `${color}15` },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && { color: '#FFFFFF' },
    variant === 'secondary' && { color },
    variant === 'outline' && { color },
    variant === 'ghost' && { color },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : color}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    minHeight: 52,
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
