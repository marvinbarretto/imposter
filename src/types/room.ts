export type RoomStatus = 'lobby' | 'playing' | 'voting' | 'results';

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  secret_word: string | null;
  imposter_id: string | null;
  current_turn: number;
  created_at: string;
}

export interface CreateRoomParams {
  code: string;
  host_id: string;
}
