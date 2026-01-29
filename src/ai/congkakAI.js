/**
 * Congkak AI using Minimax with Alpha-Beta Pruning
 * 
 * Board Layout:
 * - Holes 0-6: Upper player's row (PLAYER_UPPER)
 * - Holes 7-13: Lower player's row (PLAYER_LOWER)
 * - topHouseSeeds: Upper player's house
 * - lowHouseSeeds: Lower player's house
 * 
 * Sowing direction: Counter-clockwise (increasing index, wrapping)
 * After hole 6, upper player deposits in their house, then continues to hole 7
 * After hole 13, lower player deposits in their house, then continues to hole 0
 */

const PLAYER_UPPER = 'UPPER';
const PLAYER_LOWER = 'LOWER';
const HOLE_COUNT = 14;
const TOTAL_SEEDS = 98; // 7 holes x 7 seeds x 2 players

// Difficulty configurations
export const AI_DIFFICULTY = {
  EASY: 'easy',       // Random moves
  MEDIUM: 'medium',   // Minimax depth 3
  HARD: 'hard',       // Minimax depth 6
};

const DEPTH_CONFIG = {
  [AI_DIFFICULTY.EASY]: 0,    // Random
  [AI_DIFFICULTY.MEDIUM]: 3,  // Depth 3
  [AI_DIFFICULTY.HARD]: 6,    // Depth 6
};

/**
 * Simulate sowing from a given hole for a player
 * Returns the resulting game state after the complete sowing sequence
 */
function simulateSowing(seeds, topHouse, lowHouse, startIndex, player) {
  const newSeeds = [...seeds];
  let newTopHouse = topHouse;
  let newLowHouse = lowHouse;
  
  const isUpper = player === PLAYER_UPPER;
  const myHouseMax = isUpper ? 6 : 13;  // Last hole before house
  const myHouseMin = isUpper ? 7 : 0;   // First hole after house
  
  let currentIndex = startIndex;
  let seedsInHand = newSeeds[startIndex];
  let passedHouse = 0;
  let getAnotherTurn = false;
  
  // Can't pick from empty hole
  if (seedsInHand === 0) {
    return null;
  }
  
  // Pick up seeds
  newSeeds[startIndex] = 0;
  
  while (seedsInHand > 0) {
    // Check if we should deposit in house
    if (currentIndex === myHouseMax) {
      passedHouse++;
      // Deposit one seed in own house
      if (isUpper) {
        newTopHouse++;
      } else {
        newLowHouse++;
      }
      seedsInHand--;
      
      if (seedsInHand === 0) {
        // Landed in house - get another turn
        getAnotherTurn = true;
        break;
      }
      currentIndex = myHouseMin;
    } else {
      currentIndex = (currentIndex + 1) % HOLE_COUNT;
    }
    
    // Drop one seed
    newSeeds[currentIndex]++;
    seedsInHand--;
    
    // Check for continuation (landed in non-empty hole that now has >1)
    if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
      seedsInHand = newSeeds[currentIndex];
      newSeeds[currentIndex] = 0;
    }
    
    // Check for capture (landed in empty hole on own side)
    if (seedsInHand === 0 && newSeeds[currentIndex] === 1 && passedHouse > 0) {
      const isOnOwnSide = isUpper 
        ? (currentIndex >= 0 && currentIndex <= 6)
        : (currentIndex >= 7 && currentIndex <= 13);
        
      if (isOnOwnSide) {
        const oppositeIndex = 13 - currentIndex;
        if (newSeeds[oppositeIndex] > 0) {
          // Capture!
          const captured = newSeeds[currentIndex] + newSeeds[oppositeIndex];
          newSeeds[currentIndex] = 0;
          newSeeds[oppositeIndex] = 0;
          if (isUpper) {
            newTopHouse += captured;
          } else {
            newLowHouse += captured;
          }
        }
      }
    }
  }
  
  return {
    seeds: newSeeds,
    topHouse: newTopHouse,
    lowHouse: newLowHouse,
    getAnotherTurn,
  };
}

/**
 * Get all valid moves for a player
 */
function getValidMoves(seeds, player) {
  const moves = [];
  const startIndex = player === PLAYER_UPPER ? 0 : 7;
  const endIndex = player === PLAYER_UPPER ? 6 : 13;
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (seeds[i] > 0) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Check if game is over
 */
function isGameOver(seeds, topHouse, lowHouse) {
  // One player has majority
  if (topHouse > TOTAL_SEEDS / 2 || lowHouse > TOTAL_SEEDS / 2) {
    return true;
  }
  
  // Both rows empty
  const upperEmpty = seeds.slice(0, 7).every(s => s === 0);
  const lowerEmpty = seeds.slice(7, 14).every(s => s === 0);
  return upperEmpty && lowerEmpty;
}

/**
 * Evaluate the board state from the perspective of the given player
 * Higher scores are better for that player
 */
function evaluate(seeds, topHouse, lowHouse, player) {
  const isUpper = player === PLAYER_UPPER;
  const myHouse = isUpper ? topHouse : lowHouse;
  const oppHouse = isUpper ? lowHouse : topHouse;
  
  // Primary factor: house difference
  let score = (myHouse - oppHouse) * 10;
  
  // Secondary: seeds on my side (potential for scoring)
  const mySeeds = isUpper 
    ? seeds.slice(0, 7).reduce((a, b) => a + b, 0)
    : seeds.slice(7, 14).reduce((a, b) => a + b, 0);
  const oppSeeds = isUpper
    ? seeds.slice(7, 14).reduce((a, b) => a + b, 0)
    : seeds.slice(0, 7).reduce((a, b) => a + b, 0);
  
  score += mySeeds - oppSeeds;
  
  // Bonus for capture opportunities
  const myStart = isUpper ? 0 : 7;
  const myEnd = isUpper ? 6 : 13;
  for (let i = myStart; i <= myEnd; i++) {
    if (seeds[i] === 0) {
      const oppositeIndex = 13 - i;
      // Empty hole with seeds opposite = potential capture
      score += seeds[oppositeIndex] * 0.5;
    }
  }
  
  // Bonus for holes that will land in house
  // (More complex calculation, simplified here)
  
  return score;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(seeds, topHouse, lowHouse, depth, alpha, beta, maximizingPlayer, aiPlayer) {
  // Terminal conditions
  if (depth === 0 || isGameOver(seeds, topHouse, lowHouse)) {
    return { score: evaluate(seeds, topHouse, lowHouse, aiPlayer), move: null };
  }
  
  const currentPlayer = maximizingPlayer ? aiPlayer : (aiPlayer === PLAYER_UPPER ? PLAYER_LOWER : PLAYER_UPPER);
  const moves = getValidMoves(seeds, currentPlayer);
  
  // No valid moves - pass turn
  if (moves.length === 0) {
    const otherPlayer = currentPlayer === PLAYER_UPPER ? PLAYER_LOWER : PLAYER_UPPER;
    const otherMoves = getValidMoves(seeds, otherPlayer);
    if (otherMoves.length === 0) {
      // Both players have no moves - game over
      return { score: evaluate(seeds, topHouse, lowHouse, aiPlayer), move: null };
    }
    // Pass turn to other player
    return minimax(seeds, topHouse, lowHouse, depth - 1, alpha, beta, !maximizingPlayer, aiPlayer);
  }
  
  let bestMove = moves[0];
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const move of moves) {
      const result = simulateSowing(seeds, topHouse, lowHouse, move, currentPlayer);
      if (!result) continue;
      
      let evalScore;
      if (result.getAnotherTurn) {
        // Same player goes again
        const childResult = minimax(
          result.seeds, result.topHouse, result.lowHouse,
          depth - 1, alpha, beta, true, aiPlayer
        );
        evalScore = childResult.score;
      } else {
        const childResult = minimax(
          result.seeds, result.topHouse, result.lowHouse,
          depth - 1, alpha, beta, false, aiPlayer
        );
        evalScore = childResult.score;
      }
      
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    return { score: maxEval, move: bestMove };
    
  } else {
    let minEval = Infinity;
    
    for (const move of moves) {
      const result = simulateSowing(seeds, topHouse, lowHouse, move, currentPlayer);
      if (!result) continue;
      
      let evalScore;
      if (result.getAnotherTurn) {
        // Same player goes again
        const childResult = minimax(
          result.seeds, result.topHouse, result.lowHouse,
          depth - 1, alpha, beta, false, aiPlayer
        );
        evalScore = childResult.score;
      } else {
        const childResult = minimax(
          result.seeds, result.topHouse, result.lowHouse,
          depth - 1, alpha, beta, true, aiPlayer
        );
        evalScore = childResult.score;
      }
      
      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = move;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    return { score: minEval, move: bestMove };
  }
}

/**
 * Get a random valid move (for easy difficulty)
 */
function getRandomMove(seeds, player) {
  const moves = getValidMoves(seeds, player);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Main AI function - returns the best move for the given player
 * @param {number[]} seeds - Current seeds array (14 elements)
 * @param {number} topHouseSeeds - Seeds in upper player's house
 * @param {number} lowHouseSeeds - Seeds in lower player's house
 * @param {string} player - PLAYER_UPPER or PLAYER_LOWER
 * @param {string} difficulty - AI_DIFFICULTY value
 * @returns {number|null} - Index of the hole to pick from, or null if no valid moves
 */
export function getAIMove(seeds, topHouseSeeds, lowHouseSeeds, player, difficulty = AI_DIFFICULTY.MEDIUM) {
  const validMoves = getValidMoves(seeds, player);
  
  if (validMoves.length === 0) {
    return null;
  }
  
  if (validMoves.length === 1) {
    // Only one option
    return validMoves[0];
  }
  
  // Easy: random move
  if (difficulty === AI_DIFFICULTY.EASY) {
    return getRandomMove(seeds, player);
  }
  
  // Medium/Hard: use minimax
  const depth = DEPTH_CONFIG[difficulty] || 3;
  
  const result = minimax(
    seeds,
    topHouseSeeds,
    lowHouseSeeds,
    depth,
    -Infinity,
    Infinity,
    true,
    player
  );
  
  return result.move;
}

/**
 * Async wrapper for getAIMove to prevent UI blocking
 * Adds a small delay to allow UI updates
 */
export async function getAIMoveAsync(seeds, topHouseSeeds, lowHouseSeeds, player, difficulty = AI_DIFFICULTY.MEDIUM) {
  // Add a small delay for UI responsiveness
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return new Promise((resolve) => {
    // Use setTimeout to break up computation
    setTimeout(() => {
      const move = getAIMove(seeds, topHouseSeeds, lowHouseSeeds, player, difficulty);
      resolve(move);
    }, 0);
  });
}

export default {
  getAIMove,
  getAIMoveAsync,
  AI_DIFFICULTY,
  PLAYER_UPPER,
  PLAYER_LOWER,
};
