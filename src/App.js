import React, { useState, useEffect } from 'react';
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

  // Lock orientation on app load (for PWA)
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Try to lock orientation (works on Android PWA, some iOS)
        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (e) {
        console.log('Orientation lock not supported:', e.message);
      }
    };
    lockOrientation();
  }, []);

  const handlePlay = async (mode) => {
    // Try to lock orientation on user interaction
    try {
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock('landscape');
      }
    } catch (e) {
      // Ignore - not all browsers support this
    }
    
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
