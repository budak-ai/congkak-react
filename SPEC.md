# Congkak Game Specification

## Project Vision

A polished digital implementation of traditional Malaysian Congkak, shipping as a web application with incremental feature releases. BM (Bahasa Malaysia) is the primary language, reflecting cultural authenticity.

---

## Implementation Status

### MVP (v1.0) - COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Freeplay Mode | ✅ Done | Countdown start, independent cursors, real-time seed sync |
| Turn-Based Transition | ✅ Done | Automatic transition when one player's row empties |
| Home Menu | ✅ Done | Play, Rules, Settings with polished branding |
| Language System | ✅ Done | BM/EN toggle, persisted to localStorage |
| Debug Panel | ✅ Done | Tabbed UI with state view, event log, board editor |
| Seed Validation | ✅ Done | Real-time validation + event log with visual diffs |
| Bug Fixes | ✅ Done | Stale closure fix, animation sync improvements |

**Branch**: `feature/mvp-implementation` (ready for PR to `main`)

### Next Up

| Priority | Feature | Status |
|----------|---------|--------|
| 1 | Multi-round Traditional (Lubang Hangus) | Not started |
| 2 | AI Opponent | Not started |
| 3 | Backend Infrastructure | Not started |
| 4 | Audio | Not started |
| 5 | Shareable Result Cards | Not started |
| 6 | Online Multiplayer | Deferred |

---

## Core Gameplay

### Simultaneous Phase
- **Freeplay model**: Both players move independently, no collision resolution
- **Race conditions accepted**: If both cursors interact with same hole, let chaos happen naturally
- **Multi-touch support**: Tablet users can tap simultaneously on their respective sides

### Turn-Based Phase
- **Simple transition**: Current behavior maintained - disable inactive player's controls
- **Turn indicator**: Only current player's side responds to touch input
- **Fixed animation speed**: 350ms delay between moves for fairness (not skill-based)

### Win Conditions
- First to 50+ seeds, OR
- Highest score when both rows empty

---

## Game Modes

### Quick Match (Single Round)
- Current implementation
- One game, one winner, restart to play again

### Traditional Multi-Round (Lubang Hangus)
- **Burning rules**: Rightmost holes burn first when player has insufficient seeds
- **Burned hole behavior**: Skipped entirely during sowing
- **Refill source**: All seeds player owns (including house) used to fill holes
- **Match end**: Total domination (all 7 holes burned) OR player concession
- **Animation timing**: Consistent 350ms even with fewer holes (add placeholder delays)

### AI Opponent (Future)
- Simple heuristics: rule-based (prefer captures, avoid feeding opponent)
- Client-side execution, works offline
- Single difficulty level initially

### Online Multiplayer (Dream Feature - Deferred)
- Real-time remote play
- Netcode design deferred until implementation

---

## User Interface

### Home Menu
- **Style**: Polished/branded, evolving from current board aesthetic (green/brown)
- **Options**: Play, Rules, Settings, Leaderboard
- **Design assets**: Derive from existing board styling

### Language
- **Default**: BM (Bahasa Malaysia)
- **Secondary**: English
- **Selection**: Corner dropdown, non-blocking, persisted to localStorage
- **Future**: i18n infrastructure for community translations

### Rules Modal
- Mode-specific tabs (Quick Match vs Traditional rules)
- Bilingual content (BM primary, EN secondary)

### End Game Experience
- Victory animation (confetti, winner highlight)
- Stats summary (moves made, captures, seeds per turn average)
- Shareable result card (server-side rendered for quality)

### Debug Mode (Development Only) - IMPLEMENTED
- Collapsible panel at bottom of screen (hidden in production builds)
- **Three tabs**:
  - **State**: Current seed counts, house totals, validation status
  - **Event Log**: Last 50 seed events with expandable before/after diffs
  - **Edit Board**: Direct manipulation of hole/house values
- **Test scenarios** (one-click apply):
  - Near-endgame states
  - Capture setups (Upper/Lower)
  - Simultaneous collision states
  - Empty row states
  - Almost-win states
- **Real-time validation**: Total seed count shown in header, warnings on mismatch

---

## Audio Design

**Priority**: Nice-to-have (post-core features, pre-final ship)

**Style**: Modern gamified with traditional elements
- Web Audio API synthesis (procedural sounds)
- Sounds: wood tap, seed drop, capture swoosh, victory fanfare
- Optional: ambient traditional elements

---

## Backend Architecture

### Stack
- **API**: Python/FastAPI
- **Database**: Self-hosted PostgreSQL (Docker)
- **Hosting**: Self-hosted Docker (migrating from Vercel)

### Features

#### Authentication
- Optional social login (Google, Facebook, Twitter)
- Anonymous play always available
- Required only for leaderboard submission and cloud saves

#### Leaderboard
- Global all-time rankings
- Named entries (requires account)
- Player identity tied to social login

#### Cloud Saves
- Persist multi-round game state
- Resume across sessions/devices
- Requires authentication

#### Share Card Generation
- Server-side image rendering
- Consistent quality across platforms
- Returns shareable URL

---

## Technical Requirements

### Refactoring (Priority: High)
- Extract hooks from CongkakBoard.js (928 lines)
- Incremental approach: always-working constraint
- Keep useState pattern, lift state for API integration
- No new state management libraries

### Bug Fixes

#### Seed Count Inconsistency - FIXED
- **Root cause**: Stale closure reading `seeds` instead of `newSeeds` during freeplay
- **Fix**: Use refs for real-time state sync, functional updates for race conditions
- **Verification**: Event log tracks every state change with before/after diffs
- **Tooling**: `useSeedEventLog` hook provides real-time validation

#### Animation Glitches - IMPROVED
- Standardized animation delays via config constants
- CSS transitions synced with JS timing (350ms)
- Cursor visibility controls during reset

#### Resize Handling (Priority: Medium)
- Status: Untested
- Cursor positioning uses getBoundingClientRect()
- Needs investigation for window resize behavior

### Mobile Support
- Tap to select holes
- Multi-touch for simultaneous phase
- Turn indicator restricts touch in turn-based phase
- Viewport: Currently works fine (vh/vw units)

### Accessibility
- **Priority**: Deferred
- Future consideration: keyboard nav, screen reader, reduced motion

---

## Deployment

### CI/CD Pipeline (To Be Set Up)
- GitHub Actions for tests/builds
- Environment-based deployment:
  - Auto-deploy to staging on push
  - Manual promotion to production
- Docker containerization

### Environments
- **Staging**: Auto-deploy for testing
- **Production**: Manual trigger for releases

---

## Release Strategy

### MVP (First Release) - COMPLETE
- ✅ Bug fixes (seed count, animation glitches)
- ✅ Home menu with polished branding
- ✅ Language selector (BM/EN)
- ✅ Debug mode (dev builds only)
- ✅ Runtime assertions for game integrity
- ✅ Freeplay mode with countdown start

### Subsequent Releases (Priority Order)
1. Multi-round traditional mode (Lubang Hangus)
2. AI opponent (simple heuristics)
3. Backend infrastructure (auth, leaderboard, cloud saves)
4. Audio implementation
5. Shareable result cards
6. Online multiplayer (long-term)

---

## Definition of Done

**Project Philosophy**: Minimum viable + iterate
- Ship stable local game first
- Iterate based on user feedback
- No fixed end state - continuous improvement

---

## Open Questions

- [x] ~~Investigate seed count bug pattern~~ → Fixed: stale closure in freeplay mode
- [ ] Test resize handling behavior
- [ ] Research authoritative multi-round Congkak rules for edge cases
- [ ] Prototype Web Audio sounds for feel/quality assessment
