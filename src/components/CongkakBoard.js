import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import InfoModal from './InfoModal';
import DebugPanel from './DebugPanel';
import Countdown from './Countdown';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import { handleWrongSelection } from '../utils/animation';
import { toggleTurn, sumOfSeedsInCurrentRow, handleCheckGameEnd } from '../utils/helpers';
import { validateSeedCount } from '../utils/seedValidator';
import { useSeedEventLog } from '../hooks/useSeedEventLog';
import config from '../config/config';
import gamePhaseConfig from '../config/gamePhaseConfig';

const {
  INIT_SEEDS_COUNT,
  HOLE_NUMBERS,
  PLAYER_LOWER,
  PLAYER_UPPER,
  MIN_INDEX_UPPER,
  MAX_INDEX_UPPER,
  MIN_INDEX_LOWER,
  MAX_INDEX_LOWER,
  CAPTURE_ANIMATION_DELAY,
  CONTINUE_SOWING_DELAY,
  INITIAL_DELAY,
} = config;

const {
  COUNTDOWN,
  FREEPLAY,
  TURN_BASED_SELECT,
  TURN_BASED_SOWING,
  ROUND_END,
  REDISTRIBUTING,
  MATCH_END
} = gamePhaseConfig;

const CongkakBoard = ({ gameMode = 'quick', onMenuOpen }) => {
  const { language } = useLanguage();

  // Seed event logging for debugging
  const { eventLog, logVersion, logEvent, snapshot, clearLog } = useSeedEventLog();

  const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses
  const seedsRef = useRef(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // Ref for real-time sync in freeplay

  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);
  
  const [gamePhase, setGamePhase] = useState(COUNTDOWN); // Start with countdown

  // Freeplay mode states
  const [showStartButton, setShowStartButton] = useState(true); // Show start button before game
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0); // Key to force Countdown remount on reset
  const [disableCursorTransition, setDisableCursorTransition] = useState(false); // Disable cursor animation during reset
  const [freeplayWaitingUpper, setFreeplayWaitingUpper] = useState(false); // Upper's turn ended, waiting
  const [freeplayWaitingLower, setFreeplayWaitingLower] = useState(false); // Lower's turn ended, waiting
  const freeplayWaitingUpperRef = useRef(false); // Ref for real-time waiting state
  const freeplayWaitingLowerRef = useRef(false); // Ref for real-time waiting state
  const firstToEndRef = useRef(null); // Track who ended first in freeplay
  const resetRequestedRef = useRef(false); // Flag to abort sowing on reset
  const resetGenerationRef = useRef(0); // Increments on each reset to invalidate pending operations
  const gamePausedRef = useRef(true); // Blocks ALL cursor updates when true (starts paused)

  // Refs for real-time sowing state (to avoid stale closure in freeplay transition)
  const isSowingUpperRef = useRef(false);
  const isSowingLowerRef = useRef(false);


  const [cursorVisibilityUpper, setCursorVisibilityUpper] = useState({ visible: true });
  const [cursorVisibilityLower, setCursorVisibilityLower] = useState({ visible: true });

  // const startIndexUpper = Math.round((MIN_INDEX_UPPER + MAX_INDEX_UPPER) / 2);
  // const startIndexLower = Math.round((MIN_INDEX_LOWER + MAX_INDEX_LOWER) / 2);
  const startIndexUpper = MIN_INDEX_UPPER;
  const startIndexLower = MIN_INDEX_LOWER;

  const [currentHoleIndexUpper, setCurrentHoleIndexUpper] = useState(startIndexUpper); 
  const [currentHoleIndexLower, setCurrentHoleIndexLower] = useState(startIndexLower);

  const [cursorLeftUpper, setCursorLeftUpper] = useState(window.innerWidth / 2);
  const [cursorTopUpper, setCursorTopUpper] = useState(window.innerHeight / 3);

  const [cursorLeftLower, setCursorLeftLower] = useState(window.innerWidth / 2);
  const [cursorTopLower, setCursorTopLower] = useState(window.innerHeight * 2 / 4);

  const [resetCursor, setResetCursor] = useState(false);
  
  const [currentTurn, setCurrentTurn] = useState(null);
  const [isSowingUpper, setIsSowingUpper] = useState(false);
  const [isSowingLower, setIsSowingLower] = useState(false);
  
  // const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);
  const [passedHouse, setPassedHouse] = useState(0);
  const [currentSeedsInHandUpper, setCurrentSeedsInHandUpper] = useState(0);
  const [currentSeedsInHandLower, setCurrentSeedsInHandLower] = useState(0);
  const currentSeedsInHandUpperRef = useRef(0);
  const currentSeedsInHandLowerRef = useRef(0);
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  const topHouseSeedsRef = useRef(0);
  const lowHouseSeedsRef = useRef(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');

  // Traditional mode state
  const [currentRound, setCurrentRound] = useState(1);
  const [burnedHolesUpper, setBurnedHolesUpper] = useState([false, false, false, false, false, false, false]);
  const [burnedHolesLower, setBurnedHolesLower] = useState([false, false, false, false, false, false, false]);
  const [matchEnded, setMatchEnded] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null);
  const [matchEndReason, setMatchEndReason] = useState(''); // 'domination', 'concession', 'voluntary'

  // Helper to check if a hole is burned
  const isHoleBurned = (index) => {
    if (index >= 0 && index <= 6) {
      return burnedHolesUpper[index];
    } else if (index >= 7 && index <= 13) {
      return burnedHolesLower[index - 7];
    }
    return false;
  };

  // Get next valid hole, skipping burned holes (for traditional mode)
  const getNextValidHole = (currentIndex) => {
    let next = currentIndex;
    let iterations = 0;
    const maxIterations = 20; // Safety limit

    do {
      // Normal increment
      next = (next + 1) % HOLE_NUMBERS;

      // Check if this hole is burned
      const isBurned = (next >= 0 && next <= 6)
        ? burnedHolesUpper[next]
        : burnedHolesLower[next - 7];

      // If not burned, this is valid
      if (!isBurned) {
        return { nextIndex: next, skipped: iterations > 0 };
      }

      iterations++;
    } while (iterations < maxIterations);

    // Fallback (shouldn't happen unless all holes burned)
    return { nextIndex: next, skipped: false };
  };

  const gameContainerRef = useRef(null);
  
  const verticalPosUpper = config.VERTICAL_POS_UPPER;
  const verticalPosLower = config.VERTICAL_POS_LOWER;

  const animationDelay = config.ANIMATION_DELAY;

  const [shakeCursorUpper, setShakeCursorUpper] = useState(false);
  const [shakeCursorLower, setShakeCursorLower] = useState(false);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  // Helper to update seeds state and ref atomically (with optional logging)
  const updateSeeds = (newSeeds, context = null) => {
    seedsRef.current = newSeeds;
    setSeeds([...newSeeds]);

    // Log if context provided
    if (context) {
      logEvent('seeds', context, {
        seeds: newSeeds,
        topHouse: topHouseSeedsRef.current,
        lowHouse: lowHouseSeedsRef.current,
        seedsInHand: currentSeedsInHandUpperRef.current + currentSeedsInHandLowerRef.current,
      });
    }
  };

  // Helpers to update house seeds state and ref atomically (with optional logging)
  const updateTopHouseSeeds = (value, context = null) => {
    topHouseSeedsRef.current = value;
    setTopHouseSeeds(value);

    if (context) {
      logEvent('topHouse', context, {
        seeds: seedsRef.current,
        topHouse: value,
        lowHouse: lowHouseSeedsRef.current,
        seedsInHand: currentSeedsInHandUpperRef.current + currentSeedsInHandLowerRef.current,
      });
    }
  };

  const updateLowHouseSeeds = (value, context = null) => {
    lowHouseSeedsRef.current = value;
    setLowHouseSeeds(value);

    if (context) {
      logEvent('lowHouse', context, {
        seeds: seedsRef.current,
        topHouse: topHouseSeedsRef.current,
        lowHouse: value,
        seedsInHand: currentSeedsInHandUpperRef.current + currentSeedsInHandLowerRef.current,
      });
    }
  };

  // Helpers to update seeds in hand state and ref atomically
  const updateSeedsInHandUpper = (value) => {
    currentSeedsInHandUpperRef.current = value;
    setCurrentSeedsInHandUpper(value);
  };

  const updateSeedsInHandLower = (value) => {
    currentSeedsInHandLowerRef.current = value;
    setCurrentSeedsInHandLower(value);
  };

  // Helpers to update sowing state and ref atomically
  const updateIsSowingUpper = (value) => {
    isSowingUpperRef.current = value;
    setIsSowingUpper(value);
  };

  const updateIsSowingLower = (value) => {
    isSowingLowerRef.current = value;
    setIsSowingLower(value);
  };

  // Helpers to update freeplay waiting state and ref atomically
  const updateFreeplayWaitingUpper = (value) => {
    freeplayWaitingUpperRef.current = value;
    setFreeplayWaitingUpper(value);
  };

  const updateFreeplayWaitingLower = (value) => {
    freeplayWaitingLowerRef.current = value;
    setFreeplayWaitingLower(value);
  };

  // Start button click handler
  const handleStartClick = () => {
    setShowStartButton(false);
    setShowCountdown(true);
    setCountdownKey(prev => prev + 1); // Ensure fresh countdown
  };

  // Countdown completion handler for freeplay mode
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setGamePhase(FREEPLAY);
    // Unpause the game - allow cursor updates
    gamePausedRef.current = false;
  };

  // Debug panel handler for applying test scenarios
  const handleApplyScenario = (scenario) => {
    // Initialize snapshot for diff tracking
    snapshot(scenario.seeds, scenario.topHouseSeeds, scenario.lowHouseSeeds);

    updateSeeds([...scenario.seeds]);
    updateTopHouseSeeds(scenario.topHouseSeeds);
    updateLowHouseSeeds(scenario.lowHouseSeeds);

    if (scenario.startingPositionUpper !== undefined) {
      setCurrentHoleIndexUpper(scenario.startingPositionUpper);
    }
    if (scenario.startingPositionLower !== undefined) {
      setCurrentHoleIndexLower(scenario.startingPositionLower);
    }

    // Reset game state - start in freeplay mode
    setGamePhase(FREEPLAY);
    setShowCountdown(false);
    setIsGameOver(false);
    setOutcomeMessage('');
    setCurrentTurn(null);
    updateIsSowingUpper(false);
    updateIsSowingLower(false);
    updateFreeplayWaitingUpper(false);
    updateFreeplayWaitingLower(false);
    firstToEndRef.current = null;
    setResetCursor(!resetCursor);

    // Apply burned holes if specified in scenario
    if (scenario.burnedHolesUpper !== undefined) {
      setBurnedHolesUpper([...scenario.burnedHolesUpper]);
    } else {
      setBurnedHolesUpper([false, false, false, false, false, false, false]);
    }
    if (scenario.burnedHolesLower !== undefined) {
      setBurnedHolesLower([...scenario.burnedHolesLower]);
    } else {
      setBurnedHolesLower([false, false, false, false, false, false, false]);
    }

    // Log scenario application
    logEvent('scenario', scenario.name || 'custom', {
      seeds: scenario.seeds,
      topHouse: scenario.topHouseSeeds,
      lowHouse: scenario.lowHouseSeeds,
      seedsInHand: 0,
    });
  };

  // Debug panel handlers for individual board modifications
  const handleUpdateHole = (index, value) => {
    const newSeeds = [...seedsRef.current];
    newSeeds[index] = value;
    updateSeeds(newSeeds, `debug: hole[${index}]=${value}`);
  };

  const handleUpdateTopHouse = (value) => {
    updateTopHouseSeeds(value, `debug: topHouse=${value}`);
  };

  const handleUpdateLowHouse = (value) => {
    updateLowHouseSeeds(value, `debug: lowHouse=${value}`);
  };

  // Quick reset handler - snappy immediate reset
  const handleQuickReset = () => {
    // PAUSE FIRST - blocks all cursor updates
    gamePausedRef.current = true;

    // Increment generation to invalidate all pending cursor updates
    resetGenerationRef.current++;

    // Signal abort to any running sowing operations
    resetRequestedRef.current = true;

    // Disable cursor transition for instant snap
    setDisableCursorTransition(true);

    // Reset seeds
    updateSeeds(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT));
    updateTopHouseSeeds(0);
    updateLowHouseSeeds(0);
    updateSeedsInHandUpper(0);
    updateSeedsInHandLower(0);

    // Reset game state - show start button
    setGamePhase(COUNTDOWN);
    setShowStartButton(true);
    setShowCountdown(false);
    setIsGameOver(false);
    setOutcomeMessage('');
    setCurrentTurn(null);
    updateIsSowingUpper(false);
    updateIsSowingLower(false);
    updateFreeplayWaitingUpper(false);
    updateFreeplayWaitingLower(false);
    firstToEndRef.current = null;
    setPassedHouse(0);

    // Reset cursor positions immediately
    setCurrentHoleIndexUpper(startIndexUpper);
    setCurrentHoleIndexLower(startIndexLower);

    // Set cursor positions directly with forceUpdate to bypass all checks
    const upperHole = holeRefs.current[startIndexUpper];
    const lowerHole = holeRefs.current[startIndexLower];
    if (upperHole) {
      const rect = upperHole.getBoundingClientRect();
      setCursorLeftUpper(rect.left + window.scrollX);
      setCursorTopUpper(rect.top + window.scrollY + (verticalPosUpper * rect.height));
    }
    if (lowerHole) {
      const rect = lowerHole.getBoundingClientRect();
      setCursorLeftLower(rect.left + window.scrollX);
      setCursorTopLower(rect.top + window.scrollY + (verticalPosLower * rect.height));
    }

    // Re-enable transitions after next frame (game stays paused until START)
    requestAnimationFrame(() => {
      resetRequestedRef.current = false;
      setDisableCursorTransition(false);
    });
  };

  // Define the handlers for the mobile buttons
  const handleSButtonPress = async (index) => {
    // Block input when paused
    if (gamePausedRef.current) return;
    // Cannot select burned hole in traditional mode
    if (gameMode === 'traditional' && isHoleBurned(index)) {
      handleWrongSelection(setShakeCursorUpper, setShowSelectionMessage);
      return;
    }
    if (!isSowingUpper) {
      // Freeplay mode - both players sow independently using turn-based logic
      if (gamePhase === FREEPLAY) {
        // Check if waiting for other player
        if (freeplayWaitingUpper) {
          console.log(`[INPUT] Upper is waiting, cannot pick`);
          handleWrongSelection(setShakeCursorUpper, setShowSelectionMessage);
          return;
        }
        if (seeds[index] === 0) {
          handleWrongSelection(setShakeCursorUpper, setShowSelectionMessage);
          return;
        }
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        sowing(index, PLAYER_UPPER);
      // Turn-based mode
      } else if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_UPPER) {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setGamePhase(TURN_BASED_SOWING);
        sowing(index, PLAYER_UPPER);
      }
    }
  };

  const handleArrowDownPress = async (index) => {
    // Block input when paused
    if (gamePausedRef.current) return;
    // Cannot select burned hole in traditional mode
    if (gameMode === 'traditional' && isHoleBurned(index)) {
      handleWrongSelection(setShakeCursorLower, setShowSelectionMessage);
      return;
    }
    if (!isSowingLower) {
      // Freeplay mode - both players sow independently using turn-based logic
      if (gamePhase === FREEPLAY) {
        // Check if waiting for other player
        if (freeplayWaitingLower) {
          console.log(`[INPUT] Lower is waiting, cannot pick`);
          handleWrongSelection(setShakeCursorLower, setShowSelectionMessage);
          return;
        }
        if (seeds[index] === 0) {
          handleWrongSelection(setShakeCursorLower, setShowSelectionMessage);
          return;
        }
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        sowing(index, PLAYER_LOWER);
      // Turn-based mode
      } else if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_LOWER) {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setGamePhase(TURN_BASED_SOWING);
        sowing(index, PLAYER_LOWER);
      }
    }
  };

  // Function to update cursor position for PlayerUpper
  const updateCursorPositionUpper = async (ref, indexOrElement, verticalPosUpper, forceUpdate = false) => {
    // Block ALL updates when game is paused (unless forcing)
    if (!forceUpdate && gamePausedRef.current) return;

    // Capture generation at start - if it changes, abort
    const myGeneration = resetGenerationRef.current;

    // Abort if reset requested (unless forcing for reset itself)
    if (!forceUpdate && resetRequestedRef.current) return;

    let element;

    // determine if indexOrElement is an index or a DOM element
    if (typeof indexOrElement === "number") {
      element = ref.current[indexOrElement];
    } else {
      element = indexOrElement;
    }

    if (element) {
      // Check game not paused and generation hasn't changed
      if (!forceUpdate && gamePausedRef.current) return;
      if (!forceUpdate && myGeneration !== resetGenerationRef.current) return;
      if (!forceUpdate && resetRequestedRef.current) return;

      const rect = element.getBoundingClientRect();
      setCursorLeftUpper(rect.left + window.scrollX);
      setCursorTopUpper(rect.top + window.scrollY + (verticalPosUpper * rect.height));

      // Skip delay if reset requested or forced update
      if (forceUpdate || resetRequestedRef.current || gamePausedRef.current) return;
      if (myGeneration !== resetGenerationRef.current) return;

      await new Promise(resolve => setTimeout(resolve, animationDelay)); // Animation delay
    }
  };

  // Function to update cursor position for PlayerLower
  const updateCursorPositionLower = async (ref, indexOrElement, verticalPosLower, forceUpdate = false) => {
    // Block ALL updates when game is paused (unless forcing)
    if (!forceUpdate && gamePausedRef.current) return;

    // Capture generation at start - if it changes, abort
    const myGeneration = resetGenerationRef.current;

    // Abort if reset requested (unless forcing for reset itself)
    if (!forceUpdate && resetRequestedRef.current) return;

    let element;
    // determine if indexOrElement is an index or a DOM element
    if (typeof indexOrElement === "number") {
      element = ref.current[indexOrElement];
    } else {
      element = indexOrElement;
    }

    if (element) {
      // Check game not paused and generation hasn't changed
      if (!forceUpdate && gamePausedRef.current) return;
      if (!forceUpdate && myGeneration !== resetGenerationRef.current) return;
      if (!forceUpdate && resetRequestedRef.current) return;

      const rect = element.getBoundingClientRect();
      setCursorLeftLower(rect.left + window.scrollX);
      setCursorTopLower(rect.top + window.scrollY + (verticalPosLower * rect.height));

      // Skip delay if reset requested or forced update
      if (forceUpdate || resetRequestedRef.current || gamePausedRef.current) return;
      if (myGeneration !== resetGenerationRef.current) return;

      await new Promise(resolve => setTimeout(resolve, animationDelay)); // Animation delay
    }
  };

  /**=========================================================
  *                      Reset cursors 
  * ==========================================================*/
  useEffect(() => {
    resetCursorPosition();
    const handleResize = () => resetCursorPosition();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    
    function resetCursorPosition() {
      const resetUpper = () => {
        updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
        setCurrentHoleIndexUpper(startIndexUpper);
      }

      const resetLower = () => {
        updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
        setCurrentHoleIndexLower(startIndexLower);
      }

      if (!isSowingUpper) {
        resetUpper();
      } 
      
      if (!isSowingLower) { 
        resetLower();
      } 
    }
  }, [holeRefs, resetCursor, isSowingUpper, isSowingLower]);

  /**=========================================================
  *                    Cursor visibility
  * ==========================================================*/
  useEffect(() => {
    // In freeplay: visible unless waiting, in turn-based: visible only if it's your turn
    if (gamePhase === COUNTDOWN) {
      setCursorVisibilityUpper({ visible: true, canMove: false });
      setCursorVisibilityLower({ visible: true, canMove: false });
    } else if (gamePhase === FREEPLAY) {
      // Hide cursor when waiting in freeplay
      setCursorVisibilityUpper({
        visible: !freeplayWaitingUpper,
        canMove: !freeplayWaitingUpper && !isSowingUpper
      });
      setCursorVisibilityLower({
        visible: !freeplayWaitingLower,
        canMove: !freeplayWaitingLower && !isSowingLower
      });
    } else {
      // Turn-based mode
      setCursorVisibilityUpper({
        visible: currentTurn === PLAYER_UPPER,
        canMove: currentTurn === PLAYER_UPPER && gamePhase === TURN_BASED_SELECT
      });
      setCursorVisibilityLower({
        visible: currentTurn === PLAYER_LOWER,
        canMove: currentTurn === PLAYER_LOWER && gamePhase === TURN_BASED_SELECT
      });
    }
  }, [gamePhase, currentTurn, freeplayWaitingUpper, freeplayWaitingLower, isSowingUpper, isSowingLower]);


  /**=========================================================
  *                    Keydown listener 
  * ==========================================================*/
  useEffect(() => {

    const handleKeyDown = (event) => {
      // Block all keyboard input when paused
      if (gamePausedRef.current) return;

      let newIndexUpper = currentHoleIndexUpper;
      let newIndexLower = currentHoleIndexLower;

      // Handle PlayerUpper's left and right movement
      if (!isSowingUpper) {
        if (event.key === 'a' || event.key === 'A') {
          newIndexUpper = Math.max(0, currentHoleIndexUpper - 1); // decrease
          // Skip burned holes in traditional mode
          if (gameMode === 'traditional') {
            while (newIndexUpper > 0 && isHoleBurned(newIndexUpper)) {
              newIndexUpper--;
            }
          }
        } else if (event.key === 'd' || event.key === 'D') {
          newIndexUpper = Math.min(MAX_INDEX_UPPER, currentHoleIndexUpper + 1); // increase
          // Skip burned holes in traditional mode
          if (gameMode === 'traditional') {
            while (newIndexUpper < MAX_INDEX_UPPER && isHoleBurned(newIndexUpper)) {
              newIndexUpper++;
            }
          }
        }
        setCurrentHoleIndexUpper(newIndexUpper);
        updateCursorPositionUpper(holeRefs, newIndexUpper, verticalPosUpper);

        // Start sowing
        if (event.key === 's' || event.key === 'S') {
          if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_UPPER) {
            setGamePhase(TURN_BASED_SOWING);
            sowing(newIndexUpper, PLAYER_UPPER);
          }
        }
      }

      if (!isSowingLower) {
        // Handle PlayerLower's left and right movement (reversed)
        if (event.key === 'ArrowLeft') {
          newIndexLower = Math.min(MAX_INDEX_LOWER, currentHoleIndexLower + 1); // Increment index
          // Skip burned holes in traditional mode
          if (gameMode === 'traditional') {
            while (newIndexLower < MAX_INDEX_LOWER && isHoleBurned(newIndexLower)) {
              newIndexLower++;
            }
          }
        } else if (event.key === 'ArrowRight') {
          newIndexLower = Math.max(MIN_INDEX_LOWER, currentHoleIndexLower - 1); // Decrement index
          // Skip burned holes in traditional mode
          if (gameMode === 'traditional') {
            while (newIndexLower > MIN_INDEX_LOWER && isHoleBurned(newIndexLower)) {
              newIndexLower--;
            }
          }
        }
        setCurrentHoleIndexLower(newIndexLower);
        updateCursorPositionLower(holeRefs, newIndexLower, verticalPosLower);

        if (event.key === 'ArrowDown') {
          if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_LOWER) {
            setGamePhase(TURN_BASED_SOWING);
            sowing(newIndexLower, PLAYER_LOWER);
          }
        }
      }

    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };    
  }, [currentHoleIndexUpper, currentHoleIndexLower, holeRefs, verticalPosUpper, verticalPosLower, isSowingUpper, isSowingLower, gamePhase]);

  // GameOver Checker
  useEffect(() => {
    if (!isSowingUpper && !isSowingLower) {
      handleCheckGameEnd(seeds, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage);
    }
  }, [isSowingUpper, isSowingLower, seeds, topHouseSeeds, lowHouseSeeds]);

  // Skip turn if the whole row is empty
  useEffect(() => {
    if ((!isSowingUpper && !isSowingLower ) && !isGameOver) {
      let sum = sumOfSeedsInCurrentRow(seeds, currentTurn, config);
      if (sum === 0) {
        toggleTurn(setCurrentTurn, currentTurn);
      }
    }
  }, [seeds, currentTurn, isSowingUpper, isSowingLower, isGameOver]);

/**==============================================
 *        SOWING LOGIC
 * =============================================*/
  const sowing = async (index, player, isContinuation = false, passedHouse = 0) => {
    // Helper to check if sowing should abort
    const shouldAbort = () => gamePausedRef.current || resetRequestedRef.current;

    // Abort immediately if paused/reset
    if (shouldAbort()) return;

    // Determine player-specific states and actions
    const isUpperPlayer = player === PLAYER_UPPER;
    const currentHouseRef = isUpperPlayer ? topHouseRef : lowHouseRef;
    const updateIsSowing = isUpperPlayer ? updateIsSowingUpper : updateIsSowingLower;
    const setShakeCursor = isUpperPlayer ? setShakeCursorUpper : setShakeCursorLower;
    const updateHouseSeeds = isUpperPlayer ? updateTopHouseSeeds : updateLowHouseSeeds;
    const getHouseSeedsRef = isUpperPlayer ? topHouseSeedsRef : lowHouseSeedsRef;
    const updateSeedsInHand = isUpperPlayer ? updateSeedsInHandUpper : updateSeedsInHandLower;
    const setCurrentHoleIndex = isUpperPlayer ? setCurrentHoleIndexUpper : setCurrentHoleIndexLower;
    const verticalAdjustment = isUpperPlayer ? -0.5 : 0.5;
    const maxIndex = isUpperPlayer ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;
    const minIndex = isUpperPlayer ? MIN_INDEX_LOWER : 0;
    
    // Start sowing
    updateIsSowing(true);
    
    let currentIndex = index;
    let newSeeds = [...seedsRef.current]; // Use ref for real-time state in freeplay
    let seedsInHand = isContinuation ? (isUpperPlayer ? currentSeedsInHandUpper : newSeeds[index]) : newSeeds[index];
    // let seedsInHand = newSeeds[index];
    let hasPassedHouse = passedHouse;
    let justFilledHome = false;
    let getAnotherTurn = false;
    
    if (!isContinuation) {
      // Prevent picking from empty hole
      if (seedsInHand === 0) {
        console.log("Cannot pick empty hole. Pick again.");
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
        // Don't change game phase - just reject the pick
        updateIsSowing(false);
        return;
      }
    }
    updateSeedsInHand(seedsInHand);
    newSeeds[index] = 0;
    updateSeeds(newSeeds);
    const totalAfterPickup = newSeeds.reduce((a, b) => a + b, 0) + topHouseSeedsRef.current + lowHouseSeedsRef.current + seedsInHand;
    console.log(`[SEEDS] Pickup from hole ${index} | inHand: ${seedsInHand} | total: ${totalAfterPickup}`);

    // Pick up animation
    if (isUpperPlayer) {
      await updateCursorPositionUpper(holeRefs, currentIndex, 0);
    } else {
      await updateCursorPositionLower(holeRefs, currentIndex, 0);
    }
    if (shouldAbort()) return;
    console.log("Starting turn based sowing")
    console.log("Seeds in hands: ", seedsInHand);
    while (seedsInHand > 0) {
      // Check for pause/reset abort
      if (shouldAbort()) {
        console.log(`[ABORT] Sowing aborted`);
        return;
      }
      /** ============================================
       *              Sowing to House
       * ===========================================*/
      if (currentIndex === maxIndex) {
        hasPassedHouse++;
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        const newHouseValue = getHouseSeedsRef.current + 1;
        updateHouseSeeds(newHouseValue);
        console.log(`[SEEDS] Drop in ${isUpperPlayer ? 'UPPER' : 'LOWER'} house | house now: ${newHouseValue}`);
        seedsInHand--;
        updateSeedsInHand(seedsInHand);
        if (seedsInHand > 0) {
          justFilledHome = true;
          currentIndex = minIndex;
        } else {
          getAnotherTurn = true;
          updateIsSowing(false);

          // reset cursor position
          if (isUpperPlayer) {
            await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
            setCurrentHoleIndex(startIndexUpper);
          } else {
            await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
            setCurrentHoleIndex(startIndexLower);
          }
          continue;
        }
      }
    
      // Move to the next hole in a circular way
      if (justFilledHome) {
        justFilledHome = false;
        // After house, check if minIndex is burned (traditional mode)
        if (gameMode === 'traditional' && isHoleBurned(currentIndex)) {
          const result = getNextValidHole(currentIndex);
          currentIndex = result.nextIndex;
        }
      } else {
        if (gameMode === 'traditional') {
          const result = getNextValidHole(currentIndex);
          currentIndex = result.nextIndex;
          // Add delay for skipped holes to maintain rhythm
          if (result.skipped) {
            await new Promise(resolve => setTimeout(resolve, animationDelay));
          }
        } else {
          currentIndex = (currentIndex + 1) % HOLE_NUMBERS;
        }
      }

      if (isUpperPlayer) {
        await updateCursorPositionUpper(holeRefs, currentIndex, verticalAdjustment);
      } else {
        await updateCursorPositionLower(holeRefs, currentIndex, verticalAdjustment);
      }

      if (shouldAbort()) return;

      // Update holes - read latest state, modify, write back
      newSeeds = [...seedsRef.current];
      newSeeds[currentIndex]++;
      updateSeeds(newSeeds);
      console.log(`[SEEDS] Drop at hole ${currentIndex} | hole now: ${newSeeds[currentIndex]} | inHand: ${seedsInHand - 1}`);

      // Update seeds in hand
      seedsInHand--;
      updateSeedsInHand(seedsInHand);
    
      /** ============================================
       *  If landed on non-empty house, continue sowing
       * ===========================================*/
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        await new Promise(resolve => setTimeout(resolve, CONTINUE_SOWING_DELAY)); // Animation delay
        if (shouldAbort()) return;
        // Read latest state for continue sowing
        newSeeds = [...seedsRef.current];
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        updateSeedsInHand(seedsInHand);

        // Empty the current hole
        newSeeds[currentIndex] = 0;
        updateSeeds(newSeeds);
        console.log(`[SEEDS] Continue: pickup from hole ${currentIndex} | inHand: ${seedsInHand}`);

        // Pick up animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }

      } 
    
       /** ============================================
       *               Capturing
       * ===========================================*/
      // If landed in empty hole, check for capture
      if (seedsInHand === 0 && newSeeds[currentIndex] === 1) {

        // Capture only if the player has passed their house at least once
        if (hasPassedHouse === 0) continue;

        // Determine if the row is the current player's side
        const isTopRowHole = currentIndex < MIN_INDEX_LOWER;
        const isCurrentTurnRow = (isUpperPlayer && isTopRowHole) ||
                                 (!isUpperPlayer && !isTopRowHole);

        // Skip if not
        if (!isCurrentTurnRow) continue;

        // Calculate the opposite index
        const oppositeIndex = MAX_INDEX_LOWER - currentIndex;

        // Check if opposite hole is burned (no capture possible in traditional mode)
        if (gameMode === 'traditional' && isHoleBurned(oppositeIndex)) continue;

        // Read latest state for capture check
        newSeeds = [...seedsRef.current];

        // Check if the opposite hole has seeds
        if (newSeeds[oppositeIndex] === 0) continue;

        // Pick up current hole animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }
        seedsInHand = newSeeds[currentIndex];
        updateSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0;
        updateSeeds(newSeeds);
        console.log(`[SEEDS] Capture: pickup own hole ${currentIndex} | inHand: ${seedsInHand}`);

        // Capturing ... (picking up from opposite hole)
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, oppositeIndex, verticalAdjustment);
        } else {
          await updateCursorPositionLower(holeRefs, oppositeIndex, verticalAdjustment);
        }
        // Read latest state again for opposite hole
        newSeeds = [...seedsRef.current];
        const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
        seedsInHand = capturedSeeds;
        updateSeedsInHand(seedsInHand);
        newSeeds[oppositeIndex] = 0;
        updateSeeds(newSeeds);
        console.log(`[SEEDS] Capture: pickup opposite hole ${oppositeIndex} | total captured: ${capturedSeeds}`);

        await new Promise(resolve => setTimeout(resolve, CAPTURE_ANIMATION_DELAY)); // Animation delay
        if (shouldAbort()) return;
        // Send captured seeds to House
        // Animate cursor to the appropriate house and add captured seeds
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        const newHouseValueAfterCapture = getHouseSeedsRef.current + capturedSeeds;
        updateHouseSeeds(newHouseValueAfterCapture);
        console.log(`[SEEDS] Captured ${capturedSeeds} to ${isUpperPlayer ? 'UPPER' : 'LOWER'} house | house now: ${newHouseValueAfterCapture}`);

        // reset cursor position
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
        } else {
          await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
        }
      
        // Update the state with the new distribution of seeds
        seedsInHand = 0;
        updateSeedsInHand(seedsInHand);
      }
    }
    // End of sowing
    updateIsSowing(false);

    // Handle game phase transitions
    if (gamePhase === FREEPLAY) {
      if (getAnotherTurn) {
        // Landed in house - can pick again, stay in freeplay
        console.log(`[PHASE] ${isUpperPlayer ? 'UPPER' : 'LOWER'} landed in house, can pick again`);
      } else {
        // Turn ended - check if other player is still playing
        // Use refs to get real-time state (avoid stale closure problem)
        const updateWaiting = isUpperPlayer ? updateFreeplayWaitingUpper : updateFreeplayWaitingLower;
        const otherWaitingRef = isUpperPlayer ? freeplayWaitingLowerRef : freeplayWaitingUpperRef;
        const otherSowingRef = isUpperPlayer ? isSowingLowerRef : isSowingUpperRef;

        if (otherSowingRef.current) {
          // Other player still sowing - this player waits
          updateWaiting(true);
          if (firstToEndRef.current === null) {
            firstToEndRef.current = player;
          }
          console.log(`[PHASE] ${isUpperPlayer ? 'UPPER' : 'LOWER'} turn ended, waiting for other player`);
        } else if (otherWaitingRef.current) {
          // Other player already waiting - transition to turn-based
          // First to end gets the next turn
          const nextTurn = firstToEndRef.current === PLAYER_UPPER ? PLAYER_UPPER : PLAYER_LOWER;
          setCurrentTurn(nextTurn);
          setGamePhase(TURN_BASED_SELECT);
          // Reset freeplay states
          updateFreeplayWaitingUpper(false);
          updateFreeplayWaitingLower(false);
          firstToEndRef.current = null;
          console.log(`[PHASE] Both ended. Transition to TURN_BASED: ${nextTurn === PLAYER_UPPER ? 'UPPER' : 'LOWER'}'s turn`);
        } else {
          // Other player not sowing and not waiting - they haven't started yet or also just ended
          // This player waits
          updateWaiting(true);
          if (firstToEndRef.current === null) {
            firstToEndRef.current = player;
          }
          console.log(`[PHASE] ${isUpperPlayer ? 'UPPER' : 'LOWER'} turn ended, waiting`);
        }
      }
    } else {
      // Already in turn-based mode
      if (!getAnotherTurn) {
        toggleTurn(setCurrentTurn, currentTurn);
      }
      setGamePhase(TURN_BASED_SELECT);
    }

    // Validate seed count at end of sowing - read latest state from refs
    const finalSeeds = [...seedsRef.current];
    const finalTopHouse = topHouseSeedsRef.current;
    const finalLowHouse = lowHouseSeedsRef.current;
    const upperInHand = currentSeedsInHandUpperRef.current;
    const lowerInHand = currentSeedsInHandLowerRef.current;
    const finalTotal = finalSeeds.reduce((a, b) => a + b, 0) + finalTopHouse + finalLowHouse + upperInHand + lowerInHand;
    console.log(`[SEEDS] === ${isUpperPlayer ? 'UPPER' : 'LOWER'} SOWING END === | phase: ${gamePhase} | upperHouse: ${finalTopHouse} | lowerHouse: ${finalLowHouse} | TOTAL: ${finalTotal}`);
    validateSeedCount(finalSeeds, finalTopHouse, finalLowHouse, 'sowing end');

    // Log checkpoint for event log
    logEvent('checkpoint', `${isUpperPlayer ? 'UPPER' : 'LOWER'} sowing end`, {
      seeds: finalSeeds,
      topHouse: finalTopHouse,
      lowHouse: finalLowHouse,
      seedsInHand: upperInHand + lowerInHand,
    });
  };

  return (
    <div className='app-wrapper'>
      {/* Start button overlay */}
      {showStartButton && (
        <div className="start-overlay">
          <button className="start-button" onClick={handleStartClick}>
            {t('game.start', language) || 'START'}
          </button>
        </div>
      )}

      {/* Countdown overlay */}
      {showCountdown && <Countdown key={countdownKey} onComplete={handleCountdownComplete} />}

      {/* Menu Button */}
      {onMenuOpen && (
        <button className='menu-button' onClick={onMenuOpen}>
          <i className="fa fa-bars"></i>
        </button>
      )}

      {/* Reset Button - visible during gameplay */}
      {!showStartButton && !showCountdown && (
        <button className='reset-button' onClick={handleQuickReset}>
          <i className="fa fa-refresh"></i>
        </button>
      )}

      {/* Language Selector */}
      <LanguageSelector />

      {/* Modal Toggle Button */}
      <button className='modal' onClick={toggleModal}>
        INFO <i className="fa fa-info-circle"></i>
      </button>
      <InfoModal isOpen={isModalOpen} toggleModal={toggleModal} />
      <div className='game-info'>
        <div className="current-turn">
          <strong>{
            (gamePhase === COUNTDOWN || gamePhase === FREEPLAY) ? `${t('game.freeplay', language)}: ` :
            `${t('game.turnBased', language)}: `
          }</strong>
          <span>{
            (gamePhase === COUNTDOWN || gamePhase === FREEPLAY) ? t('game.bothTurn', language) :
            currentTurn === PLAYER_UPPER ? t('game.upperTurn', language) : t('game.lowerTurn', language)
          }</span>
        </div>
      </div>
      <div className='game-area'>
        <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
          <div className='game-content'>
            <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
            <div className="rows-container">
              {/* Update the Row for upper player */}
              <Row
                seeds={seeds.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)}
                rowType="upper"
                isUpper={true}
                onClick={(index) => {handleSButtonPress(index)}}
                refs={holeRefs.current}
                selectedHole={null}
                burnedHoles={burnedHolesUpper}
              />
              <Row
                seeds={seeds.slice(MIN_INDEX_LOWER).reverse()}
                rowType="lower"
                onClick={(index) => {handleArrowDownPress(index)}}
                refs={holeRefs.current}
                selectedHole={null}
                burnedHoles={burnedHolesLower}
              />
            </div>
            <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
            <Cursor
              shake={shakeCursorUpper}
              top={cursorTopUpper}
              left={cursorLeftUpper}
              visible={cursorVisibilityUpper.visible}
              canMove={cursorVisibilityUpper.canMove}
              disableTransition={disableCursorTransition}
              seedCount={currentSeedsInHandUpper}
              isTopTurn={true}
              color={"#510400"}
            />
            <Cursor
              shake={shakeCursorLower}
              top={cursorTopLower}
              left={cursorLeftLower}
              visible={cursorVisibilityLower.visible}
              canMove={cursorVisibilityLower.canMove}
              disableTransition={disableCursorTransition}
              seedCount={currentSeedsInHandLower}
              isTopTurn={false}
              color={"yellow"}
            />
          </div>
        </div>
        {/* {showSelectionMessage && (
          <div className="selection-message">
            Please select a valid position.
          </div>)} */}
        <div className='button-group'>
          {isGameOver && (<button className="button refresh" onClick={() => window.location.reload(true)}>
            RESTART
          </button>)}
          {isGameOver && (
            <div className="game-over-message">
              {outcomeMessage}
            </div>
          )}
        </div>
        {/* <Sidebar 
            isOpen={isSidebarOpen} 
            onToggle={() => toggleSidebar(isSidebarOpen, setSidebarOpen)} 
          /> */}
      </div>
      <div class="trademark-section">
        © 2023 <a href="https://twitter.com/ayuinmetaverse" target="_blank">AYU</a>. All Rights Reserved.
      </div>
      <Analytics/>
      <DebugPanel
        onApplyScenario={handleApplyScenario}
        currentSeeds={seeds}
        topHouseSeeds={topHouseSeeds}
        lowHouseSeeds={lowHouseSeeds}
        onUpdateHole={handleUpdateHole}
        onUpdateTopHouse={handleUpdateTopHouse}
        onUpdateLowHouse={handleUpdateLowHouse}
        eventLog={eventLog}
        onClearLog={clearLog}
      />
    </div>
  );
};

export default CongkakBoard;