export interface Player {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  vote: string | null;
  created_at: string;
}

export interface CreatePlayerParams {
  room_id: string;
  name: string;
  is_host: boolean;
}
