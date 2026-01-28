import React, { useState } from 'react';
import CongkakBoard from './components/CongkakBoard';
import HomeMenu from './components/HomeMenu';
import SettingsModal from './components/SettingsModal';
import InfoModal from './components/InfoModal';
import { LanguageProvider } from './context/LanguageContext';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('quick');
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlay = (mode) => {
    setGameMode(mode);
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
            <CongkakBoard gameMode={gameMode} onMenuOpen={handleOpenMenu} />

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
    </LanguageProvider>
  );
};

export default App;
