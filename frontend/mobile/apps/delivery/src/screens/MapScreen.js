import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Header } from '@pecafoo/ui';
import { colors } from '@pecafoo/theme';

const MapScreen = () => {
  return (
    <SafeAreaView style={s.container} edges={['top']}><Header title="Map" />
      <MapView provider={PROVIDER_GOOGLE} style={s.map} showsUserLocation showsMyLocationButton />
    </SafeAreaView>
  );
};
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgBase }, map: { flex: 1 } });
export default MapScreen;
