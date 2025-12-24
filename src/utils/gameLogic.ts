import type { Player } from '../types';

/**
 * Selects a random player to be the imposter
 * @param players - Array of players in the game
 * @param randomFn - Injectable random function for testing
 */
export function selectImposter(
  players: Player[],
  randomFn: () => number = Math.random
): Player {
  if (players.length === 0) {
    throw new Error('Cannot select imposter from empty player list');
  }
  const index = Math.floor(randomFn() * players.length);
  return players[index];
}

/**
 * Calculates vote results and determines the winner
 * @param players - Array of players with their votes
 * @param imposterId - The actual imposter's ID
 */
export function calculateVoteResults(
  players: Player[],
  imposterId: string
): {
  voteCounts: Record<string, number>;
  mostVotedId: string | null;
  isTie: boolean;
  impostorCaught: boolean;
} {
  const voteCounts: Record<string, number> = {};

  // Count votes
  for (const player of players) {
    if (player.vote) {
      voteCounts[player.vote] = (voteCounts[player.vote] || 0) + 1;
    }
  }

  // Find highest vote count
  const maxVotes = Math.max(...Object.values(voteCounts), 0);
  const mostVoted = Object.entries(voteCounts)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => id);

  const isTie = mostVoted.length > 1;
  const mostVotedId = isTie ? null : mostVoted[0] ?? null;
  const impostorCaught = mostVotedId === imposterId;

  return {
    voteCounts,
    mostVotedId,
    isTie,
    impostorCaught,
  };
}

/**
 * Gets the next turn index, wrapping around to 0 if needed
 */
export function getNextTurnIndex(currentTurn: number, playerCount: number): number {
  return (currentTurn + 1) % playerCount;
}

/**
 * Checks if all players have voted
 */
export function allPlayersVoted(players: Player[]): boolean {
  return players.every(player => player.vote !== null);
}

/**
 * Determines the game winner
 */
export function determineWinner(
  impostorCaught: boolean,
  isTie: boolean
): 'players' | 'imposter' | 'tie' {
  if (isTie) return 'tie';
  return impostorCaught ? 'players' : 'imposter';
}
