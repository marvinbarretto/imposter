import type { SupabaseClient } from '@supabase/supabase-js';
import type { Room, RoomStatus } from '../types';
import { generateRoomCode } from '../utils';

export interface RoomService {
  createRoom: (hostId: string) => Promise<Room>;
  findRoomByCode: (code: string) => Promise<Room | null>;
  getRoom: (roomId: string) => Promise<Room | null>;
  updateRoomStatus: (roomId: string, status: RoomStatus) => Promise<Room>;
  startGame: (roomId: string, secretWord: string, imposterId: string) => Promise<Room>;
  advanceTurn: (roomId: string, currentTurn: number) => Promise<Room>;
  subscribeToRoom: (roomId: string, callback: (room: Room) => void) => () => void;
}

export function createRoomService(supabase: SupabaseClient): RoomService {
  return {
    async createRoom(hostId: string): Promise<Room> {
      const code = generateRoomCode();

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: hostId,
          status: 'lobby',
          current_turn: 0,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create room: ${error.message}`);
      return data as Room;
    },

    async findRoomByCode(code: string): Promise<Room | null> {
      const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to find room: ${error.message}`);
      }
      return data as Room;
    },

    async getRoom(roomId: string): Promise<Room | null> {
      const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('id', roomId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to get room: ${error.message}`);
      }
      return data as Room;
    },

    async updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw new Error(`Failed to update room status: ${error.message}`);
      return data as Room;
    },

    async startGame(roomId: string, secretWord: string, imposterId: string): Promise<Room> {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          status: 'playing',
          secret_word: secretWord,
          imposter_id: imposterId,
          current_turn: 0,
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw new Error(`Failed to start game: ${error.message}`);
      return data as Room;
    },

    async advanceTurn(roomId: string, currentTurn: number): Promise<Room> {
      const { data, error } = await supabase
        .from('rooms')
        .update({ current_turn: currentTurn })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw new Error(`Failed to advance turn: ${error.message}`);
      return data as Room;
    },

    subscribeToRoom(roomId: string, callback: (room: Room) => void): () => void {
      const channel = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload) => {
            console.log('Room update received:', payload);
            if (payload.new) {
              callback(payload.new as Room);
            }
          }
        )
        .subscribe((status) => {
          console.log('Room subscription status:', status);
        });

      // Return unsubscribe function
      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
