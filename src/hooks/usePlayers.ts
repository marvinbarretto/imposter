import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { supabase, createPlayerService } from '../services';

const playerService = createPlayerService(supabase);

interface UsePlayersReturn {
  players: Player[];
  loading: boolean;
  error: string | null;
}

/**
 * Subscribes to players in a room with realtime updates
 */
export function usePlayers(roomId: string | null): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe handles initial fetch + updates
    const unsubscribe = playerService.subscribeToPlayers(roomId, (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setLoading(false);
    });

    return unsubscribe;
  }, [roomId]);

  return { players, loading, error };
}
