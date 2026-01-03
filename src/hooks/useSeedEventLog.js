import { useRef, useState, useCallback } from 'react';

const EXPECTED_TOTAL = 98;
const MAX_LOG_SIZE = 50;

/**
 * Hook for tracking seed state changes with validation and event logging.
 * Works with existing ref-based state management.
 */
export const useSeedEventLog = () => {
  const eventLogRef = useRef([]);
  const [logVersion, setLogVersion] = useState(0);

  // Track previous state for diff calculation
  const prevStateRef = useRef({
    seeds: new Array(14).fill(7),
    topHouse: 0,
    lowHouse: 0,
  });

  /**
   * Log a seed state change event
   */
  const logEvent = useCallback((action, context, currentState) => {
    const { seeds, topHouse, lowHouse, seedsInHand = 0 } = currentState;
    const prev = prevStateRef.current;

    const beforeTotal = prev.seeds.reduce((a, b) => a + b, 0) + prev.topHouse + prev.lowHouse;
    const afterTotal = seeds.reduce((a, b) => a + b, 0) + topHouse + lowHouse + seedsInHand;
    const isValid = afterTotal === EXPECTED_TOTAL;

    // Calculate diffs
    const seedsDiff = seeds.map((val, i) => val - prev.seeds[i]);
    const hasChanges = seedsDiff.some(d => d !== 0) ||
                       prev.topHouse !== topHouse ||
                       prev.lowHouse !== lowHouse;

    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString().split('T')[1].split('.')[0],
      action,
      context,
      before: {
        seeds: [...prev.seeds],
        topHouse: prev.topHouse,
        lowHouse: prev.lowHouse,
        total: beforeTotal,
      },
      after: {
        seeds: [...seeds],
        topHouse,
        lowHouse,
        total: afterTotal,
      },
      seedsInHand,
      seedsDiff,
      houseDiff: {
        top: topHouse - prev.topHouse,
        low: lowHouse - prev.lowHouse,
      },
      isValid,
      hasChanges,
    };

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = isValid ? '✓' : '⚠️';
      const diffStr = seedsDiff
        .map((d, i) => d !== 0 ? `[${i}]:${d > 0 ? '+' : ''}${d}` : '')
        .filter(Boolean)
        .join(' ');

      if (!isValid) {
        console.error(`[SEED ${emoji}] ${action} @ ${context} | Total: ${afterTotal} (expected ${EXPECTED_TOTAL}, inHand: ${seedsInHand})`);
      } else if (hasChanges && action !== 'snapshot') {
        console.log(`[SEED ${emoji}] ${action} @ ${context} | ${diffStr || 'no change'} | T:${event.houseDiff.top >= 0 ? '+' : ''}${event.houseDiff.top} L:${event.houseDiff.low >= 0 ? '+' : ''}${event.houseDiff.low}`);
      }
    }

    // Update previous state
    prevStateRef.current = { seeds: [...seeds], topHouse, lowHouse };

    // Add to log
    eventLogRef.current = [...eventLogRef.current.slice(-(MAX_LOG_SIZE - 1)), event];
    setLogVersion(v => v + 1);

    return isValid;
  }, []);

  /**
   * Take a snapshot without logging (for initialization)
   */
  const snapshot = useCallback((seeds, topHouse, lowHouse) => {
    prevStateRef.current = { seeds: [...seeds], topHouse, lowHouse };
  }, []);

  /**
   * Clear the event log
   */
  const clearLog = useCallback(() => {
    eventLogRef.current = [];
    setLogVersion(v => v + 1);
  }, []);

  /**
   * Validate current state
   */
  const validate = useCallback((seeds, topHouse, lowHouse, seedsInHand = 0, context = 'manual') => {
    const total = seeds.reduce((a, b) => a + b, 0) + topHouse + lowHouse + seedsInHand;
    const isValid = total === EXPECTED_TOTAL;

    if (!isValid && process.env.NODE_ENV === 'development') {
      console.error(`[SEED VALIDATION] ${context}: expected ${EXPECTED_TOTAL}, got ${total} (inHand: ${seedsInHand})`);
    }

    return { isValid, total, expected: EXPECTED_TOTAL };
  }, []);

  return {
    eventLog: eventLogRef.current,
    logVersion,
    logEvent,
    snapshot,
    clearLog,
    validate,
  };
};

export default useSeedEventLog;
