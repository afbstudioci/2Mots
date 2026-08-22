//src/hooks/useShopPayment.ts
import { useState, useEffect } from 'react';
import { initGooglePlayBilling, purchaseGooglePlayItem, listenToBillingEvents } from '../services/googlePlayBillingService';
import * as Haptics from 'expo-haptics';
import api from '../services/api';

export function useShopPayment(
  user: any,
  userKevs: number,
  setUserKevs: (v: number) => void,
  setIsVip: (v: boolean) => void,
  setStreakFreezes: (v: number) => void
) {
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  useEffect(() => {
    initGooglePlayBilling();

    const unsubscribe = listenToBillingEvents(
      async (purchaseData) => {
        try {
          const res = await api.post('/shop/verify-purchase', {
            packId: purchaseData.productId,
            purchaseToken: purchaseData.purchaseToken,
          });
          const d = res.data?.data;
          if (d) {
            setUserKevs(d.userKevs);
            if (user) { user.kevs = d.userKevs; user.isVip = d.isVip; }
            if (d.isVip) setIsVip(true);
          }
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          setAlertConfig({
            visible: true,
            title: 'ACHAT VALIDÉ !',
            message: 'Votre compte a été crédité avec succès.',
            type: 'success',
            buttonText: 'Parfait !',
          });
        } catch {
          setAlertConfig({
            visible: true,
            title: 'ERREUR',
            message: 'Erreur lors de la validation du reçu Google Play.',
            type: 'error',
            buttonText: 'Fermer',
          });
        }
      },
      () => {},
      () => {
        setAlertConfig({
          visible: true,
          title: 'PAIEMENT ANNULÉ',
          message: 'La commande Google Play a été annulée ou a échoué.',
          type: 'error',
          buttonText: 'Fermer',
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleBuyWithKevs = (item: any, category?: string) => {
    const cat = category || item.category || 'boosters';
    if (userKevs < item.priceKevs) {
      setAlertConfig({
        visible: true,
        title: 'KEVS INSUFFISANTS',
        message: `Il vous manque ${item.priceKevs - userKevs} Kevs pour acheter "${item.title}".`,
        type: 'error',
        buttonText: 'Compris',
      });
      return;
    }
    setAlertConfig({
      visible: true,
      title: "CONFIRMER L'ACHAT",
      message: `Acheter "${item.title}" pour ${item.priceKevs} Kevs ?`,
      buttonText: 'Annuler',
      confirmText: 'Acheter',
      onConfirm: async () => {
        try {
          const res = await api.post('/shop/buy-with-kevs', { itemId: item.id, category: cat });
          const d = res.data?.data;
          if (d) {
            setUserKevs(d.userKevs);
            if (user) { user.kevs = d.userKevs; user.inventory = d.inventory; }
            if (d.streakFreezes !== undefined) setStreakFreezes(d.streakFreezes);
          }
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          setAlertConfig({
            visible: true,
            title: 'ACHAT RÉUSSI !',
            message: `${item.title} a été ajouté à votre inventaire.`,
            type: 'success',
            buttonText: 'Super !',
          });
        } catch (e: any) {
          setAlertConfig({
            visible: true,
            title: 'ERREUR',
            message: e.response?.data?.message || "Erreur lors de l'achat.",
            type: 'error',
            buttonText: 'Fermer',
          });
        }
      },
    });
  };

  const handleInAppPurchase = async (pack: any) => {
    try {
      await purchaseGooglePlayItem(pack.id, pack.id === 'vip_monthly');
    } catch {
      setAlertConfig({
        visible: true,
        title: 'SERVICE INDISPONIBLE',
        message: 'Google Play Billing est inaccessible ou non initialisé.',
        type: 'error',
        buttonText: 'Fermer',
      });
    }
  };

  const closeAlert = () => setAlertConfig({ visible: false, title: '', message: '' });

  return { alertConfig, handleBuyWithKevs, handleInAppPurchase, closeAlert };
}
