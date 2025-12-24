import { useCallback } from 'react';
import { supabase, createRoomService, createPlayerService } from '../services';
import { getRandomTheme, selectImposter } from '../utils';
import type { Player } from '../types';

const roomService = createRoomService(supabase);
const playerService = createPlayerService(supabase);

interface UseGameActionsReturn {
  createRoom: (hostName: string) => Promise<{ roomId: string; playerId: string; code: string }>;
  joinRoom: (code: string, playerName: string) => Promise<{ roomId: string; playerId: string }>;
  startGame: (roomId: string, players: Player[], themePacks?: string[]) => Promise<void>;
  advanceTurn: (roomId: string, currentTurn: number, playerCount: number) => Promise<void>;
  goToVoting: (roomId: string) => Promise<void>;
  submitVote: (playerId: string, votedForId: string) => Promise<void>;
  showResults: (roomId: string) => Promise<void>;
  playAgain: (roomId: string) => Promise<void>;
}

/**
 * Provides game actions that modify state
 */
export function useGameActions(): UseGameActionsReturn {
  const createRoom = useCallback(async (hostName: string) => {
    // Create room first
    const room = await roomService.createRoom(crypto.randomUUID());

    // Create host player
    const player = await playerService.createPlayer(room.id, hostName, true);

    // Update room with correct host_id
    await supabase
      .from('rooms')
      .update({ host_id: player.id })
      .eq('id', room.id);

    return {
      roomId: room.id,
      playerId: player.id,
      code: room.code,
    };
  }, []);

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    const room = await roomService.findRoomByCode(code);
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.status !== 'lobby') {
      throw new Error('Game already in progress');
    }

    const player = await playerService.createPlayer(room.id, playerName, false);

    return {
      roomId: room.id,
      playerId: player.id,
    };
  }, []);

  const startGame = useCallback(async (roomId: string, players: Player[], themePacks?: string[]) => {
    if (players.length < 3) {
      throw new Error('Need at least 3 players to start');
    }

    const secretWord = getRandomTheme(themePacks);
    const imposter = selectImposter(players);

    await roomService.startGame(roomId, secretWord, imposter.id);
  }, []);

  const advanceTurn = useCallback(async (roomId: string, currentTurn: number, playerCount: number) => {
    const nextTurn = (currentTurn + 1) % playerCount;

    // If we've gone through all players, move to voting
    if (nextTurn === 0) {
      await roomService.updateRoomStatus(roomId, 'voting');
    } else {
      await roomService.advanceTurn(roomId, nextTurn);
    }
  }, []);

  const goToVoting = useCallback(async (roomId: string) => {
    await roomService.updateRoomStatus(roomId, 'voting');
  }, []);

  const submitVote = useCallback(async (playerId: string, votedForId: string) => {
    await playerService.submitVote(playerId, votedForId);
  }, []);

  const showResults = useCallback(async (roomId: string) => {
    await roomService.updateRoomStatus(roomId, 'results');
  }, []);

  const playAgain = useCallback(async (roomId: string) => {
    await playerService.clearVotes(roomId);
    await roomService.updateRoomStatus(roomId, 'lobby');
  }, []);

  return {
    createRoom,
    joinRoom,
    startGame,
    advanceTurn,
    goToVoting,
    submitVote,
    showResults,
    playAgain,
  };
}
