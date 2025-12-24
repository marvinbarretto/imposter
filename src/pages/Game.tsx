import { useRoom, usePlayers, useCurrentPlayer, useGameActions } from '../hooks';
import styles from './Game.module.scss';

interface GameProps {
  roomId: string;
  onVotingStart: () => void;
}

export function Game({ roomId, onVotingStart }: GameProps) {
  const { room } = useRoom(roomId);
  const { players } = usePlayers(roomId);
  const { currentPlayer } = useCurrentPlayer();
  const { advanceTurn, goToVoting } = useGameActions();

  if (!room) return null;

  const isImposter = room.imposter_id === currentPlayer.id;
  const currentTurnPlayer = players[room.current_turn];
  const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
  const isHost = players.find(p => p.id === currentPlayer.id)?.is_host ?? false;

  const handleNextTurn = async () => {
    const nextTurn = room.current_turn + 1;
    if (nextTurn >= players.length) {
      await goToVoting(roomId);
      onVotingStart();
    } else {
      await advanceTurn(roomId, nextTurn, players.length);
    }
  };

  const handleSkipToVoting = async () => {
    await goToVoting(roomId);
    onVotingStart();
  };

  return (
    <div className={styles.container}>
      <div className={styles.roleCard}>
        {isImposter ? (
          <>
            <span className={styles.roleLabel}>You are the</span>
            <span className={styles.roleImposter}>IMPOSTER</span>
            <span className={styles.roleHint}>Blend in with the others!</span>
          </>
        ) : (
          <>
            <span className={styles.roleLabel}>The theme is</span>
            <span className={styles.roleWord}>{room.secret_word}</span>
            <span className={styles.roleHint}>Say a word related to this theme</span>
          </>
        )}
      </div>

      <div className={styles.turnInfo}>
        <h2 className={styles.turnTitle}>
          {isMyTurn ? "It's your turn!" : `${currentTurnPlayer?.name}'s turn`}
        </h2>
        <p className={styles.turnHint}>
          Round {room.current_turn + 1} of {players.length}
        </p>
      </div>

      <div className={styles.playerOrder}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`${styles.playerDot} ${index === room.current_turn ? styles.active : ''} ${index < room.current_turn ? styles.done : ''}`}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        {isMyTurn && (
          <button className={styles.primaryButton} onClick={handleNextTurn}>
            Done - Next Player
          </button>
        )}

        {isHost && (
          <button className={styles.skipButton} onClick={handleSkipToVoting}>
            Skip to Voting
          </button>
        )}
      </div>
    </div>
  );
}
