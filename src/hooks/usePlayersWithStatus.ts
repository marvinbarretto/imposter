import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { supabase } from '../services';

interface UsePlayersReturn {
  players: Player[];
  loading: boolean;
  error: string | null;
  subscriptionStatus: string;
}

export function usePlayersWithStatus(roomId: string | null): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('IDLE');

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setLoading(false);
      setSubscriptionStatus('IDLE');
      return;
    }

    setLoading(true);
    setError(null);
    setSubscriptionStatus('CONNECTING');

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select()
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setPlayers(data as Player[]);
      }
      setLoading(false);
    };

    // Initial fetch
    fetchPlayers();

    // Subscribe to updates
    const channel = supabase
      .channel(`players-debug:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('🔄 Players update:', payload.eventType);
          fetchPlayers(); // Refetch all players
        }
      )
      .subscribe((status) => {
        console.log('📡 Players subscription:', status);
        setSubscriptionStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, loading, error, subscriptionStatus };
}
