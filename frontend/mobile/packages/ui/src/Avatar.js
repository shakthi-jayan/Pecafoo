import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius, typography } from '@pecafoo/theme';
import { getInitials } from '@pecafoo/utils';

/**
 * Avatar with image or fallback initials.
 *
 * @param {object} props
 * @param {string} [props.uri] - Image URL
 * @param {string} [props.name] - For fallback initials
 * @param {number} [props.size=44]
 * @param {string} [props.color] - Background for initials
 */
const Avatar = ({ uri, name, size = 44, color = '#D946EF' }) => {
  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, sizeStyle]} />;
  }

  return (
    <View style={[styles.fallback, sizeStyle, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.initials, { color, fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.skeleton,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: typography.weights.bold,
  },
});

export default Avatar;
