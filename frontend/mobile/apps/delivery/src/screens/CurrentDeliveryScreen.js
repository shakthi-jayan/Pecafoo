import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, EmptyState } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';

const CurrentDeliveryScreen = () => {
  // In a real app, this would fetch the active order and show navigation steps (pickup -> dropoff)
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title="Current Delivery" />
      <EmptyState icon="navigate-outline" title="No Active Delivery" message="Accept an order to start delivering" />
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase } });
export default CurrentDeliveryScreen;
