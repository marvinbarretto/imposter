import { useState } from 'react';
import { useRoom, usePlayers, useCurrentPlayer, useGameActions } from '../hooks';
import { allPlayersVoted } from '../utils';
import styles from './Voting.module.scss';

interface VotingProps {
  roomId: string;
  onResults: () => void;
}

export function Voting({ roomId, onResults }: VotingProps) {
  const { room } = useRoom(roomId);
  const { players } = usePlayers(roomId);
  const { currentPlayer } = useCurrentPlayer();
  const { submitVote, showResults } = useGameActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const me = players.find(p => p.id === currentPlayer.id);
  const isHost = me?.is_host ?? false;
  const everyoneVoted = allPlayersVoted(players);

  const handleVote = async () => {
    if (!selectedId || !currentPlayer.id) return;
    await submitVote(currentPlayer.id, selectedId);
    setHasVoted(true);
  };

  const handleShowResults = async () => {
    await showResults(roomId);
    onResults();
  };

  if (!room) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Who is the Imposter?</h1>
      <p className={styles.subtitle}>Vote for who you think is bluffing</p>

      <div className={styles.players}>
        {players.map((player) => (
          <button
            key={player.id}
            className={`${styles.playerCard} ${selectedId === player.id ? styles.selected : ''}`}
            onClick={() => !hasVoted && setSelectedId(player.id)}
            disabled={hasVoted || player.id === currentPlayer.id}
          >
            <span className={styles.playerName}>{player.name}</span>
            {player.id === currentPlayer.id && <span className={styles.youLabel}>(You)</span>}
            {player.vote && <span className={styles.votedBadge}>Voted</span>}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        {!hasVoted ? (
          <button
            className={styles.primaryButton}
            onClick={handleVote}
            disabled={!selectedId}
          >
            Submit Vote
          </button>
        ) : (
          <p className={styles.waiting}>
            Waiting for others... ({players.filter(p => p.vote).length}/{players.length})
          </p>
        )}

        {isHost && everyoneVoted && (
          <button className={styles.primaryButton} onClick={handleShowResults}>
            Reveal Results
          </button>
        )}
      </div>
    </div>
  );
}
