import { useState, useEffect } from 'react';
import type { Room } from '../types';
import { supabase } from '../services';

interface UseRoomReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
  subscriptionStatus: string;
}

export function useRoomWithStatus(roomId: string | null): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('IDLE');

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      setSubscriptionStatus('IDLE');
      return;
    }

    setLoading(true);
    setError(null);
    setSubscriptionStatus('CONNECTING');

    // Initial fetch
    supabase
      .from('rooms')
      .select()
      .eq('id', roomId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setRoom(data as Room);
        }
        setLoading(false);
      });

    // Subscribe to updates
    const channel = supabase
      .channel(`room-debug:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log('🔄 Room update:', payload.eventType, payload.new);
          if (payload.new) {
            setRoom(payload.new as Room);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Room subscription:', status);
        setSubscriptionStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { room, loading, error, subscriptionStatus };
}
