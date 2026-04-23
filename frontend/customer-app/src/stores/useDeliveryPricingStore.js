import { useSyncExternalStore } from 'react';

const state = {
    estimatedFee: null,
    surgeActive: false,
    surgeLabel: null,
    isFetchingEstimate: false,
};

const listeners = new Set();

function emit() {
    listeners.forEach((listener) => listener());
}

function setState(patch) {
    Object.assign(state, patch);
    emit();
}

export const deliveryPricingStore = {
    getState: () => state,
    subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    setEstimate: (breakdown) => setState({
        estimatedFee: breakdown,
        surgeActive: Boolean(breakdown?.surge_active),
        surgeLabel: breakdown?.surge_label ?? null,
        isFetchingEstimate: false,
    }),
    clearEstimate: () => setState({
        estimatedFee: null,
        surgeActive: false,
        surgeLabel: null,
        isFetchingEstimate: false,
    }),
    setSurge: (active, label = null) => setState({
        surgeActive: Boolean(active),
        surgeLabel: label,
    }),
    setIsFetchingEstimate: (isFetchingEstimate) => setState({ isFetchingEstimate }),
};

export function useDeliveryPricingStore(selector = (snapshot) => snapshot) {
    return useSyncExternalStore(
        deliveryPricingStore.subscribe,
        () => selector(deliveryPricingStore.getState()),
        () => selector(deliveryPricingStore.getState()),
    );
}
