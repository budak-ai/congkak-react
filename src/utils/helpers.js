import config from "../config/config";

// Constants
const { MIN_INDEX_UPPER, MAX_INDEX_UPPER, MIN_INDEX_LOWER, MAX_INDEX_LOWER,  PLAYER_UPPER, PLAYER_LOWER, INIT_SEEDS_COUNT } = config;

export function toggleTurn (setCurrentTurn, currentTurn) {
    setCurrentTurn(currentTurn === PLAYER_UPPER ? PLAYER_LOWER : PLAYER_UPPER);
  };

export function sumOfSeedsInCurrentRow(seeds, currentTurn) {
  let sum = 0;
  const startIndex = currentTurn === PLAYER_UPPER ? MIN_INDEX_UPPER : MIN_INDEX_LOWER;
  const endIndex = currentTurn === PLAYER_UPPER ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;

  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}

/**
 * Check if player has any available moves (non-burned holes with seeds)
 * @param {number[]} seeds - Current seeds array (14 elements)
 * @param {string} currentTurn - PLAYER_UPPER or PLAYER_LOWER
 * @param {boolean[]} burnedHoles - Burned holes for the current player (7 elements)
 * @returns {boolean} True if player has at least one available move
 */
export function hasAvailableMoves(seeds, currentTurn, burnedHoles) {
  const startIndex = currentTurn === PLAYER_UPPER ? MIN_INDEX_UPPER : MIN_INDEX_LOWER;
  const endIndex = currentTurn === PLAYER_UPPER ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;

  for (let i = startIndex; i <= endIndex; i++) {
    const localIndex = currentTurn === PLAYER_UPPER ? i : i - MIN_INDEX_LOWER;
    // Check if hole has seeds AND is not burned
    if (seeds[i] > 0 && !burnedHoles[localIndex]) {
      return true;
    }
  }

  return false;
}

function sumOfSeedsInRow(seeds, startIndex, endIndex) {
  let sum = 0;

  // Ensure startIndex and endIndex are within bounds
  startIndex = Math.max(startIndex, 0);
  endIndex = Math.min(endIndex, seeds.length - 1);

  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}

function endGameEarly(topHouseSeeds, lowHouseSeeds) {
  const halfTotalSeeds = INIT_SEEDS_COUNT*INIT_SEEDS_COUNT;
  return (topHouseSeeds > halfTotalSeeds || lowHouseSeeds > halfTotalSeeds);
}

function areBothRowsEmpty(seeds) {
  const sumUpperRow = sumOfSeedsInRow(seeds, MIN_INDEX_UPPER, MAX_INDEX_UPPER);
  const sumLowerRow = sumOfSeedsInRow(seeds, MIN_INDEX_LOWER, MAX_INDEX_LOWER);
  return sumUpperRow === 0 && sumLowerRow === 0;
}

// Check if round is complete (both rows empty) - for traditional mode
export const isRoundComplete = (seeds) => {
  return areBothRowsEmpty(seeds);
};

// Check for total domination (all 7 holes burned)
export const checkTotalDomination = (burnedHolesUpper, burnedHolesLower) => {
  const upperDominated = burnedHolesUpper.every(b => b);
  const lowerDominated = burnedHolesLower.every(b => b);

  if (upperDominated) return PLAYER_LOWER; // Lower wins
  if (lowerDominated) return PLAYER_UPPER; // Upper wins
  return null; // No domination
};

function determineOutcome(topHouseSeeds, lowHouseSeeds) {
  if (topHouseSeeds > lowHouseSeeds) {
    return 'DARK WINS';
  } else if (lowHouseSeeds > topHouseSeeds) {
    return 'WHITE WINS';
  } else {
    return 'DRAW';
  }
}

export const handleCheckGameEnd = (seeds, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage) => {
  if (endGameEarly(topHouseSeeds, lowHouseSeeds) || areBothRowsEmpty(seeds)) {
    setIsGameOver(true);
    const outcome = determineOutcome(topHouseSeeds, lowHouseSeeds);
    setOutcomeMessage(outcome); // Set the outcome message
    console.log(outcome); // Logging the outcome
  }
};

