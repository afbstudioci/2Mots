import { useState, useCallback } from 'react';

export function useShop() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchShopItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulation de l'appel API
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Pour l'instant on retourne toujours vide pour voir le EmptyState
            setItems([]);
        } catch (err: any) {
            setError(err.message || 'Erreur réseau');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        items,
        isLoading,
        error,
        fetchShopItems,
    };
}
