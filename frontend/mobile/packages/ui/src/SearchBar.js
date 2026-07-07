import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@pecafoo/theme';

/**
 * Search bar with icon and clear button.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(text: string) => void} props.onChangeText
 * @param {string} [props.placeholder='Search...']
 */
const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  ...rest
}) => (
  <View style={[styles.container, shadows.softer, style]}>
    <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
      {...rest}
    />
    {value ? (
      <TouchableOpacity onPress={() => onChangeText('')}>
        <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
});

export default SearchBar;
