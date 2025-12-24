import { useState, useEffect } from 'react';
import { Home, Lobby, Game, Voting, Results } from './pages';
import { useRoomWithStatus, usePlayersWithStatus, useCurrentPlayer } from './hooks';
import { DebugPanel } from './components/DebugPanel';
import { version } from '../package.json';
import './styles/variables.scss';

type Screen = 'home' | 'lobby' | 'game' | 'voting' | 'results';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [roomId, setRoomId] = useState<string | null>(null);
  const { room, subscriptionStatus: roomSubStatus } = useRoomWithStatus(roomId);
  const { players, subscriptionStatus: playersSubStatus } = usePlayersWithStatus(roomId);
  const { currentPlayer, clearCurrentPlayer } = useCurrentPlayer();

  // Sync screen with room status (for non-hosts)
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
    setRoomId(id);
    setScreen('lobby');
  };

  const handleLeave = () => {
    setRoomId(null);
    setScreen('home');
    clearCurrentPlayer();
  };

  const handlePlayAgain = () => {
    setScreen('lobby');
  };

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
    </>
  );
}

export default App;
