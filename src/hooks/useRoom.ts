import { useState, useEffect } from 'react';
import type { Room } from '../types';
import { supabase, createRoomService } from '../services';

const roomService = createRoomService(supabase);

interface UseRoomReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
}

/**
 * Subscribes to a room and its realtime updates
 */
export function useRoom(roomId: string | null): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Initial fetch
    roomService
      .getRoom(roomId)
      .then((data) => {
        setRoom(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Subscribe to updates
    const unsubscribe = roomService.subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return unsubscribe;
  }, [roomId]);

  return { room, loading, error };
}
