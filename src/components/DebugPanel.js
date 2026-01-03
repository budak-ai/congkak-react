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

/**
 * Format a diff value with color coding
 */
const DiffValue = ({ value }) => {
  if (value === 0) return <span className="diff-zero">·</span>;
  if (value > 0) return <span className="diff-positive">+{value}</span>;
  return <span className="diff-negative">{value}</span>;
};

/**
 * Render a single event log entry
 */
const EventLogEntry = ({ event, isExpanded, onToggle }) => {
  const statusIcon = event.isValid ? '✓' : '⚠️';
  const statusClass = event.isValid ? 'event-valid' : 'event-invalid';

  // Summarize the diff
  const changedHoles = event.seedsDiff
    .map((d, i) => d !== 0 ? `[${i}]${d > 0 ? '+' : ''}${d}` : null)
    .filter(Boolean);

  const houseDiffs = [];
  if (event.houseDiff.top !== 0) houseDiffs.push(`T${event.houseDiff.top > 0 ? '+' : ''}${event.houseDiff.top}`);
  if (event.houseDiff.low !== 0) houseDiffs.push(`L${event.houseDiff.low > 0 ? '+' : ''}${event.houseDiff.low}`);

  return (
    <div className={`event-entry ${statusClass}`} onClick={onToggle}>
      <div className="event-header">
        <span className="event-time">{event.timestamp}</span>
        <span className="event-status">{statusIcon}</span>
        <span className="event-action">{event.action}</span>
        <span className="event-context">{event.context}</span>
        <span className="event-total">= {event.after.total}</span>
      </div>

      {isExpanded && (
        <div className="event-details">
          <div className="event-diff-summary">
            {changedHoles.length > 0 && (
              <span className="event-holes-diff">Holes: {changedHoles.join(' ')}</span>
            )}
            {houseDiffs.length > 0 && (
              <span className="event-houses-diff">Houses: {houseDiffs.join(' ')}</span>
            )}
          </div>

          <div className="event-diff-visual">
            <div className="diff-row">
              <span className="diff-label">Before:</span>
              <span className="diff-seeds">[{event.before.seeds.join(',')}]</span>
              <span className="diff-houses">T:{event.before.topHouse} L:{event.before.lowHouse}</span>
            </div>
            <div className="diff-row">
              <span className="diff-label">After:</span>
              <span className="diff-seeds">[{event.after.seeds.join(',')}]</span>
              <span className="diff-houses">T:{event.after.topHouse} L:{event.after.lowHouse}</span>
            </div>
            <div className="diff-row diff-row--diff">
              <span className="diff-label">Diff:</span>
              <span className="diff-seeds">
                [{event.seedsDiff.map((d, i) => <DiffValue key={i} value={d} />).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ',', curr], [])}]
              </span>
              <span className="diff-houses">
                T:<DiffValue value={event.houseDiff.top} /> L:<DiffValue value={event.houseDiff.low} />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DebugPanel = ({
  onApplyScenario,
  currentSeeds,
  topHouseSeeds,
  lowHouseSeeds,
  onUpdateHole,
  onUpdateTopHouse,
  onUpdateLowHouse,
  eventLog = [],
  onClearLog,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('state'); // 'state' | 'log' | 'edit'
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const totalSeeds = currentSeeds.reduce((a, b) => a + b, 0) + topHouseSeeds + lowHouseSeeds;
  const isValid = totalSeeds === 98;

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

  const toggleEventExpand = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  // Get recent invalid events count
  const invalidCount = eventLog.filter(e => !e.isValid).length;

  return (
    <div className={`debug-panel ${isExpanded ? 'debug-panel--expanded' : ''}`}>
      <button
        className="debug-panel__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Debug {isExpanded ? '▼' : '▲'}</span>
        <span className={`debug-panel__total ${!isValid ? 'debug-panel__warning' : ''}`}>
          Seeds: {totalSeeds} {!isValid && '⚠️'}
        </span>
        {invalidCount > 0 && (
          <span className="debug-panel__error-count">{invalidCount} errors</span>
        )}
      </button>

      {isExpanded && (
        <div className="debug-panel__content">
          {/* Tabs */}
          <div className="debug-panel__tabs">
            <button
              className={`debug-panel__tab ${activeTab === 'state' ? 'debug-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('state')}
            >
              State
            </button>
            <button
              className={`debug-panel__tab ${activeTab === 'log' ? 'debug-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('log')}
            >
              Event Log ({eventLog.length})
            </button>
            <button
              className={`debug-panel__tab ${activeTab === 'edit' ? 'debug-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit Board
            </button>
          </div>

          {/* State Tab */}
          {activeTab === 'state' && (
            <div className="debug-panel__state">
              <div className="debug-panel__status">
                <strong>Total Seeds:</strong> {totalSeeds}
                {!isValid && <span className="debug-panel__warning"> ⚠️ Expected 98!</span>}
              </div>

              <div className="debug-panel__seeds">
                <strong>Upper (0-6):</strong> [{currentSeeds.slice(0, 7).join(', ')}]
              </div>
              <div className="debug-panel__seeds">
                <strong>Lower (7-13):</strong> [{currentSeeds.slice(7, 14).join(', ')}]
              </div>

              <div className="debug-panel__houses">
                <span>Upper House: {topHouseSeeds}</span>
                <span>Lower House: {lowHouseSeeds}</span>
              </div>

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
                <button className="debug-panel__reset-btn" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Event Log Tab */}
          {activeTab === 'log' && (
            <div className="debug-panel__log">
              <div className="debug-panel__log-header">
                <span>Last {eventLog.length} events (click to expand)</span>
                <button className="debug-panel__clear-btn" onClick={onClearLog}>
                  Clear Log
                </button>
              </div>

              <div className="debug-panel__log-list">
                {eventLog.length === 0 ? (
                  <div className="debug-panel__log-empty">No events logged yet</div>
                ) : (
                  [...eventLog].reverse().map((event) => (
                    <EventLogEntry
                      key={event.id}
                      event={event}
                      isExpanded={expandedEventId === event.id}
                      onToggle={() => toggleEventExpand(event.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
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

              <button className="debug-panel__reset-btn" onClick={handleReset} style={{ marginTop: '1rem' }}>
                Reset to Initial State
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
