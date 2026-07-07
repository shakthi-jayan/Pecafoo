import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadows } from '@pecafoo/theme';

/**
 * Elevated card component matching design token shadows.
 */
const Card = ({ children, style, variant = 'soft', onPress }) => {
  const Wrapper = onPress ? require('react-native').TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, shadows[variant], style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: spacing.base,
  },
});

export default Card;
