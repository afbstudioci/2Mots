//src/services/googlePlayBillingService.ts
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { GooglePlayBilling } = NativeModules;

let eventEmitter: NativeEventEmitter | null = null;
if (Platform.OS === 'android' && GooglePlayBilling) {
  eventEmitter = new NativeEventEmitter(GooglePlayBilling);
}

export const initGooglePlayBilling = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !GooglePlayBilling) return false;
  try {
    await GooglePlayBilling.initBilling();
    return true;
  } catch (err) {
    return false;
  }
};

export const purchaseGooglePlayItem = async (
  productId: string,
  isSubscription: boolean = false
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !GooglePlayBilling) {
    throw new Error('Google Play Billing non supporté sur cette plateforme');
  }
  return await GooglePlayBilling.purchaseItem(productId, isSubscription);
};

export const listenToBillingEvents = (
  onSuccess: (data: { productId: string; purchaseToken: string; orderId: string }) => void,
  onCancel?: () => void,
  onError?: (err: any) => void
) => {
  if (!eventEmitter) return () => {};

  const subSuccess = eventEmitter.addListener('onPurchaseCompleted', onSuccess);
  const subCancel = eventEmitter.addListener('onPurchaseCanceled', () => onCancel?.());
  const subError = eventEmitter.addListener('onPurchaseError', (err) => onError?.(err));

  return () => {
    subSuccess.remove();
    subCancel.remove();
    subError.remove();
  };
};
