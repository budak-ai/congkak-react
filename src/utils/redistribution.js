/**
 * Redistribution logic for traditional Congkak (Lubang Hangus) mode
 *
 * At the end of each round, players redistribute seeds from their house
 * back to their holes. Holes that cannot be filled with 7 seeds are "burned".
 */

/**
 * Calculate seed redistribution for a player
 * @param {number} houseSeeds - Seeds in player's house
 * @param {boolean[]} currentBurned - Current burned holes (7 elements) - not used in redistribution
 * @param {boolean} isUpper - Whether this is upper player
 * @returns {{ newSeeds: number[], newBurned: boolean[], leftoverSeeds: number }}
 */
export const calculateRedistribution = (houseSeeds, currentBurned, isUpper) => {
  // Fill order: nearest to house first
  // Upper: 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0
  // Lower: 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0 (indices within their 7-hole array)
  const fillOrder = [6, 5, 4, 3, 2, 1, 0];
  const MAX_SEEDS_FOR_HOLES = 49; // 7 holes × 7 seeds each

  const newSeeds = [0, 0, 0, 0, 0, 0, 0];
  const newBurned = [false, false, false, false, false, false, false];

  // Only use up to 49 seeds for redistribution, keep extras in house
  const seedsToDistribute = Math.min(houseSeeds, MAX_SEEDS_FOR_HOLES);
  const leftoverSeeds = Math.max(0, houseSeeds - MAX_SEEDS_FOR_HOLES);
  let remaining = seedsToDistribute;

  for (const localIndex of fillOrder) {
    if (remaining >= 7) {
      newSeeds[localIndex] = 7;
      remaining -= 7;
      // Hole is open (reopened if was burned)
    } else if (remaining > 0) {
      newSeeds[localIndex] = remaining;
      remaining = 0;
      // Hole is open with partial seeds
    } else {
      // No seeds left - hole is burned
      newSeeds[localIndex] = 0;
      newBurned[localIndex] = true;
    }
  }

  return { newSeeds, newBurned, leftoverSeeds };
};

/**
 * Apply redistribution results to full 14-hole seeds array
 * @param {number[]} upperSeeds - Upper player's 7 holes
 * @param {number[]} lowerSeeds - Lower player's 7 holes
 * @returns {number[]} Full 14-hole seeds array
 */
export const combineSeeds = (upperSeeds, lowerSeeds) => {
  return [...upperSeeds, ...lowerSeeds];
};
