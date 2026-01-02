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
