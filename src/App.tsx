import { useState, useEffect } from 'react';
import { Home, Lobby, Game, Voting, Results } from './pages';
import { useRoomWithStatus, usePlayersWithStatus, useCurrentPlayer } from './hooks';
import { DebugPanel } from './components/DebugPanel';
import { version } from '../package.json';
import './styles/variables.scss';

// Set to true to show debug panel
const DEBUG_MODE = false;

type Screen = 'home' | 'lobby' | 'game' | 'voting' | 'results';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [roomId, setRoomIdState] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const {
    currentPlayer,
    storedRoomId,
    setRoomId: storeRoomId,
    clearCurrentPlayer,
    clearSession,
  } = useCurrentPlayer();

  const { room, subscriptionStatus: roomSubStatus } = useRoomWithStatus(roomId);
  const { players, subscriptionStatus: playersSubStatus } = usePlayersWithStatus(roomId);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    if (storedRoomId && currentPlayer.id) {
      console.log('🔄 Restoring session:', storedRoomId);
      setRoomIdState(storedRoomId);
    }
    setIsRestoring(false);
  }, []); // Only run once on mount

  // Validate player still exists in room after restoration
  useEffect(() => {
    if (isRestoring) return;
    if (!roomId || !currentPlayer.id) return;
    if (players.length === 0) return; // Still loading

    const playerStillInRoom = players.some(p => p.id === currentPlayer.id);

    if (!playerStillInRoom) {
      console.log('⚠️ Player no longer in room, clearing session');
      clearSession();
      setRoomIdState(null);
      setScreen('home');
    }
  }, [roomId, currentPlayer.id, players, isRestoring, clearSession]);

  // Sync screen with room status
  useEffect(() => {
    if (!room) return;

    console.log('🎮 Room status changed:', room.status);

    switch (room.status) {
      case 'lobby':
        setScreen('lobby');
        break;
      case 'playing':
        setScreen('game');
        break;
      case 'voting':
        setScreen('voting');
        break;
      case 'results':
        setScreen('results');
        break;
    }
  }, [room?.status]);

  const handleJoinRoom = (id: string) => {
    setRoomIdState(id);
    storeRoomId(id); // Persist to localStorage
    setScreen('lobby');
  };

  const handleLeave = () => {
    setRoomIdState(null);
    setScreen('home');
    clearCurrentPlayer();
  };

  const handlePlayAgain = () => {
    setScreen('lobby');
  };

  // Show loading while restoring session
  if (isRestoring) {
    return null;
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <Home onJoinRoom={handleJoinRoom} version={version} />;

      case 'lobby':
        return roomId ? (
          <Lobby
            roomId={roomId}
            onGameStart={() => setScreen('game')}
            onLeave={handleLeave}
          />
        ) : null;

      case 'game':
        return roomId ? (
          <Game
            roomId={roomId}
            onVotingStart={() => setScreen('voting')}
          />
        ) : null;

      case 'voting':
        return roomId ? (
          <Voting
            roomId={roomId}
            onResults={() => setScreen('results')}
          />
        ) : null;

      case 'results':
        return roomId ? (
          <Results
            roomId={roomId}
            onPlayAgain={handlePlayAgain}
            onLeave={handleLeave}
          />
        ) : null;

      default:
        return <Home onJoinRoom={handleJoinRoom} version={version} />;
    }
  };

  return (
    <>
      {renderScreen()}
      {DEBUG_MODE && (
        <DebugPanel
          roomId={roomId}
          roomStatus={room?.status ?? null}
          playerCount={players.length}
          currentPlayerId={currentPlayer.id}
          subscriptionStatus={{
            room: roomSubStatus,
            players: playersSubStatus,
          }}
        />
      )}
    </>
  );
}

export default App;
