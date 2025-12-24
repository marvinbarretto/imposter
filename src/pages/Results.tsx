import { useRoom, usePlayers, useCurrentPlayer, useGameActions } from '../hooks';
import { calculateVoteResults, determineWinner } from '../utils';
import styles from './Results.module.scss';

interface ResultsProps {
  roomId: string;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function Results({ roomId, onPlayAgain, onLeave }: ResultsProps) {
  const { room } = useRoom(roomId);
  const { players } = usePlayers(roomId);
  const { currentPlayer } = useCurrentPlayer();
  const { playAgain } = useGameActions();

  if (!room) return null;

  const imposter = players.find(p => p.id === room.imposter_id);
  const { voteCounts, isTie, impostorCaught } = calculateVoteResults(players, room.imposter_id ?? '');
  const winner = determineWinner(impostorCaught, isTie);
  const isHost = players.find(p => p.id === currentPlayer.id)?.is_host ?? false;

  const handlePlayAgain = async () => {
    await playAgain(roomId);
    onPlayAgain();
  };

  return (
    <div className={styles.container}>
      <div className={styles.resultCard}>
        <h1 className={styles.winner}>
          {winner === 'players' && 'Players Win!'}
          {winner === 'imposter' && 'Imposter Wins!'}
          {winner === 'tie' && "It's a Tie!"}
        </h1>

        <div className={styles.imposterReveal}>
          <span className={styles.label}>The imposter was</span>
          <span className={styles.imposterName}>{imposter?.name}</span>
        </div>

        <div className={styles.wordReveal}>
          <span className={styles.label}>The theme was</span>
          <span className={styles.word}>{room.secret_word}</span>
        </div>
      </div>

      <div className={styles.votes}>
        <h2 className={styles.votesTitle}>Votes</h2>
        {players.map((player) => (
          <div key={player.id} className={styles.voteRow}>
            <span className={styles.playerName}>
              {player.name}
              {player.id === room.imposter_id && <span className={styles.imposterBadge}>Imposter</span>}
            </span>
            <span className={styles.voteCount}>
              {voteCounts[player.id] || 0} votes
            </span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        {isHost && (
          <button className={styles.primaryButton} onClick={handlePlayAgain}>
            Play Again
          </button>
        )}
        <button className={styles.leaveButton} onClick={onLeave}>
          Leave Game
        </button>
      </div>
    </div>
  );
}
