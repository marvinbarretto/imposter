import { useState, useEffect } from 'react';
import { Home, Lobby, Game, Voting, Results } from './pages';
import { useRoom } from './hooks';
import { useCurrentPlayer } from './hooks';
import './styles/variables.scss';

type Screen = 'home' | 'lobby' | 'game' | 'voting' | 'results';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [roomId, setRoomId] = useState<string | null>(null);
  const { room } = useRoom(roomId);
  const { clearCurrentPlayer } = useCurrentPlayer();

  // Sync screen with room status (for non-hosts)
  useEffect(() => {
    if (!room) return;

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

  switch (screen) {
    case 'home':
      return <Home onJoinRoom={handleJoinRoom} />;

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
      return <Home onJoinRoom={handleJoinRoom} />;
  }
}

export default App;
