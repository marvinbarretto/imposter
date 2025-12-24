import type { SupabaseClient } from '@supabase/supabase-js';
import type { Player } from '../types';

export interface PlayerService {
  createPlayer: (roomId: string, name: string, isHost: boolean) => Promise<Player>;
  getPlayer: (playerId: string) => Promise<Player | null>;
  getPlayersInRoom: (roomId: string) => Promise<Player[]>;
  submitVote: (playerId: string, votedForId: string) => Promise<Player>;
  clearVotes: (roomId: string) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  subscribeToPlayers: (roomId: string, callback: (players: Player[]) => void) => () => void;
}

export function createPlayerService(supabase: SupabaseClient): PlayerService {
  return {
    async createPlayer(roomId: string, name: string, isHost: boolean): Promise<Player> {
      const { data, error } = await supabase
        .from('players')
        .insert({
          room_id: roomId,
          name,
          is_host: isHost,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create player: ${error.message}`);
      return data as Player;
    },

    async getPlayer(playerId: string): Promise<Player | null> {
      const { data, error } = await supabase
        .from('players')
        .select()
        .eq('id', playerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to get player: ${error.message}`);
      }
      return data as Player;
    },

    async getPlayersInRoom(roomId: string): Promise<Player[]> {
      const { data, error } = await supabase
        .from('players')
        .select()
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(`Failed to get players: ${error.message}`);
      return data as Player[];
    },

    async submitVote(playerId: string, votedForId: string): Promise<Player> {
      const { data, error } = await supabase
        .from('players')
        .update({ vote: votedForId })
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw new Error(`Failed to submit vote: ${error.message}`);
      return data as Player;
    },

    async clearVotes(roomId: string): Promise<void> {
      const { error } = await supabase
        .from('players')
        .update({ vote: null })
        .eq('room_id', roomId);

      if (error) throw new Error(`Failed to clear votes: ${error.message}`);
    },

    async removePlayer(playerId: string): Promise<void> {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw new Error(`Failed to remove player: ${error.message}`);
    },

    subscribeToPlayers(roomId: string, callback: (players: Player[]) => void): () => void {
      // Initial fetch
      this.getPlayersInRoom(roomId).then(callback);

      const channel = supabase
        .channel(`players:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'players',
            filter: `room_id=eq.${roomId}`,
          },
          async () => {
            console.log('Players update received');
            // Refetch all players on any change
            const players = await this.getPlayersInRoom(roomId);
            callback(players);
          }
        )
        .subscribe((status) => {
          console.log('Players subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
