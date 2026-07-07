import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@pecafoo/theme';

/**
 * Full-screen branded loading spinner.
 *
 * @param {object} props
 * @param {string} [props.color] - Spinner color (defaults to brand)
 */
const LoadingScreen = ({ color = '#D946EF' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgBase,
  },
});

export default LoadingScreen;
