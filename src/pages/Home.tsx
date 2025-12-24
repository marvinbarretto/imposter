import { useState } from 'react';
import { useGameActions, useCurrentPlayer } from '../hooks';
import { isValidRoomCode } from '../utils';
import styles from './Home.module.scss';

interface HomeProps {
  onJoinRoom: (roomId: string) => void;
  version?: string;
}

export function Home({ onJoinRoom, version }: HomeProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { createRoom, joinRoom } = useGameActions();
  const { setCurrentPlayer } = useCurrentPlayer();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { roomId, playerId } = await createRoom(name.trim());
      setCurrentPlayer(playerId, name.trim());
      onJoinRoom(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!isValidRoomCode(roomCode)) {
      setError('Please enter a valid 4-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { roomId, playerId } = await joinRoom(roomCode, name.trim());
      setCurrentPlayer(playerId, name.trim());
      onJoinRoom(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Imposter</h1>
        <p className={styles.subtitle}>The word guessing game</p>

        <div className={styles.buttons}>
          <button
            className={styles.primaryButton}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        {version && <p className={styles.version}>v{version}</p>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => setMode('choose')}>
        ← Back
      </button>

      <h1 className={styles.title}>
        {mode === 'create' ? 'Create Room' : 'Join Room'}
      </h1>

      <form
        className={styles.form}
        onSubmit={mode === 'create' ? handleCreate : handleJoin}
      >
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          maxLength={20}
          autoFocus
        />

        {mode === 'join' && (
          <input
            type="text"
            placeholder="Room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={styles.input}
            inputMode="numeric"
            maxLength={4}
          />
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={loading}
        >
          {loading ? 'Loading...' : mode === 'create' ? 'Create' : 'Join'}
        </button>
      </form>
    </div>
  );
}
