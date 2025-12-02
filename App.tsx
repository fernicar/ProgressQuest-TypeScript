
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Tick, hydrateGame } from './lib/game-engine';
import { loadAssets, Assets } from './lib/assets';
import NewGuy from './components/NewGuy';
import GameView from './components/Game';
import Roster from './components/Roster';

type ViewState = 'WELCOME' | 'ROSTER' | 'NEWGUY' | 'GAME';

export default function App() {
  const [view, setView] = useState<ViewState>('WELCOME');
  const [games, setGames] = useState<Record<string, GameState>>({});
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const loopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Load Assets
  useEffect(() => {
    loadAssets().then(() => {
      setAssetsLoaded(true);
      // Apply the global background here once loaded
      document.body.style.backgroundImage = `url(${Assets.background})`;
    });
  }, []);

  // Load roster
  useEffect(() => {
    const saved = localStorage.getItem('roster');
    if (saved) {
      try {
        setGames(JSON.parse(saved));
      } catch(e) { console.error(e); }
    }
  }, []);

  // Save roster on change
  useEffect(() => {
    if (Object.keys(games).length > 0) {
      localStorage.setItem('roster', JSON.stringify(games));
    }
  }, [games]);

  // Game Loop
  useEffect(() => {
    if (view === 'GAME' && currentGame) {
      lastTimeRef.current = Date.now();
      const loop = () => {
        const now = Date.now();
        const elapsed = now - lastTimeRef.current;
        lastTimeRef.current = now;
        
        // Mutate current game state directly for performance
        Tick(currentGame, elapsed);
        
        // Force update (reactively)
        setCurrentGame({ ...currentGame }); 
        
        loopRef.current = requestAnimationFrame(loop);
      };
      loopRef.current = requestAnimationFrame(loop);
      
      return () => cancelAnimationFrame(loopRef.current);
    }
  }, [view, currentGame]);

  const handleCreate = (newGame: GameState) => {
    setGames(prev => ({ ...prev, [newGame.Traits.Name]: newGame }));
    setCurrentGame(newGame);
    setView('GAME');
  };

  const handleLoad = (name: string) => {
    if (games[name]) {
      const g = { ...games[name] };
      hydrateGame(g);
      setCurrentGame(g);
      setView('GAME');
    }
  };

  const handleDelete = (name: string) => {
    const next = { ...games };
    delete next[name];
    setGames(next);
  };

  const handleImport = (game: GameState) => {
    if (games[game.Traits.Name]) {
      if (!window.confirm(`A character named ${game.Traits.Name} already exists. Overwrite it?`)) {
        return;
      }
    }
    setGames(prev => ({ ...prev, [game.Traits.Name]: game }));
  };

  if (!assetsLoaded) {
    return (
      <div style={{
        display:'flex', 
        justifyContent:'center', 
        alignItems:'center', 
        height:'100vh', 
        fontSize:'24px', 
        fontWeight:'bold'
      }}>
        Loading Progress Quest resources...
      </div>
    );
  }

  return (
    <>
      {view === 'WELCOME' && (
        <div className="modal-overlay">
          <div className="window" style={{ 
            width: '600px', 
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div id="titlebar">
              <img src={Assets.swords} alt="" />
              <span>Progress Quest</span>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '24pt', fontWeight: 'bold', marginBottom: '1rem', textShadow: '2px 2px 0 #000' }}>Progress Quest</h1>
              <p style={{ margin: '20px', fontSize: '14pt', lineHeight: '1.5' }}>
                Progress Quest is a next-generation computer role-playing game. 
                Users who have played modern online RPGs, or almost any computer role-playing game, 
                or who have at any time installed or upgraded any operating system, 
                will find themselves incredibly comfortable with Progress Quest's very familiar gameplay.
              </p>
              <button 
                style={{ fontSize: '20pt', padding: '10px 40px', marginTop: '20px', fontWeight: 'bold' }} 
                onClick={() => setView('ROSTER')}
              >
                Play!
              </button>
            </div>
          </div>
        </div>
      )}

      {(view === 'ROSTER' || view === 'NEWGUY') && (
        <Roster 
          games={games} 
          onLoad={handleLoad} 
          onDelete={handleDelete}
          onNew={() => setView('NEWGUY')}
          onImport={handleImport}
        />
      )}

      {view === 'NEWGUY' && (
        <div className="modal-overlay">
          <NewGuy onCancel={() => setView('ROSTER')} onCreate={handleCreate} />
        </div>
      )}

      {view === 'GAME' && currentGame && (
        <GameView game={currentGame} onQuit={() => {
            // Save state back to roster
            setGames(prev => ({ ...prev, [currentGame.Traits.Name]: currentGame }));
            setView('ROSTER');
        }} />
      )}
    </>
  );
}
