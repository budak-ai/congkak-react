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
        {isExpanded ? 'Debug ▼' : 'Debug ▲'}
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
