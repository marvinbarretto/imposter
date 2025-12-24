import { useState } from 'react';
import styles from './DebugPanel.module.scss';

interface DebugPanelProps {
  roomId: string | null;
  roomStatus: string | null;
  playerCount: number;
  currentPlayerId: string | null;
  subscriptionStatus: {
    room: string;
    players: string;
  };
}

export function DebugPanel({
  roomId,
  roomStatus,
  playerCount,
  currentPlayerId,
  subscriptionStatus,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.panel}>
      <button className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '▼ Debug' : '▶ Debug'}
      </button>
      {isOpen && (
        <div className={styles.content}>
          <div><strong>Room ID:</strong> {roomId ?? 'none'}</div>
          <div><strong>Status:</strong> {roomStatus ?? 'none'}</div>
          <div><strong>Players:</strong> {playerCount}</div>
          <div><strong>My ID:</strong> {currentPlayerId?.slice(0, 8) ?? 'none'}</div>
          <div>
            <strong>Subs:</strong>{' '}
            <span className={subscriptionStatus.room === 'SUBSCRIBED' ? styles.ok : styles.err}>
              room:{subscriptionStatus.room}
            </span>{' '}
            <span className={subscriptionStatus.players === 'SUBSCRIBED' ? styles.ok : styles.err}>
              players:{subscriptionStatus.players}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
