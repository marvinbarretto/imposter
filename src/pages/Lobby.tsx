import { useRoom, usePlayers, useCurrentPlayer, useGameActions } from '../hooks';
import styles from './Lobby.module.scss';

interface LobbyProps {
  roomId: string;
  onGameStart: () => void;
  onLeave: () => void;
}

export function Lobby({ roomId, onGameStart, onLeave }: LobbyProps) {
  const { room, loading: roomLoading } = useRoom(roomId);
  const { players, loading: playersLoading } = usePlayers(roomId);
  const { currentPlayer } = useCurrentPlayer();
  const { startGame } = useGameActions();

  const isHost = players.find(p => p.id === currentPlayer.id)?.is_host ?? false;
  const canStart = players.length >= 3;

  const handleStart = async () => {
    if (!room || !canStart) return;
    try {
      await startGame(roomId, players);
      onGameStart();
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  if (roomLoading || playersLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!room) {
    return <div className={styles.container}>Room not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lobby</h1>
        <div className={styles.code}>
          <span className={styles.codeLabel}>Room Code</span>
          <span className={styles.codeValue}>{room.code}</span>
        </div>
      </div>

      <div className={styles.players}>
        <h2 className={styles.playersTitle}>
          Players ({players.length})
        </h2>
        <ul className={styles.playerList}>
          {players.map((player) => (
            <li key={player.id} className={styles.playerItem}>
              {player.name}
              {player.is_host && <span className={styles.hostBadge}>Host</span>}
              {player.id === currentPlayer.id && <span className={styles.youBadge}>You</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        {isHost ? (
          <>
            <button
              className={styles.primaryButton}
              onClick={handleStart}
              disabled={!canStart}
            >
              {canStart ? 'Start Game' : `Need ${3 - players.length} more players`}
            </button>
            <p className={styles.hint}>
              Share the code with your friends to join
            </p>
          </>
        ) : (
          <p className={styles.waiting}>Waiting for host to start...</p>
        )}

        <button className={styles.leaveButton} onClick={onLeave}>
          Leave Room
        </button>
      </div>
    </div>
  );
}
