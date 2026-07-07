import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Header, Button, Card } from '@pecafoo/ui';
import { colors, spacing, typography } from '@pecafoo/theme';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, formatCurrency } from '@pecafoo/utils';
import ordersService from '../services/orders';

const BRAND = colors.brand.customer;

const CheckoutScreen = ({ navigation }) => {
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS.COD);

  const createOrderMutation = useMutation({
    mutationFn: (data) => ordersService.create(data),
    onSuccess: (res) => {
      Alert.alert('Order Placed!', 'Your order has been confirmed.', [
        { text: 'View Order', onPress: () => navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId: res.data.id } }) },
      ]);
    },
    onError: () => Alert.alert('Error', 'Failed to place order. Please try again.'),
  });

  const handlePlaceOrder = () => {
    createOrderMutation.mutate({ payment_method: selectedPayment });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Checkout" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
          <Card
            key={key}
            style={[styles.paymentCard, selectedPayment === key && { borderColor: BRAND, borderWidth: 2 }]}
            onPress={() => setSelectedPayment(key)}
          >
            <Text style={styles.paymentLabel}>{label}</Text>
          </Card>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Place Order" onPress={handlePlaceOrder} loading={createOrderMutation.isPending} color={BRAND} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  paymentCard: { marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  paymentLabel: { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textPrimary },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.bgCard },
});

export default CheckoutScreen;
