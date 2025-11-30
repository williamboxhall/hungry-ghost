// Game State Logic Module - Pure functions for phase management, turn flow, and game state
// This module contains no React or DOM dependencies

import { incrementPlayerDay } from './playerLogic.js';

// Game phases
export const PHASES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

// Game state factory
export const createInitialGameState = (players) => ({
  turnCount: 1,
  currentPlayerIdx: 0,
  phase: PHASES.MORNING,
  winner: null,
  showEveningChoice: false,
  showReincarnationChoice: false,
  pendingReincarnation: null,
  isMoving: false,
  players: players,
  logs: [{ message: "Game started. Welcome to the Human Realm.", type: "neutral" }]
});

// Phase management
export const getNextPhase = (currentPhase) => {
  switch (currentPhase) {
    case PHASES.MORNING:
      return PHASES.AFTERNOON;
    case PHASES.AFTERNOON:
      return PHASES.EVENING;
    case PHASES.EVENING:
      return PHASES.MORNING; // Next turn
    default:
      return PHASES.MORNING;
  }
};

export const shouldAutoAdvancePhase = (player, phase) => {
  // Spiritual realm players auto-advance through morning/afternoon
  return player.realm !== 'human' && phase !== PHASES.EVENING;
};

export const canTakeActionsInPhase = (player, phase) => {
  if (phase === PHASES.EVENING) {
    return player.realm === 'human'; // Only humans take actions in evening
  }
  return player.realm === 'human'; // Only humans take actions in general
};

// Turn management
export const advanceToNextPhase = (gameState) => {
  const newPhase = getNextPhase(gameState.phase);

  if (newPhase === PHASES.MORNING) {
    // End of turn - advance to next player
    return advanceToNextPlayer(gameState);
  } else {
    // Within same turn - just advance phase
    return {
      ...gameState,
      phase: newPhase
    };
  }
};

export const advanceToNextPlayer = (gameState) => {
  const nextPlayerIdx = (gameState.currentPlayerIdx + 1) % gameState.players.length;

  // Increment day count for the next player
  const updatedPlayers = gameState.players.map(p =>
    p.id === nextPlayerIdx ? incrementPlayerDay(p) : p
  );

  return {
    ...gameState,
    phase: PHASES.MORNING,
    currentPlayerIdx: nextPlayerIdx,
    players: updatedPlayers,
    showEveningChoice: false,
    showReincarnationChoice: false,
    pendingReincarnation: null,
    isMoving: false,
    turnCount: gameState.turnCount + 1
  };
};

export const skipToPhase = (gameState, targetPhase) => {
  return {
    ...gameState,
    phase: targetPhase
  };
};

// Game state queries
export const getCurrentPlayer = (gameState) => {
  return gameState.players[gameState.currentPlayerIdx];
};

export const isPlayerTurn = (gameState, playerId) => {
  return getCurrentPlayer(gameState).id === playerId;
};

export const getActivePlayers = (gameState) => {
  return gameState.players.filter(p => p.realm === 'human');
};

export const getAllPlayers = (gameState) => {
  return gameState.players;
};

export const getPlayerById = (gameState, playerId) => {
  return gameState.players.find(p => p.id === playerId);
};

// Game state updates
export const updatePlayer = (gameState, playerId, updates) => {
  const updatedPlayers = gameState.players.map(p => {
    if (p.id !== playerId) return p;
    const newValues = typeof updates === 'function' ? updates(p) : updates;
    return { ...p, ...newValues };
  });

  return {
    ...gameState,
    players: updatedPlayers
  };
};

export const updatePlayers = (gameState, playerUpdates) => {
  const updatedPlayers = gameState.players.map(p => {
    const update = playerUpdates.find(u => u.id === p.id);
    return update ? { ...p, ...update.changes } : p;
  });

  return {
    ...gameState,
    players: updatedPlayers
  };
};

export const replacePlayer = (gameState, playerId, newPlayer) => {
  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? newPlayer : p
  );

  return {
    ...gameState,
    players: updatedPlayers
  };
};

// UI state management
export const setEveningChoiceVisible = (gameState, visible) => ({
  ...gameState,
  showEveningChoice: visible
});

export const setReincarnationChoiceVisible = (gameState, visible, reincarnationData = null) => ({
  ...gameState,
  showReincarnationChoice: visible,
  pendingReincarnation: reincarnationData
});

export const setMovingMode = (gameState, isMoving) => ({
  ...gameState,
  isMoving
});

export const setWinner = (gameState, winner) => ({
  ...gameState,
  winner
});

// Logging
export const addLog = (gameState, message, type = "neutral", playerId = null) => ({
  ...gameState,
  logs: [...gameState.logs, { message, type, playerId }]
});

export const clearLogs = (gameState) => ({
  ...gameState,
  logs: []
});

export const getRecentLogs = (gameState, count = 10) => {
  return gameState.logs.slice(-count);
};

// Game flow helpers
export const isGameOver = (gameState) => {
  return gameState.winner !== null;
};

export const canPlayerAct = (gameState, playerId) => {
  const player = getPlayerById(gameState, playerId);
  if (!player) return false;

  return isPlayerTurn(gameState, playerId) &&
         canTakeActionsInPhase(player, gameState.phase) &&
         !isGameOver(gameState);
};

export const needsEveningChoice = (gameState) => {
  const currentPlayer = getCurrentPlayer(gameState);
  return gameState.phase === PHASES.EVENING &&
         currentPlayer.realm === 'human' &&
         !gameState.showEveningChoice &&
         !gameState.showReincarnationChoice;
};

export const needsReincarnationChoice = (gameState) => {
  const currentPlayer = getCurrentPlayer(gameState);
  return (currentPlayer.realm === 'heaven' || currentPlayer.realm === 'hell') &&
         (currentPlayer.life <= 0 || currentPlayer.merit === 0) &&
         !gameState.showReincarnationChoice;
};

// Phase transition helpers
export const getPhaseTransitionMessage = (fromPhase, toPhase, playerName) => {
  if (fromPhase === toPhase) return null;

  switch (toPhase) {
    case PHASES.MORNING:
      return `It is Morning. ${playerName}'s turn begins.`;
    case PHASES.AFTERNOON:
      return "It is now Afternoon.";
    case PHASES.EVENING:
      return "It is now Evening. Time for the end of day ritual.";
    default:
      return null;
  }
};

export const shouldShowPhaseTransition = (fromPhase, toPhase) => {
  return fromPhase !== toPhase;
};

// Game state validation
export const isValidGameState = (gameState) => {
  try {
    return (
      typeof gameState === 'object' &&
      typeof gameState.turnCount === 'number' &&
      typeof gameState.currentPlayerIdx === 'number' &&
      typeof gameState.phase === 'string' &&
      Array.isArray(gameState.players) &&
      Array.isArray(gameState.logs) &&
      gameState.currentPlayerIdx >= 0 &&
      gameState.currentPlayerIdx < gameState.players.length &&
      Object.values(PHASES).includes(gameState.phase)
    );
  } catch (error) {
    return false;
  }
};

// Game statistics
export const getGameStatistics = (gameState) => {
  const players = gameState.players;
  const humanPlayers = players.filter(p => p.realm === 'human');
  const spiritualPlayers = players.filter(p => p.realm !== 'human');

  return {
    turnCount: gameState.turnCount,
    totalPlayers: players.length,
    humanPlayers: humanPlayers.length,
    playersInHeaven: players.filter(p => p.realm === 'heaven').length,
    playersInHell: players.filter(p => p.realm === 'hell').length,
    totalLogs: gameState.logs.length,
    gamePhase: gameState.phase,
    currentPlayerName: getCurrentPlayer(gameState).name,
    averageMerit: players.reduce((sum, p) => sum + p.merit, 0) / players.length,
    totalInsight: players.reduce((sum, p) => sum + p.insight, 0),
    monks: players.filter(p => p.isMonk).length,
    teachers: players.filter(p => p.isTeacher).length,
    meditators: players.filter(p => p.isMeditator).length,
    greedyPlayers: players.filter(p => p.isGreedy).length
  };
};

// Turn history tracking
export const createTurnRecord = (gameState, action, result) => {
  const currentPlayer = getCurrentPlayer(gameState);

  return {
    turnNumber: gameState.turnCount,
    phase: gameState.phase,
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    action: action,
    result: result,
    gameState: {
      playersInRealms: {
        human: gameState.players.filter(p => p.realm === 'human').length,
        heaven: gameState.players.filter(p => p.realm === 'heaven').length,
        hell: gameState.players.filter(p => p.realm === 'hell').length
      }
    },
    timestamp: Date.now()
  };
};

// State persistence helpers
export const serializeGameState = (gameState) => {
  return JSON.stringify(gameState);
};

export const deserializeGameState = (serializedState) => {
  try {
    const gameState = JSON.parse(serializedState);
    return isValidGameState(gameState) ? gameState : null;
  } catch (error) {
    return null;
  }
};