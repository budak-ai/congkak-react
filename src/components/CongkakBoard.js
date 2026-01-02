import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import InfoModal from './InfoModal';
import DebugPanel from './DebugPanel';
import Countdown from './Countdown';
import { handleWrongSelection } from '../utils/animation';
import { toggleTurn, sumOfSeedsInCurrentRow, handleCheckGameEnd } from '../utils/helpers';
import { validateSeedCount } from '../utils/seedValidator';
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
  STARTING_PHASE,
  SIMULTANEOUS_SELECT,
  SIMULTANEOUS_SELECT_UPPER,
  SIMULTANEOUS_SELECT_LOWER,
  PASS_TO_TURN_BASED,
  TURN_BASED_SELECT,
  TURN_BASED_SOWING
} = gamePhaseConfig;

const CongkakBoard = () => {

  const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses
  
  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);
  
  const [gamePhase, setGamePhase] = useState(COUNTDOWN); // Start with countdown

  // Freeplay mode states
  const [showCountdown, setShowCountdown] = useState(true);

  // States for starting phase (kept for compatibility with debug scenarios)
  const [startingPositionUpper, setStartingPositionUpper] = useState(null);
  const [startingPositionLower, setStartingPositionLower] = useState(null);

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
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');

  const gameContainerRef = useRef(null);
  
  const verticalPosUpper = config.VERTICAL_POS_UPPER;
  const verticalPosLower = config.VERTICAL_POS_LOWER;

  const animationDelay = config.ANIMATION_DELAY;

  const [shakeCursor, setShakeCursor] = useState(false);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  // Countdown completion handler for freeplay mode
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setGamePhase(FREEPLAY);
  };

  // Debug panel handler for applying test scenarios
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

  // Debug panel handlers for individual board modifications
  const handleUpdateHole = (index, value) => {
    const newSeeds = [...seeds];
    newSeeds[index] = value;
    setSeeds(newSeeds);
  };

  const handleUpdateTopHouse = (value) => {
    setTopHouseSeeds(value);
  };

  const handleUpdateLowHouse = (value) => {
    setLowHouseSeeds(value);
  };

  // Define the handlers for the mobile buttons
  const handleSButtonPress = async (index) => {
    if (!isSowingUpper) {
      // Freeplay mode - both players sow independently using turn-based logic
      if (gamePhase === FREEPLAY) {
        if (seeds[index] === 0) {
          handleWrongSelection(setShakeCursor, setShowSelectionMessage);
          return;
        }
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        sowing(index, PLAYER_UPPER);
      // Turn-based mode
      } else if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_UPPER) {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setGamePhase(TURN_BASED_SOWING);
        sowing(index, PLAYER_UPPER);
      } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER) {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setStartingPositionUpper(index);
      }
    }
  };

  const handleArrowDownPress = async (index) => {
    if (!isSowingLower) {
      // Freeplay mode - both players sow independently using turn-based logic
      if (gamePhase === FREEPLAY) {
        if (seeds[index] === 0) {
          handleWrongSelection(setShakeCursor, setShowSelectionMessage);
          return;
        }
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        sowing(index, PLAYER_LOWER);
      // Turn-based mode
      } else if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_LOWER) {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setGamePhase(TURN_BASED_SOWING);
        sowing(index, PLAYER_LOWER);
      } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setStartingPositionLower(index);
      }
    }
  };

  // Function to update cursor position for PlayerUpper
  const updateCursorPositionUpper = async (ref, indexOrElement, verticalPosUpper) => {
    let element;
    
    // determine if indexOrElement is an index or a DOM element
    if (typeof indexOrElement === "number") {
      element = ref.current[indexOrElement];
    } else {
      element = indexOrElement;
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setCursorLeftUpper(rect.left + window.scrollX);
      setCursorTopUpper(rect.top + window.scrollY + (verticalPosUpper * rect.height));
      await new Promise(resolve => setTimeout(resolve, animationDelay)); // Animation delay
    }
  };

  // Function to update cursor position for PlayerLower
  const updateCursorPositionLower = async (ref, indexOrElement, verticalPosLower) => {
    let element;
    // determine if indexOrElement is an index or a DOM element
    if (typeof indexOrElement === "number") {
      element = ref.current[indexOrElement];
    } else {
      element = indexOrElement;
    }
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setCursorLeftLower(rect.left + window.scrollX);
      setCursorTopLower(rect.top + window.scrollY + (verticalPosLower * rect.height));
      await new Promise(resolve => setTimeout(resolve, animationDelay)); // Animation delay
    }
  };

  /**=========================================================
  *   Transition from SIMULTANEOUS phase to TURN_BASED phase 
  * ==========================================================*/
  useEffect(() => {
    if (gamePhase === PASS_TO_TURN_BASED) {
      const nextTurn = isSowingUpper ? PLAYER_UPPER : PLAYER_LOWER;
      setCurrentTurn(nextTurn);
    }
  }, [gamePhase, isSowingUpper, isSowingLower]);

  // Effect to call sowing when currentTurn updates
  useEffect(() => {
    if (gamePhase === PASS_TO_TURN_BASED && currentTurn !== null) {
      const currentPosition = currentTurn === PLAYER_UPPER ? currentHoleIndexUpper : currentHoleIndexLower;
      console.log(`Current Turn: ${currentTurn} | Current position: ${currentPosition} | Seeds: ${seeds[currentPosition]}` );
      setGamePhase(TURN_BASED_SOWING);
      sowing(currentPosition, currentTurn, true, passedHouse);
    }
  }, [currentTurn, gamePhase, currentHoleIndexUpper, currentHoleIndexLower]);

  
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
    // for upper player
    if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
      setCursorVisibilityUpper({ visible: true });
    } else {
      if (currentTurn === PLAYER_UPPER) setCursorVisibilityUpper({ visible:true });
      else setCursorVisibilityUpper({ visible: false });
    }

    // for lower player
    if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
      setCursorVisibilityLower({ visible: true });
    } else {
      if (currentTurn === PLAYER_LOWER) setCursorVisibilityLower({ visible:true });
      else setCursorVisibilityLower({ visible: false });
    }
  },[gamePhase, currentTurn]);


  /**=========================================================
  *                    Keydown listener 
  * ==========================================================*/
  useEffect(() => {

    const handleKeyDown = (event) => {

      let newIndexUpper = currentHoleIndexUpper;
      let newIndexLower = currentHoleIndexLower;

      // Handle PlayerUpper's left and right movement
      if (!isSowingUpper) {
        if (event.key === 'a' || event.key === 'A') {
          newIndexUpper = Math.max(0, currentHoleIndexUpper - 1); // decrease
        } else if (event.key === 'd' || event.key === 'D') {
          newIndexUpper = Math.min(MAX_INDEX_UPPER, currentHoleIndexUpper + 1); // increase
        }
        setCurrentHoleIndexUpper(newIndexUpper);
        updateCursorPositionUpper(holeRefs, newIndexUpper, verticalPosUpper);
        
        // Start sowing
        if (event.key === 's' || event.key === 'S') {
          if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_UPPER) {
            // Start sowing for PlayerUpper
            setGamePhase(TURN_BASED_SOWING);
            sowing(newIndexUpper, PLAYER_UPPER);
          } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER) {
            setStartingPositionUpper(newIndexUpper);
          }
        }
      }
      
      if (!isSowingLower) {
        // Handle PlayerLower's left and right movement (reversed)
        if (event.key === 'ArrowLeft') {
          newIndexLower = Math.min(MAX_INDEX_LOWER, currentHoleIndexLower + 1); // Increment index
        } else if (event.key === 'ArrowRight') {
          newIndexLower = Math.max(MIN_INDEX_LOWER, currentHoleIndexLower - 1); // Decrement index
        }
        setCurrentHoleIndexLower(newIndexLower);
        updateCursorPositionLower(holeRefs, newIndexLower, verticalPosLower);
        
        if (event.key === 'ArrowDown') {
          if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_LOWER) {
            // Start sowing for PlayerLower
            setGamePhase(TURN_BASED_SOWING);
            sowing(newIndexLower, PLAYER_LOWER);
          } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
            setStartingPositionLower(newIndexLower);
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
    // Determine player-specific states and actions
    const isUpperPlayer = player === PLAYER_UPPER;
    const currentHouseRef = isUpperPlayer ? topHouseRef : lowHouseRef;
    const setIsSowing = isUpperPlayer ? setIsSowingUpper : setIsSowingLower;
    const setHouseSeeds = isUpperPlayer ? setTopHouseSeeds : setLowHouseSeeds;
    const setCurrentSeedsInHand = isUpperPlayer ? setCurrentSeedsInHandUpper : setCurrentSeedsInHandLower;
    const setCurrentHoleIndex = isUpperPlayer ? setCurrentHoleIndexUpper : setCurrentHoleIndexLower;
    const verticalAdjustment = isUpperPlayer ? -0.5 : 0.5;
    const maxIndex = isUpperPlayer ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;
    const minIndex = isUpperPlayer ? MIN_INDEX_LOWER : 0;
    
    // Start sowing
    setIsSowing(true);
    
    let currentIndex = index;
    let newSeeds = [...seeds];
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
        setGamePhase(TURN_BASED_SELECT);
        getAnotherTurn = true;
        setIsSowing(false);
        return;
      }
    }
    setCurrentSeedsInHand(seedsInHand);
    newSeeds[index] = 0;
    setSeeds([...newSeeds]);
    
    // Pick up animation
    if (isUpperPlayer) {
      await updateCursorPositionUpper(holeRefs, currentIndex, 0);
    } else {
      await updateCursorPositionLower(holeRefs, currentIndex, 0);
    }
    console.log("Starting turn based sowing")
    console.log("Seeds in hands: ", seedsInHand);
    while (seedsInHand > 0) {
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
        setHouseSeeds(prevSeeds => prevSeeds + 1);
        seedsInHand--;
        setCurrentSeedsInHand(seedsInHand);
        if (seedsInHand > 0) {
          justFilledHome = true;
          currentIndex = minIndex;
        } else {
          getAnotherTurn = true;
          setIsSowing(false);

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
      } else {
        currentIndex = (currentIndex + 1) % HOLE_NUMBERS;
      }

      if (isUpperPlayer) {
        await updateCursorPositionUpper(holeRefs, currentIndex, verticalAdjustment);
      } else {
        await updateCursorPositionLower(holeRefs, currentIndex, verticalAdjustment);
      }

      // Update holes
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]);

      // Update seeds in hand
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
    
      /** ============================================
       *  If landed on non-empty house, continue sowing
       * ===========================================*/
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        await new Promise(resolve => setTimeout(resolve, CONTINUE_SOWING_DELAY)); // Animation delay
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        
        // Empty the current hole
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);

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
        
        // Check if the opposite hole has seeds
        if (newSeeds[oppositeIndex] === 0) continue;
         
        // Pick up current hole animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }
        seedsInHand = newSeeds[currentIndex];
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);
      
        // Capturing ... (picking up from opposite hole)
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, oppositeIndex, verticalAdjustment);
        } else {
          await updateCursorPositionLower(holeRefs, oppositeIndex, verticalAdjustment);
        }
        const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
        seedsInHand = capturedSeeds;
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[oppositeIndex] = 0;
        setSeeds([...newSeeds]);

        await new Promise(resolve => setTimeout(resolve, CAPTURE_ANIMATION_DELAY)); // Animation delay
        // Send captured seeds to House
        // Animate cursor to the appropriate house and add captured seeds
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        setHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);

        // reset cursor position
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
        } else {
          await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
        }
      
        // Update the state with the new distribution of seeds
        seedsInHand = 0;
        setCurrentSeedsInHand(seedsInHand);
      }
    }
    // End of sowing
    if (!getAnotherTurn) {
      toggleTurn(setCurrentTurn, currentTurn);
    }
    setIsSowing(false);
    setGamePhase(TURN_BASED_SELECT);

    // Validate seed count at end of turn-based sowing
    validateSeedCount(newSeeds, topHouseSeeds, lowHouseSeeds, 'sowing end');
  };

  return (
    <div className='app-wrapper'>
      {/* Countdown overlay */}
      {showCountdown && <Countdown onComplete={handleCountdownComplete} />}

      {/* Modal Toggle Button */}
      <button className='modal' onClick={toggleModal}>
        INFO <i class="fa fa-info-circle"></i>
      </button>
      <InfoModal isOpen={isModalOpen} toggleModal={toggleModal} />
      <div className='game-info'>
        {/* Modal Overlay */}
        <div className="current-turn">
          <strong>{gamePhase === SIMULTANEOUS_SELECT_LOWER ? "SIMULTANEOUS ROUND: " : 
                 gamePhase === SIMULTANEOUS_SELECT_UPPER ? "SIMULTANEOUS ROUND: " : 
                 (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT) ? "SIMULTANEOUS ROUND: " : 
                 "TURN-BASED ROUND: "
          }</strong>
          <span>{
                 gamePhase === SIMULTANEOUS_SELECT_LOWER ? "LIGHT TURN" : 
                 gamePhase === SIMULTANEOUS_SELECT_UPPER ? "DARK TURN" : 
                 (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT) ? "BOTH TURN" : 
                 `${currentTurn === PLAYER_UPPER ? "DARK" : "LIGHT" }'S TURN`
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
                selectedHole={startingPositionUpper}
              />
              <Row 
                seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} 
                rowType="lower"
                onClick={(index) => {handleArrowDownPress(index)}} 
                refs={holeRefs.current} 
                selectedHole={startingPositionLower} 
              />
            </div>
            <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
            <Cursor 
              shake={shakeCursor}
              triggerShake={handleWrongSelection}
              top={cursorTopUpper} 
              left={cursorLeftUpper} 
              visible={cursorVisibilityUpper.visible} 
              seedCount={currentSeedsInHandUpper} // Adjust based on Player 1's state
              isTopTurn={true} // Always true for Player 1
              color={"#510400"}
            />
            <Cursor 
              shake={shakeCursor}
              triggerShake={handleWrongSelection}
              top={cursorTopLower} 
              left={cursorLeftLower} 
              visible={cursorVisibilityLower.visible} 
              seedCount={currentSeedsInHandLower} // Adjust based on Player 2's state
              isTopTurn={false} // Always false for Player 2
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
      />
    </div>
  );
};

export default CongkakBoard;