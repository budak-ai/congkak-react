import React, { useState } from 'react';
import CongkakBoard from './components/CongkakBoard';
import HomeMenu from './components/HomeMenu';
import SettingsModal from './components/SettingsModal';
import InfoModal from './components/InfoModal';
import OrientationLock from './components/OrientationLock';
import { LanguageProvider } from './context/LanguageContext';
import { AI_DIFFICULTY } from './ai/congkakAI';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('quick');
  const [vsAI, setVsAI] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState(AI_DIFFICULTY.MEDIUM);
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlay = (mode, isVsAI = false, difficulty = AI_DIFFICULTY.MEDIUM) => {
    setGameMode(mode);
    setVsAI(isVsAI);
    setAiDifficulty(difficulty);
    setGameStarted(true);
    setShowMenuOverlay(false);
  };

  const handleOpenMenu = () => {
    setShowMenuOverlay(true);
  };

  const handleCloseMenu = () => {
    setShowMenuOverlay(false);
  };

  return (
    <LanguageProvider>
      <OrientationLock>
        <div className="App">
          {!gameStarted && (
            <HomeMenu
              onPlay={handlePlay}
              onRules={() => setShowRules(true)}
              onSettings={() => setShowSettings(true)}
            />
          )}

          {gameStarted && (
            <>
              <CongkakBoard 
                gameMode={gameMode} 
                onMenuOpen={handleOpenMenu}
                vsAI={vsAI}
                aiDifficulty={aiDifficulty}
              />

              {showMenuOverlay && (
                <HomeMenu
                  isOverlay
                  onPlay={handleCloseMenu}
                  onRules={() => setShowRules(true)}
                  onSettings={() => setShowSettings(true)}
                  onClose={handleCloseMenu}
                />
              )}
            </>
          )}

          <InfoModal isOpen={showRules} toggleModal={() => setShowRules(false)} />
          <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
      </OrientationLock>
    </LanguageProvider>
  );
};

export default App;
