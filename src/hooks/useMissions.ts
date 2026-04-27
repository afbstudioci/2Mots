//src/hooks/useMissions.ts
import { useData } from '../context/DataContext';

export function useMissions() {
    const { missions, isLoading, updateMissions } = useData();

    return {
        missions,
        isLoading,
        fetchMissions: updateMissions,
    };
}
