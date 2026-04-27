import { useState, useCallback } from 'react';

export function useMissions() {
    const [missions, setMissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulation de l'appel API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMissions([]);
        } catch (err: any) {
            setError(err.message || 'Erreur réseau');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        missions,
        isLoading,
        error,
        fetchMissions,
    };
}
