import { useState, useEffect, useCallback } from 'react';

const PLAYER_ID_KEY = 'imposter_player_id';
const PLAYER_NAME_KEY = 'imposter_player_name';

interface CurrentPlayer {
  id: string | null;
  name: string | null;
}

interface UseCurrentPlayerReturn {
  currentPlayer: CurrentPlayer;
  setCurrentPlayer: (id: string, name: string) => void;
  clearCurrentPlayer: () => void;
}

/**
 * Manages the current player's identity in localStorage
 */
export function useCurrentPlayer(): UseCurrentPlayerReturn {
  const [currentPlayer, setCurrentPlayerState] = useState<CurrentPlayer>(() => ({
    id: localStorage.getItem(PLAYER_ID_KEY),
    name: localStorage.getItem(PLAYER_NAME_KEY),
  }));

  const setCurrentPlayer = useCallback((id: string, name: string) => {
    localStorage.setItem(PLAYER_ID_KEY, id);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    setCurrentPlayerState({ id, name });
  }, []);

  const clearCurrentPlayer = useCallback(() => {
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
    setCurrentPlayerState({ id: null, name: null });
  }, []);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAYER_ID_KEY || e.key === PLAYER_NAME_KEY) {
        setCurrentPlayerState({
          id: localStorage.getItem(PLAYER_ID_KEY),
          name: localStorage.getItem(PLAYER_NAME_KEY),
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { currentPlayer, setCurrentPlayer, clearCurrentPlayer };
}
