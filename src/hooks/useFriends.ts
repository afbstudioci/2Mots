import { useState, useCallback } from 'react';

export function useFriends() {
    const [friends, setFriends] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulation de l'appel API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setFriends([]);
        } catch (err: any) {
            setError(err.message || 'Erreur réseau');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        friends,
        isLoading,
        error,
        fetchFriends,
    };
}
