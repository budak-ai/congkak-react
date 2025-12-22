# CLAUDE.md

This file provides context for Claude Code when working with this repository.

## Project Overview

Congkak is a digital implementation of a traditional Southeast Asian mancala-style board game built with React. Two players move seeds around holes on the board, collecting them in their "house" (scoring area). The game supports both simultaneous and turn-based gameplay phases.

## Tech Stack

- **Framework**: React 18.2.0 with Create React App
- **Language**: JavaScript (no TypeScript)
- **Styling**: Plain CSS with component-scoped files
- **Analytics**: Vercel Analytics
- **Testing**: Jest + React Testing Library (no tests written yet)
- **Icons**: Font Awesome 4.7 via CDN

## Commands

```bash
npm start    # Development server on port 3000
npm build    # Production build
npm test     # Run tests in watch mode
```

## Project Structure

```
src/
├── App.js                 # Root component wrapper
├── index.js               # React DOM entry point
├── components/
│   ├── CongkakBoard.js    # Main game logic (928 lines) - handles all game state
│   ├── CongkakBoard.css   # Board and layout styling
│   ├── House.js           # Player score container
│   ├── Hole.js            # Individual board hole
│   ├── Row.js             # Row of 7 holes
│   ├── Cursor.js          # Hand cursor with SVG
│   ├── Cursor.css         # Shake animation
│   ├── InfoModal.js       # Game rules (EN/BM bilingual)
│   └── InfoModal.css
├── config/
│   ├── config.js          # Game constants, board indices, animation timing
│   └── gamePhaseConfig.js # 7 game phase states
└── utils/
    ├── helpers.js         # Turn logic, game end checks
    └── animation.js       # Shake effect, sidebar toggles
```

## Key Patterns

### State Management
- All game state centralized in CongkakBoard.js using 22 useState hooks
- No Redux/Context/Zustand - pure React hooks
- State includes: seeds array, house scores, cursor positions, game phases

### Board Index System
- 14 holes total (indices 0-13)
- Upper row: indices 0-6 (player upper)
- Lower row: indices 7-13 (player lower)
- Opposite hole calculation: `MAX_INDEX_LOWER - currentIndex`

### Animation Pattern
- Async/await with setTimeout for animation sequencing
- 350ms delay between moves (configurable in config.js)
- Cursor uses CSS transitions (0.25s)
- Refs used for cursor positioning via getBoundingClientRect()

### Player Constants
- `PLAYER_UPPER` and `PLAYER_LOWER` for symmetric game logic
- Upper player: WASD + Space controls
- Lower player: Arrow keys

### Game Phases (from gamePhaseConfig.js)
1. `STARTING_PHASE` - Initial selection
2. `SIMULTANEOUS_SELECT` - Both players active
3. `SIMULTANEOUS_SELECT_UPPER/LOWER` - One player waiting
4. `PASS_TO_TURN_BASED` - Transition phase
5. `TURN_BASED_SELECT` - Waiting for selection
6. `TURN_BASED_SOWING` - Executing animation

## Game Rules Implementation

- **Simultaneous start**: Both players select and sow at the same time
- **Turn-based transition**: When one player's sowing ends, game becomes turn-based
- **Continue sowing**: Land in non-empty hole = pick up and continue
- **Extra turn**: Land in own house = get another turn
- **Capturing**: Land in empty hole on own row after passing house = capture opposite hole's seeds
- **Win condition**: First to 50+ seeds OR highest score when both rows empty

## Styling Notes

- Responsive design using viewport units (vw, vh)
- Dark theme: #302E2B background, #575452 holes
- Light theme: #EBEBD0 holes
- Board green: #4d6a2b
- Flexbox layout throughout

## Working with This Codebase

- Main logic is in CongkakBoard.js - this is the primary file to modify for game behavior
- Config values in config/config.js control timing and board layout
- Cursor positioning relies on refs and getBoundingClientRect()
- Animation chains use async/await patterns - be careful with timing dependencies
- InfoModal has bilingual content (English/Malay) - update both when changing rules text
