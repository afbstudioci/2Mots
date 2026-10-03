// src/hooks/useShopPayment.ts
// GESTION DES TRANSACTIONS ET PAIEMENTS BOUTIQUE
// Standard : Bank Grade (Strict <= 270 lignes, Sans Emojis, Typographie Française Soignée)

import { useState, useEffect } from 'react';
import { initGooglePlayBilling, purchaseGooglePlayItem, listenToBillingEvents } from '../services/googlePlayBillingService';
import * as Haptics from 'expo-haptics';
import api from '../services/api';

export function useShopPayment(
  user: any,
  userKevs: number,
  setUserKevs: (v: number) => void,
  setIsVip: (v: boolean) => void,
  setStreakFreezes: (v: number) => void,
  updateUser?: (partial: Partial<any>) => void
) {
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
    confirmText?: string;
    isLoading?: boolean;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  useEffect(() => {
    initGooglePlayBilling();

    const unsubscribe = listenToBillingEvents(
      async (purchaseData) => {
        try {
          setIsProcessingPayment(true);
          const res = await api.post('/shop/verify-purchase', {
            packId: purchaseData.productId,
            purchaseToken: purchaseData.purchaseToken,
          });
          const d = res.data?.data;
          if (d) {
            setUserKevs(d.userKevs);
            if (updateUser) {
              updateUser({ kevs: d.userKevs, isVip: d.isVip });
            }
            if (d.isVip) setIsVip(true);
          }
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          setAlertConfig({
            visible: true,
            title: 'Achat validé !',
            message: 'Votre compte a été crédité avec succès.',
            type: 'success',
            buttonText: 'Parfait',
            isLoading: false,
          });
        } catch {
          setAlertConfig({
            visible: true,
            title: 'Erreur',
            message: 'Erreur lors de la validation du reçu Google Play. Veuillez contacter le support.',
            type: 'error',
            buttonText: 'Fermer',
            isLoading: false,
          });
        } finally {
          setIsProcessingPayment(false);
          setProcessingItemId(null);
        }
      },
      () => {
        setIsProcessingPayment(false);
        setProcessingItemId(null);
      },
      () => {
        setIsProcessingPayment(false);
        setProcessingItemId(null);
        setAlertConfig({
          visible: true,
          title: 'Paiement annulé',
          message: 'La commande Google Play a été annulée ou interrompue.',
          type: 'error',
          buttonText: 'Fermer',
          isLoading: false,
        });
      }
    );

    return () => unsubscribe();
  }, [user, updateUser, setUserKevs, setIsVip]);

  const handleBuyWithKevs = (item: any, category?: string) => {
    if (isProcessingPayment) return;
    const cat = category || item.category || (item.rewards ? 'combos' : (String(item.id).startsWith('streak') ? 'streaks' : 'boosters'));
    const itemPrice = Number(item.priceKevs) || 0;

    if (userKevs < itemPrice) {
      setAlertConfig({
        visible: true,
        title: 'Solde insuffisant',
        message: `Il vous manque ${itemPrice - userKevs} Kevs pour obtenir « ${item.title} ».`,
        type: 'error',
        buttonText: 'Compris',
        confirmText: undefined,
        onConfirm: undefined,
        isLoading: false,
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: "Confirmer l'achat",
      message: `Voulez-vous acquérir « ${item.title} » pour ${itemPrice} Kevs ?`,
      buttonText: 'Annuler',
      confirmText: 'Confirmer',
      isLoading: false,
      onConfirm: async () => {
        try {
          setIsProcessingPayment(true);
          setProcessingItemId(item.id);
          setAlertConfig((prev) => ({ ...prev, isLoading: true }));

          const res = await api.post(
            '/shop/buy-with-kevs',
            { itemId: item.id, category: cat },
            { timeout: 15000 }
          );

          const d = res.data?.data;
          if (d) {
            if (d.userKevs !== undefined) setUserKevs(d.userKevs);
            if (d.streakFreezes !== undefined) setStreakFreezes(d.streakFreezes);
            if (updateUser) {
              updateUser({
                kevs: d.userKevs,
                inventory: d.inventory,
                streakFreezes: d.streakFreezes,
              });
            }
          }

          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

          setAlertConfig({
            visible: true,
            title: 'Achat validé !',
            message: `« ${item.title} » a été ajouté à votre inventaire avec succès.`,
            type: 'success',
            buttonText: 'Super',
            confirmText: undefined,
            onConfirm: undefined,
            isLoading: false,
          });
        } catch (e: any) {
          const errMsg =
            e.response?.data?.message ||
            (e.code === 'ECONNABORTED'
              ? "Délai d'attente dépassé. Veuillez vérifier votre connexion."
              : "Une erreur est survenue lors de l'achat.");

          setAlertConfig({
            visible: true,
            title: 'Échec de l\'achat',
            message: errMsg,
            type: 'error',
            buttonText: 'Fermer',
            confirmText: undefined,
            onConfirm: undefined,
            isLoading: false,
          });
        } finally {
          setIsProcessingPayment(false);
          setProcessingItemId(null);
        }
      },
    });
  };

  const handleInAppPurchase = async (pack: any) => {
    if (isProcessingPayment) return;
    try {
      setIsProcessingPayment(true);
      setProcessingItemId(pack.id);
      await purchaseGooglePlayItem(pack.id, pack.id === 'vip_monthly');
    } catch {
      setIsProcessingPayment(false);
      setProcessingItemId(null);
      setAlertConfig({
        visible: true,
        title: 'Service indisponible',
        message: 'Google Play Billing est momentanément inaccessible. Veuillez vérifier votre connexion.',
        type: 'error',
        buttonText: 'Fermer',
        confirmText: undefined,
        onConfirm: undefined,
        isLoading: false,
      });
    }
  };

  const closeAlert = () =>
    setAlertConfig({
      visible: false,
      title: '',
      message: '',
      isLoading: false,
      confirmText: undefined,
      onConfirm: undefined,
    });

  return {
    isProcessingPayment,
    processingItemId,
    alertConfig,
    handleBuyWithKevs,
    handleInAppPurchase,
    closeAlert,
  };
}
