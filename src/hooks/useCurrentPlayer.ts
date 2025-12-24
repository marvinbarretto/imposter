import { useState, useEffect, useCallback } from 'react';

const PLAYER_ID_KEY = 'imposter_player_id';
const PLAYER_NAME_KEY = 'imposter_player_name';
const ROOM_ID_KEY = 'imposter_room_id';

interface CurrentPlayer {
  id: string | null;
  name: string | null;
}

interface Session {
  playerId: string | null;
  playerName: string | null;
  roomId: string | null;
}

interface UseCurrentPlayerReturn {
  currentPlayer: CurrentPlayer;
  storedRoomId: string | null;
  setCurrentPlayer: (id: string, name: string) => void;
  setRoomId: (roomId: string) => void;
  clearCurrentPlayer: () => void;
  clearSession: () => void;
}

/**
 * Manages the current player's identity and room in localStorage
 */
export function useCurrentPlayer(): UseCurrentPlayerReturn {
  const [session, setSession] = useState<Session>(() => ({
    playerId: localStorage.getItem(PLAYER_ID_KEY),
    playerName: localStorage.getItem(PLAYER_NAME_KEY),
    roomId: localStorage.getItem(ROOM_ID_KEY),
  }));

  const setCurrentPlayer = useCallback((id: string, name: string) => {
    localStorage.setItem(PLAYER_ID_KEY, id);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    setSession(prev => ({ ...prev, playerId: id, playerName: name }));
  }, []);

  const setRoomId = useCallback((roomId: string) => {
    localStorage.setItem(ROOM_ID_KEY, roomId);
    setSession(prev => ({ ...prev, roomId }));
  }, []);

  const clearCurrentPlayer = useCallback(() => {
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
    localStorage.removeItem(ROOM_ID_KEY);
    setSession({ playerId: null, playerName: null, roomId: null });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ROOM_ID_KEY);
    setSession(prev => ({ ...prev, roomId: null }));
  }, []);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAYER_ID_KEY || e.key === PLAYER_NAME_KEY || e.key === ROOM_ID_KEY) {
        setSession({
          playerId: localStorage.getItem(PLAYER_ID_KEY),
          playerName: localStorage.getItem(PLAYER_NAME_KEY),
          roomId: localStorage.getItem(ROOM_ID_KEY),
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    currentPlayer: { id: session.playerId, name: session.playerName },
    storedRoomId: session.roomId,
    setCurrentPlayer,
    setRoomId,
    clearCurrentPlayer,
    clearSession,
  };
}
