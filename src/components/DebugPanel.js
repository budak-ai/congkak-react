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

const INITIAL_SEEDS = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];

const DebugPanel = ({
  onApplyScenario,
  currentSeeds,
  topHouseSeeds,
  lowHouseSeeds,
  onUpdateHole,
  onUpdateTopHouse,
  onUpdateLowHouse,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const totalSeeds = currentSeeds.reduce((a, b) => a + b, 0) + topHouseSeeds + lowHouseSeeds;

  const handleHoleChange = (index, delta) => {
    const newValue = Math.max(0, currentSeeds[index] + delta);
    onUpdateHole(index, newValue);
  };

  const handleHouseChange = (isTop, delta) => {
    if (isTop) {
      const newValue = Math.max(0, topHouseSeeds + delta);
      onUpdateTopHouse(newValue);
    } else {
      const newValue = Math.max(0, lowHouseSeeds + delta);
      onUpdateLowHouse(newValue);
    }
  };

  const handleReset = () => {
    onApplyScenario({
      seeds: [...INITIAL_SEEDS],
      topHouseSeeds: 0,
      lowHouseSeeds: 0,
    });
  };

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
          <div className="debug-panel__header">
            <div className="debug-panel__status">
              <strong>Total Seeds:</strong> {totalSeeds}
              {totalSeeds !== 98 && <span className="debug-panel__warning"> ⚠️ Expected 98!</span>}
            </div>
            <div className="debug-panel__controls">
              <button
                className={`debug-panel__edit-btn ${editMode ? 'debug-panel__edit-btn--active' : ''}`}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Done Editing' : 'Edit Board'}
              </button>
              <button className="debug-panel__reset-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          {editMode ? (
            <div className="debug-panel__editor">
              {/* Houses */}
              <div className="debug-panel__houses-editor">
                <div className="debug-panel__house-editor">
                  <span>Upper House:</span>
                  <button onClick={() => handleHouseChange(true, -1)}>-</button>
                  <span className="debug-panel__value">{topHouseSeeds}</span>
                  <button onClick={() => handleHouseChange(true, 1)}>+</button>
                  <input
                    type="number"
                    value={topHouseSeeds}
                    onChange={(e) => onUpdateTopHouse(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                  />
                </div>
                <div className="debug-panel__house-editor">
                  <span>Lower House:</span>
                  <button onClick={() => handleHouseChange(false, -1)}>-</button>
                  <span className="debug-panel__value">{lowHouseSeeds}</span>
                  <button onClick={() => handleHouseChange(false, 1)}>+</button>
                  <input
                    type="number"
                    value={lowHouseSeeds}
                    onChange={(e) => onUpdateLowHouse(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                  />
                </div>
              </div>

              {/* Board visualization */}
              <div className="debug-panel__board">
                <div className="debug-panel__row">
                  <span className="debug-panel__row-label">Upper (0-6):</span>
                  {currentSeeds.slice(0, 7).map((seeds, i) => (
                    <div key={i} className="debug-panel__hole-editor">
                      <span className="debug-panel__hole-index">{i}</span>
                      <button onClick={() => handleHoleChange(i, -1)}>-</button>
                      <input
                        type="number"
                        value={seeds}
                        onChange={(e) => onUpdateHole(i, Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                      />
                      <button onClick={() => handleHoleChange(i, 1)}>+</button>
                    </div>
                  ))}
                </div>
                <div className="debug-panel__row">
                  <span className="debug-panel__row-label">Lower (7-13):</span>
                  {currentSeeds.slice(7, 14).map((seeds, i) => (
                    <div key={i + 7} className="debug-panel__hole-editor">
                      <span className="debug-panel__hole-index">{i + 7}</span>
                      <button onClick={() => handleHoleChange(i + 7, -1)}>-</button>
                      <input
                        type="number"
                        value={seeds}
                        onChange={(e) => onUpdateHole(i + 7, Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                      />
                      <button onClick={() => handleHoleChange(i + 7, 1)}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="debug-panel__seeds">
                <strong>Holes:</strong> [{currentSeeds.join(', ')}]
              </div>

              <div className="debug-panel__houses">
                <span>Upper House: {topHouseSeeds}</span>
                <span>Lower House: {lowHouseSeeds}</span>
              </div>
            </>
          )}

          <div className="debug-panel__scenarios">
            <strong>Scenarios:</strong>
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
