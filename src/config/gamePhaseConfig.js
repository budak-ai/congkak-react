// gamePhaseConfig

const gamePhaseConfig = {
    COUNTDOWN: 'COUNTDOWN',                           // Countdown before freeplay
    FREEPLAY: 'FREEPLAY',                             // Async simultaneous play
    TURN_BASED_SELECT : 'TURN_BASED_SELECT',          // Waiting for player to select hole
    TURN_BASED_SOWING : 'TURN_BASED_SOWING',          // Player is sowing seeds
    // Traditional mode phases
    ROUND_END: 'ROUND_END',                           // Show round stats, continue/end options
    REDISTRIBUTING: 'REDISTRIBUTING',                 // Animate seed redistribution
    MATCH_END: 'MATCH_END'                            // Final results for multi-round match
}

export default gamePhaseConfig;