//src/hooks/useFriends.ts
import { useData } from '../context/DataContext';

export function useFriends() {
    const { friends, isLoading, updateFriends } = useData();

    return {
        friends,
        isLoading,
        fetchFriends: updateFriends,
    };
}
