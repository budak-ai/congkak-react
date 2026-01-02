# Congkak MVP Implementation Plan

## Overview

Implement the MVP features for Congkak: bug fixes (seed count, animation glitches), home menu with polished branding, global language selector (BM/EN), debug mode (dev builds only), and runtime assertions for game integrity.

## Current State Analysis

**Existing:**
- CongkakBoard.js: 928-line monolithic component with 27 useState hooks
- InfoModal: Bilingual rules modal with local language toggle
- Game phases: simultaneous → turn-based with 7 distinct states
- Animation: async/await with setTimeout (350ms configurable delay)

**Critical Issues:**
1. Seed count bug at lines 480-481: reads stale `seeds` array instead of `newSeeds`
2. Animation desyncs from commented `setSeeds` and inconsistent delays
3. No runtime validation (total should always equal 98)

## Desired End State

After MVP completion:
1. Total seed count is validated after every state change with clear error reporting
2. Animations are smooth without visual desyncs
3. Users see a polished home menu on load with Play, Rules, Settings options
4. Language selection persists globally via localStorage
5. Debug mode is available in development builds only

### Verification:
- Run game multiple times; seed count never deviates from 98
- No animation stuttering or visual desyncs during gameplay
- Home menu appears on initial load and is accessible during gameplay
- Language changes reflect across entire app and persist on refresh
- Debug panel visible in dev mode, hidden in production build

## What We're NOT Doing

- Multi-round traditional mode (Lubang Hangus) - deferred to subsequent release
- AI opponent - deferred
- Backend infrastructure (auth, leaderboard, cloud saves) - deferred
- Audio implementation - deferred
- Shareable result cards - deferred
- Major refactoring beyond what's needed for bug fixes

---

## Git Workflow

**Before starting implementation**, create a feature branch:
```bash
git checkout -b feature/mvp-implementation
```

**After completing each phase**, commit and push:
```bash
git add .
git commit -m "Phase X: [Phase Name] - [brief description]"
git push -u origin feature/mvp-implementation
```

Example commit messages:
- `Phase 1: Debug Mode - Add debug panel with test scenarios`
- `Phase 2: Seed Count Fix - Fix stale state bug and add validation`
- `Phase 3: Animation Fixes - Standardize delays and sync transitions`
- `Phase 4: Language System - Add global i18n with localStorage persistence`
- `Phase 5: Home Menu - Add landing page and overlay menu`

This ensures:
- Each phase is independently reversible
- Progress is tracked and backed up
- Code review can happen per-phase if needed

---

## Phase 1: Debug Mode

### Overview
Create a debug panel visible only in development builds with test scenarios. This comes first so we can use it to verify bug fixes and test other features as we build them.

### Changes Required:

#### 1. Create Debug Panel Component
**File**: `src/components/DebugPanel.js` (new file)

```javascript
import React, { useState } from 'react';
import './DebugPanel.css';

// Test scenarios for debugging
const TEST_SCENARIOS = {
  nearEndgame: {
    name: 'Near Endgame',
    description: 'Upper has 48, Lower has 45, few seeds left',
    seeds: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1],
    topHouseSeeds: 48,
    lowHouseSeeds: 45,
  },
  captureSetupUpper: {
    name: 'Capture Setup (Upper)',
    description: 'Upper can capture from hole 2',
    seeds: [7, 7, 0, 7, 7, 7, 7, 7, 7, 5, 7, 7, 7, 7],
    topHouseSeeds: 0,
    lowHouseSeeds: 0,
  },
  captureSetupLower: {
    name: 'Capture Setup (Lower)',
    description: 'Lower can capture from hole 9',
    seeds: [7, 7, 5, 7, 7, 7, 7, 7, 7, 0, 7, 7, 7, 7],
    topHouseSeeds: 0,
    lowHouseSeeds: 0,
  },
  simultaneousCollision: {
    name: 'Collision Setup',
    description: 'Both players on same vertical',
    seeds: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    topHouseSeeds: 0,
    lowHouseSeeds: 0,
    startingPositionUpper: 3,
    startingPositionLower: 10,
  },
  emptyUpperRow: {
    name: 'Empty Upper Row',
    description: 'Upper row empty, triggers turn skip',
    seeds: [0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7, 7],
    topHouseSeeds: 0,
    lowHouseSeeds: 0,
  },
  almostWin: {
    name: 'Almost Win',
    description: 'Upper at 49, one seed away',
    seeds: [1, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7, 7],
    topHouseSeeds: 49,
    lowHouseSeeds: 0,
  },
};

const DebugPanel = ({ onApplyScenario, currentSeeds, topHouseSeeds, lowHouseSeeds }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const totalSeeds = currentSeeds.reduce((a, b) => a + b, 0) + topHouseSeeds + lowHouseSeeds;

  return (
    <div className={`debug-panel ${isExpanded ? 'debug-panel--expanded' : ''}`}>
      <button
        className="debug-panel__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '🔧 Debug ▼' : '🔧 Debug ▲'}
      </button>

      {isExpanded && (
        <div className="debug-panel__content">
          <div className="debug-panel__status">
            <strong>Total Seeds:</strong> {totalSeeds}
            {totalSeeds !== 98 && <span className="debug-panel__warning"> ⚠️ Expected 98!</span>}
          </div>

          <div className="debug-panel__seeds">
            <strong>Holes:</strong> [{currentSeeds.join(', ')}]
          </div>

          <div className="debug-panel__houses">
            <span>Upper House: {topHouseSeeds}</span>
            <span>Lower House: {lowHouseSeeds}</span>
          </div>

          <div className="debug-panel__scenarios">
            <strong>Test Scenarios:</strong>
            {Object.entries(TEST_SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                className="debug-panel__scenario-btn"
                onClick={() => onApplyScenario(scenario)}
                title={scenario.description}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
```

#### 2. Create Debug Panel Styles
**File**: `src/components/DebugPanel.css` (new file)

```css
.debug-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
  color: #0f0;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  transition: transform 0.3s;
}

.debug-panel:not(.debug-panel--expanded) {
  transform: translateY(calc(100% - 30px));
}

.debug-panel__toggle {
  width: 100%;
  padding: 6px;
  background-color: #333;
  color: #0f0;
  border: none;
  cursor: pointer;
  font-family: monospace;
}

.debug-panel__toggle:hover {
  background-color: #444;
}

.debug-panel__content {
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.debug-panel__status,
.debug-panel__seeds,
.debug-panel__houses {
  margin-bottom: 0.5rem;
}

.debug-panel__warning {
  color: #ff0;
}

.debug-panel__houses {
  display: flex;
  gap: 2rem;
}

.debug-panel__scenarios {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.debug-panel__scenario-btn {
  padding: 4px 8px;
  background-color: #444;
  color: #0f0;
  border: 1px solid #0f0;
  cursor: pointer;
  font-family: monospace;
  font-size: 11px;
}

.debug-panel__scenario-btn:hover {
  background-color: #0f0;
  color: #000;
}
```

#### 3. Integrate Debug Panel into CongkakBoard
**File**: `src/components/CongkakBoard.js`

Import and add debug panel:
```javascript
import DebugPanel from './DebugPanel';

// Inside component, add handler:
const handleApplyScenario = (scenario) => {
  setSeeds([...scenario.seeds]);
  setTopHouseSeeds(scenario.topHouseSeeds);
  setLowHouseSeeds(scenario.lowHouseSeeds);

  if (scenario.startingPositionUpper !== undefined) {
    setStartingPositionUpper(scenario.startingPositionUpper);
    setCurrentHoleIndexUpper(scenario.startingPositionUpper);
  }
  if (scenario.startingPositionLower !== undefined) {
    setStartingPositionLower(scenario.startingPositionLower);
    setCurrentHoleIndexLower(scenario.startingPositionLower);
  }

  // Reset game state
  setGamePhase(STARTING_PHASE);
  setIsGameOver(false);
  setOutcomeMessage('');
  setCurrentTurn(null);
  setIsSowingUpper(false);
  setIsSowingLower(false);
  setResetCursor(!resetCursor);
};

// In render, add at end (before closing </div> of game-container):
<DebugPanel
  onApplyScenario={handleApplyScenario}
  currentSeeds={seeds}
  topHouseSeeds={topHouseSeeds}
  lowHouseSeeds={lowHouseSeeds}
/>
```

### Success Criteria:

#### Automated Verification:
- [x] App builds without errors: `npm run build`
- [x] Production build does NOT include debug panel: verify by inspecting built JS

#### Manual Verification:
- [ ] Debug panel visible at bottom of screen in development (`npm start`)
- [ ] Toggle expands/collapses panel
- [ ] Total seed count displays correctly (should show 98)
- [ ] Test scenario buttons apply correct game states
- [ ] Debug panel NOT visible in production build (`npm run build && npx serve -s build`)

**Implementation Note**: After completing this phase, the debug panel will help verify all subsequent phases.

**Git**: Commit and push before proceeding to Phase 2.

---

## Phase 2: Runtime Assertions & Seed Count Bug Fix

### Overview
Fix the critical seed count inconsistency and add runtime assertions to catch future issues. The debug panel from Phase 1 will help verify the fix.

### Changes Required:

#### 1. Create Seed Validation Utility
**File**: `src/utils/seedValidator.js` (new file)

```javascript
const EXPECTED_TOTAL = 98;

/**
 * Validates that total seeds equals expected count
 * @param {number[]} seeds - Array of seeds in holes
 * @param {number} topHouseSeeds - Seeds in upper house
 * @param {number} lowHouseSeeds - Seeds in lower house
 * @param {string} context - Description of when validation is called
 * @returns {boolean} - True if valid
 * @throws {Error} - In development, throws if invalid
 */
export const validateSeedCount = (seeds, topHouseSeeds, lowHouseSeeds, context = '') => {
  const holesTotal = seeds.reduce((sum, count) => sum + count, 0);
  const total = holesTotal + topHouseSeeds + lowHouseSeeds;

  if (total !== EXPECTED_TOTAL) {
    const error = `Seed count mismatch at ${context}: expected ${EXPECTED_TOTAL}, got ${total} (holes: ${holesTotal}, topHouse: ${topHouseSeeds}, lowHouse: ${lowHouseSeeds})`;

    if (process.env.NODE_ENV === 'development') {
      console.error(error);
      // Optionally throw to halt execution in dev
      // throw new Error(error);
    }

    return false;
  }

  return true;
};

export const EXPECTED_SEED_TOTAL = EXPECTED_TOTAL;
```

#### 2. Fix Stale State Bug in simultaneousSowing
**File**: `src/components/CongkakBoard.js`
**Lines**: 480-481

**Current (buggy):**
```javascript
let endMoveUpper = (seedsInHandUpper === 0) && seeds[currentIndexUpper] === 1;
let endMoveLower = (seedsInHandLower === 0) && seeds[currentIndexLower] === 1;
```

**Fixed:**
```javascript
let endMoveUpper = (seedsInHandUpper === 0) && newSeeds[currentIndexUpper] === 1;
let endMoveLower = (seedsInHandLower === 0) && newSeeds[currentIndexLower] === 1;
```

#### 3. Add Validation Calls Throughout CongkakBoard.js

Import at top of file:
```javascript
import { validateSeedCount } from '../utils/seedValidator';
```

Add validation after each `setSeeds` call and state-changing operations:

**After simultaneousSowing completes (around line 622):**
```javascript
validateSeedCount(newSeeds, topHouseSeeds, lowHouseSeeds, 'simultaneousSowing end');
```

**After turnBasedSowing completes (around line 817):**
```javascript
validateSeedCount(newSeeds, isUpperPlayer ? topHouseSeeds + capturedSeeds : topHouseSeeds,
                  isUpperPlayer ? lowHouseSeeds : lowHouseSeeds + capturedSeeds,
                  'turnBasedSowing end');
```

**After each capture operation:**
```javascript
validateSeedCount(newSeeds, topHouseSeeds, lowHouseSeeds, 'after capture');
```

### Success Criteria:

#### Automated Verification:
- [ ] No TypeScript/ESLint errors: `npm run lint` (if configured) or manual review
- [ ] App starts without errors: `npm start`
- [ ] Console shows no seed count mismatch errors during normal gameplay

#### Manual Verification:
- [ ] Play 5 complete games while watching debug panel - seed count stays at 98
- [ ] Specifically test capture scenarios
- [ ] Test simultaneous phase transitions
- [ ] Debug panel warning never appears during normal play

**Implementation Note**: Use the debug panel to monitor seed count in real-time during testing.

**Git**: Commit and push before proceeding to Phase 3.

---

## Phase 3: Animation Glitch Fixes

### Overview
Fix visual desyncs between cursor/seed display and actual game state.

### Changes Required:

#### 1. Standardize Animation Delays
**File**: `src/config/config.js`

Add consistent delay constants:
```javascript
const ANIMATION_DELAY = 350;
const CAPTURE_ANIMATION_DELAY = 350;
const CONTINUE_SOWING_DELAY = 200;
const INITIAL_DELAY = 350;

const config = {
    // ... existing config
    ANIMATION_DELAY: ANIMATION_DELAY,
    CAPTURE_ANIMATION_DELAY: CAPTURE_ANIMATION_DELAY,
    CONTINUE_SOWING_DELAY: CONTINUE_SOWING_DELAY,
    INITIAL_DELAY: INITIAL_DELAY,
}
```

#### 2. Update CongkakBoard.js to Use Consistent Delays
**File**: `src/components/CongkakBoard.js`

Replace hardcoded delays with config values:
- Line 420: `await new Promise(resolve => setTimeout(resolve, 400));` → use `INITIAL_DELAY`
- Line 541, 600: `await new Promise(resolve => setTimeout(resolve, 400));` → use `CAPTURE_ANIMATION_DELAY`
- Line 733: `await new Promise(resolve => setTimeout(resolve, 200));` → use `CONTINUE_SOWING_DELAY`
- Line 796: `await new Promise(resolve => setTimeout(resolve, 400));` → use `CAPTURE_ANIMATION_DELAY`

Import the new constants:
```javascript
const {
  // ... existing imports
  CAPTURE_ANIMATION_DELAY,
  CONTINUE_SOWING_DELAY,
  INITIAL_DELAY,
} = config;
```

#### 3. Sync CSS Transition with Animation Delay
**File**: `src/components/Cursor.css`

Update transition to match animation delay:
```css
.hand-cursor {
    /* ... existing styles */
    transition: top 0.35s ease-out, left 0.35s ease-out;
}
```

#### 4. Ensure State Updates Before Cursor Movement
**File**: `src/components/CongkakBoard.js`

In the simultaneous sowing loop (around line 496), ensure state is updated before animation:
```javascript
// Update state first
setSeeds([...newSeeds]);
// Then animate cursor
await new Promise(resolve => setTimeout(resolve, 0)); // Yield to let React update
```

### Success Criteria:

#### Automated Verification:
- [ ] App builds without errors: `npm run build`
- [ ] No console errors during gameplay

#### Manual Verification:
- [ ] Cursor smoothly follows seed movement without jumping
- [ ] Seed counts visually update in sync with cursor position
- [ ] Capture animations show seeds being collected smoothly
- [ ] Test rapid clicking during simultaneous phase

**Implementation Note**: After completing this phase, pause for manual testing of animation smoothness.

**Git**: Commit and push before proceeding to Phase 4.

---

## Phase 4: Global Language System

### Overview
Create a global language context that persists to localStorage and affects all UI components.

### Changes Required:

#### 1. Create Language Context
**File**: `src/context/LanguageContext.js` (new file)

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const STORAGE_KEY = 'congkak-language';
const DEFAULT_LANGUAGE = 'BM'; // BM is primary per spec

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'BM' : 'EN');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```

#### 2. Create Translation Strings
**File**: `src/config/translations.js` (new file)

```javascript
const translations = {
  // Home Menu
  'menu.play': { EN: 'Play', BM: 'Main' },
  'menu.rules': { EN: 'Rules', BM: 'Peraturan' },
  'menu.settings': { EN: 'Settings', BM: 'Tetapan' },
  'menu.title': { EN: 'Congkak', BM: 'Congkak' },
  'menu.subtitle': { EN: 'Traditional Malaysian Game', BM: 'Permainan Tradisional Malaysia' },

  // Game UI
  'game.start': { EN: 'START', BM: 'MULA' },
  'game.resume': { EN: 'RESUME', BM: 'SAMBUNG' },
  'game.restart': { EN: 'RESTART', BM: 'ULANG' },
  'game.upperTurn': { EN: "DARK's TURN", BM: 'GILIRAN GELAP' },
  'game.lowerTurn': { EN: "WHITE's TURN", BM: 'GILIRAN PUTIH' },
  'game.darkWins': { EN: 'DARK WINS', BM: 'GELAP MENANG' },
  'game.whiteWins': { EN: 'WHITE WINS', BM: 'PUTIH MENANG' },
  'game.draw': { EN: 'DRAW', BM: 'SERI' },

  // Rules Modal (existing content migrated)
  'rules.title': { EN: 'Congkak Rules', BM: 'Peraturan Congkak' },
  'rules.intro': {
    EN: 'Congkak begins with two rows of 7 holes, each filled with 7 seeds. The large holes on the sides are "houses" where players collect their seeds.',
    BM: 'Congkak bermula dengan dua baris 7 lubang, setiap satunya diisi dengan 7 biji. Lubang besar di sisi adalah "rumah" di mana pemain mengumpul biji mereka.'
  },
  'rules.startSimultaneous': {
    EN: 'Both players should choose starting hole and then press SPACE to begin the game.',
    BM: 'Kedua pemain perlu memilih lubang permulaan dan kemudian tekan SPACE untuk memulakan permainan.'
  },
  'rules.upperControls': {
    EN: 'Player DARK uses WASD keys',
    BM: 'Pemain GELAP menggunakan kekunci WASD'
  },
  'rules.lowerControls': {
    EN: 'Player WHITE uses ARROW keys',
    BM: 'Pemain PUTIH menggunakan kekunci ANAK PANAH'
  },
  'rules.sowingBasic': {
    EN: 'When you select a hole, you pick up all seeds and drop one in each subsequent hole (counter-clockwise).',
    BM: 'Apabila anda memilih lubang, anda mengambil semua biji dan menjatuhkan satu di setiap lubang berikutnya (lawan arah jam).'
  },
  'rules.landingNonEmpty': {
    EN: 'If the last seed lands in a non-empty hole, pick up all seeds and continue.',
    BM: 'Jika biji terakhir jatuh di lubang yang tidak kosong, ambil semua biji dan teruskan.'
  },
  'rules.landingHouse': {
    EN: 'If the last seed lands in your house, you get another turn.',
    BM: 'Jika biji terakhir jatuh di rumah anda, anda mendapat giliran lagi.'
  },
  'rules.capturing': {
    EN: 'If your last seed lands in an empty hole on your side (after passing your house at least once), you capture that seed plus all seeds in the opposite hole.',
    BM: 'Jika biji terakhir anda jatuh di lubang kosong di sisi anda (selepas melepasi rumah anda sekurang-kurangnya sekali), anda mengambil biji itu serta semua biji di lubang bertentangan.'
  },
  'rules.winCondition': {
    EN: 'The player who first reaches 50+ seeds in their house, or has the most seeds when all holes are empty, wins!',
    BM: 'Pemain yang pertama mencapai 50+ biji di rumah mereka, atau mempunyai paling banyak biji apabila semua lubang kosong, menang!'
  },

  // Settings
  'settings.language': { EN: 'Language', BM: 'Bahasa' },
  'settings.sound': { EN: 'Sound', BM: 'Bunyi' },
  'settings.on': { EN: 'On', BM: 'Hidup' },
  'settings.off': { EN: 'Off', BM: 'Mati' },
};

export const t = (key, language) => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }
  return translation[language] || translation['EN'] || key;
};

export default translations;
```

#### 3. Wrap App with Language Provider
**File**: `src/App.js`

```javascript
import React from 'react';
import CongkakBoard from './components/CongkakBoard';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <CongkakBoard />
    </LanguageProvider>
  );
}

export default App;
```

#### 4. Add Global Language Selector Component
**File**: `src/components/LanguageSelector.js` (new file)

```javascript
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className="language-selector"
      onClick={toggleLanguage}
      aria-label={`Switch to ${language === 'EN' ? 'Bahasa Malaysia' : 'English'}`}
    >
      {language === 'EN' ? 'EN | BM' : 'BM | EN'}
    </button>
  );
};

export default LanguageSelector;
```

**File**: `src/components/LanguageSelector.css` (new file)

```css
.language-selector {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(77, 106, 43, 0.9);
  color: #EBEBD0;
  border: 2px solid #EBEBD0;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 100;
  transition: background-color 0.2s;
}

.language-selector:hover {
  background-color: rgba(77, 106, 43, 1);
}
```

#### 5. Update InfoModal to Use Global Language
**File**: `src/components/InfoModal.js`

Replace local language state with context:
```javascript
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './InfoModal.css';

const InfoModal = ({ isOpen, toggleModal }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className='modal-overlay' onClick={toggleModal}>
      <div className='modal-content' onClick={handleModalContentClick}>
        <h2>{t('rules.title', language)}</h2>
        <ul>
          <li>{t('rules.intro', language)}</li>
          <li>{t('rules.startSimultaneous', language)}</li>
          <li><strong>{t('rules.upperControls', language)}</strong></li>
          <li><strong>{t('rules.lowerControls', language)}</strong></li>
          <li>{t('rules.sowingBasic', language)}</li>
          <li>{t('rules.landingNonEmpty', language)}</li>
          <li>{t('rules.landingHouse', language)}</li>
          <li>{t('rules.capturing', language)}</li>
          <li><strong>{t('rules.winCondition', language)}</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default InfoModal;
```

#### 6. Update CongkakBoard to Use Translations
**File**: `src/components/CongkakBoard.js`

Import and use translations for UI text:
```javascript
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import LanguageSelector from './LanguageSelector';

// Inside component:
const { language } = useLanguage();

// In render, replace hardcoded text:
// "DARK's TURN" → t('game.upperTurn', language)
// "WHITE's TURN" → t('game.lowerTurn', language)
// "START" → t('game.start', language)
// etc.
```

### Success Criteria:

#### Automated Verification:
- [ ] App builds without errors: `npm run build`
- [ ] No console warnings about missing translations

#### Manual Verification:
- [ ] Language selector visible in top-right corner
- [ ] Clicking toggles between EN and BM
- [ ] All UI text updates when language changes
- [ ] Language persists after page refresh
- [ ] InfoModal uses selected language

**Implementation Note**: After completing this phase, verify language persistence across page refreshes.

**Git**: Commit and push before proceeding to Phase 5.

---

## Phase 5: Home Menu

### Overview
Create a polished home menu that shows on initial load and can be accessed during gameplay.

### Changes Required:

#### 1. Create Home Menu Component
**File**: `src/components/HomeMenu.js` (new file)

```javascript
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import LanguageSelector from './LanguageSelector';
import './HomeMenu.css';

const HomeMenu = ({ onPlay, onRules, onSettings, isOverlay = false, onClose }) => {
  const { language } = useLanguage();

  const handleOverlayClick = (e) => {
    if (isOverlay && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className={`home-menu ${isOverlay ? 'home-menu--overlay' : 'home-menu--fullscreen'}`}
      onClick={handleOverlayClick}
    >
      <div className="home-menu__content">
        <div className="home-menu__header">
          <h1 className="home-menu__title">{t('menu.title', language)}</h1>
          <p className="home-menu__subtitle">{t('menu.subtitle', language)}</p>
        </div>

        <div className="home-menu__board-graphic">
          {/* Simplified board graphic for visual appeal */}
          <div className="home-menu__holes-row">
            {[...Array(7)].map((_, i) => (
              <div key={`top-${i}`} className="home-menu__hole" />
            ))}
          </div>
          <div className="home-menu__houses">
            <div className="home-menu__house" />
            <div className="home-menu__house" />
          </div>
          <div className="home-menu__holes-row">
            {[...Array(7)].map((_, i) => (
              <div key={`bottom-${i}`} className="home-menu__hole" />
            ))}
          </div>
        </div>

        <nav className="home-menu__nav">
          <button className="home-menu__button home-menu__button--primary" onClick={onPlay}>
            {t('menu.play', language)}
          </button>
          <button className="home-menu__button" onClick={onRules}>
            {t('menu.rules', language)}
          </button>
          <button className="home-menu__button" onClick={onSettings}>
            {t('menu.settings', language)}
          </button>
        </nav>

        {isOverlay && (
          <button className="home-menu__close" onClick={onClose} aria-label="Close menu">
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {!isOverlay && <LanguageSelector />}
    </div>
  );
};

export default HomeMenu;
```

#### 2. Create Home Menu Styles
**File**: `src/components/HomeMenu.css` (new file)

```css
.home-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #302E2B;
}

.home-menu--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.home-menu--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(48, 46, 43, 0.95);
  z-index: 1000;
}

.home-menu__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 90vw;
}

.home-menu__header {
  text-align: center;
  margin-bottom: 2rem;
}

.home-menu__title {
  font-size: 4rem;
  color: #EBEBD0;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.1em;
}

.home-menu__subtitle {
  font-size: 1.2rem;
  color: #8a8a7a;
  margin: 0.5rem 0 0 0;
}

/* Board Graphic */
.home-menu__board-graphic {
  background-color: #4d6a2b;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.home-menu__holes-row {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.home-menu__hole {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #575452;
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.home-menu__houses {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  margin: 0 -1rem;
}

.home-menu__house {
  width: 3rem;
  height: 5rem;
  background-color: #575452;
  border-radius: 1.5rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Navigation */
.home-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.home-menu__button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid #EBEBD0;
  border-radius: 8px;
  background-color: transparent;
  color: #EBEBD0;
  cursor: pointer;
  transition: all 0.2s;
}

.home-menu__button:hover {
  background-color: rgba(235, 235, 208, 0.1);
  transform: translateY(-2px);
}

.home-menu__button--primary {
  background-color: #4d6a2b;
  border-color: #4d6a2b;
}

.home-menu__button--primary:hover {
  background-color: #5d7a3b;
}

.home-menu__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #EBEBD0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.home-menu__close:hover {
  color: #fff;
}

/* Responsive */
@media (max-width: 480px) {
  .home-menu__title {
    font-size: 2.5rem;
  }

  .home-menu__hole {
    width: 2rem;
    height: 2rem;
  }

  .home-menu__house {
    width: 2.5rem;
    height: 4rem;
  }
}
```

#### 3. Create Settings Modal Component
**File**: `src/components/SettingsModal.js` (new file)

```javascript
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { language, toggleLanguage } = useLanguage();

  if (!isOpen) return null;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-content" onClick={handleContentClick}>
        <h2>{t('settings.title', language) || (language === 'EN' ? 'Settings' : 'Tetapan')}</h2>

        <div className="settings-row">
          <span className="settings-label">{t('settings.language', language)}</span>
          <button className="settings-toggle" onClick={toggleLanguage}>
            {language === 'EN' ? 'English' : 'Bahasa Malaysia'}
          </button>
        </div>

        <button className="settings-close" onClick={onClose}>
          {language === 'EN' ? 'Close' : 'Tutup'}
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
```

**File**: `src/components/SettingsModal.css` (new file)

```css
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.settings-content {
  background-color: #EBEBD0;
  color: #333;
  border-radius: 10px;
  padding: 2rem;
  min-width: 300px;
  max-width: 90vw;
}

.settings-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ccc;
}

.settings-label {
  font-weight: bold;
}

.settings-toggle {
  padding: 0.5rem 1rem;
  background-color: #4d6a2b;
  color: #EBEBD0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.settings-toggle:hover {
  background-color: #5d7a3b;
}

.settings-close {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #575452;
  color: #EBEBD0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.settings-close:hover {
  background-color: #676562;
}
```

#### 4. Update App.js to Manage Menu State
**File**: `src/App.js`

```javascript
import React, { useState } from 'react';
import CongkakBoard from './components/CongkakBoard';
import HomeMenu from './components/HomeMenu';
import SettingsModal from './components/SettingsModal';
import InfoModal from './components/InfoModal';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlay = () => {
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
      <div className="app">
        {!gameStarted && (
          <HomeMenu
            onPlay={handlePlay}
            onRules={() => setShowRules(true)}
            onSettings={() => setShowSettings(true)}
          />
        )}

        {gameStarted && (
          <>
            <CongkakBoard onMenuOpen={handleOpenMenu} />

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
}

export default App;
```

#### 5. Add Menu Button to CongkakBoard
**File**: `src/components/CongkakBoard.js`

Add prop and button:
```javascript
const CongkakBoard = ({ onMenuOpen }) => {
  // ... existing code

  // In render, add menu button near the info button:
  <button className='menu-button' onClick={onMenuOpen}>
    <i className="fa fa-bars"></i>
  </button>
```

**File**: `src/components/CongkakBoard.css`

Add menu button styles:
```css
.menu-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 0.75rem;
  background-color: rgba(77, 106, 43, 0.9);
  color: #EBEBD0;
  border: 2px solid #EBEBD0;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 100;
}

.menu-button:hover {
  background-color: rgba(77, 106, 43, 1);
}
```

### Success Criteria:

#### Automated Verification:
- [ ] App builds without errors: `npm run build`
- [ ] No console errors on initial load

#### Manual Verification:
- [ ] Home menu appears on initial page load
- [ ] Clicking "Play" transitions to game board
- [ ] Menu button (hamburger) visible during gameplay
- [ ] Clicking menu button opens overlay menu
- [ ] Can close overlay by clicking outside or X button
- [ ] Rules and Settings buttons work from both menu views
- [ ] All text respects language selection

**Implementation Note**: After completing this phase, test the full menu flow thoroughly.

**Git**: Final commit and push. Create a Pull Request to merge `feature/mvp-implementation` into `main`.

---

## Testing Strategy

### Unit Tests (Future):
- Seed validator function
- Translation helper function
- Test scenario data validity

### Integration Tests (Future):
- Game phase transitions
- Capture mechanics
- Win condition detection

### Manual Testing Steps:
1. Play complete game from home menu to win
2. Test language toggle persists through gameplay and refresh
3. Test all debug scenarios load correctly
4. Verify no seed count errors in console
5. Test on mobile viewport
6. Test overlay menu during active game

## Performance Considerations

- Language context at app root minimizes re-renders
- Debug panel conditionally rendered based on NODE_ENV
- Animation delays are configurable but should stay around 350ms for smooth visuals

## References

- Original specification: `SPEC.md`
- Main component: `src/components/CongkakBoard.js`
- Existing modal pattern: `src/components/InfoModal.js`
- Config values: `src/config/config.js`
