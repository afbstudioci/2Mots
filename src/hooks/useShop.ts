//src/hooks/useShop.ts
import { useData } from '../context/DataContext';

export function useShop() {
    const { shopItems, isLoading, updateShop } = useData();

    return {
        items: shopItems,
        isLoading,
        fetchShopItems: updateShop,
    };
}
