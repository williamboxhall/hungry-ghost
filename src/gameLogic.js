// Game Logic Module - Pure functions for game state management
// This module contains no React or DOM dependencies

import { getPhaseTransitionMessage, PHASES } from './gameStateLogic.js';

// Constants
export const MAX_MERIT = 5;
export const MIN_MERIT = -5;
export const BASE_MAX_DANA = 10;

// Calculate maximum Dana based on player's age position
// Dana slots start at position 6, so max Dana = 10 - max(0, age - 5)
export const getMaxDana = (player) => {
  const danaStart = 6;
  const ageInDanaTrack = Math.max(0, player.age - 5);
  return Math.max(0, BASE_MAX_DANA - ageInDanaTrack);
};
export const INITIAL_DELUSION = 30;
export const MAX_DELUSION = 30;
export const WINNING_INSIGHT = 7;
export const INITIAL_LIFE = 5;

export const LOCATIONS = [
  { id: 'cave', name: 'Cave', capacity: 1, type: 'meditation', meditationSlots: 1 },
  { id: 'forest', name: 'Forest', capacity: 2, type: 'meditation', meditationSlots: 2 },
  { id: 'town', name: 'Town', capacity: 99, type: 'social', meditationSlots: 0 },
  { id: 'temple', name: 'Temple', capacity: 99, type: 'mixed', meditationSlots: 3 }
];

// Initial player state factory
export const createInitialPlayer = (id, name, color) => ({
  id,
  name,
  color,
  location: 'town',
  realm: 'human',
  life: INITIAL_LIFE,
  merit: 0,
  dana: 0,
  delusion: INITIAL_DELUSION,
  insight: 0,
  dayCount: 1,
  lifeCount: 1,
  isMonk: false,
  isMeditator: false,
  isTeacher: false,
  isGreedy: false,
  isMeditating: false,
  age: 0
});

// Helper functions
export const getPlayersAt = (players, locationId) =>
  players.filter(p => p.location === locationId && p.realm === 'human');

export const getPlayer = (players, playerId) =>
  players.find(p => p.id === playerId);

export const updatePlayerInArray = (players, playerId, updates) =>
  players.map(p => p.id === playerId ? { ...p, ...updates } : p);

// Pure Action Functions - return new state without side effects

export const createAgeAction = (player) => {
  const newPosition = player.age + 1;
  const newPlayer = { ...player, age: newPosition };

  // Check if there's a heart to collect
  if (newPosition <= 5 && player.age < newPosition) {
    newPlayer.life = player.life + 1;
  }

  // Reduce Dana if it exceeds the new capacity after aging
  newPlayer.dana = Math.min(getMaxDana(newPlayer), player.dana);

  return newPlayer;
};

export const createExtendAction = (player) => {
  const currentPos = player.age;
  const newPosition = currentPos + 1;

  // For EXTEND, we specifically place Dana in the slot we're moving into,
  // so just reduce Dana by 1 and move - no additional capacity reduction needed
  // The Dana placement logic handles which coin gets visually removed
  return {
    ...player,
    dana: player.dana - 1,
    age: newPosition
  };
};

export const createMeditateAction = (player, location, playersAtLocation) => {
  let delusionDrop = 0;
  if (location.id === 'temple') delusionDrop = 1 + playersAtLocation.length - 1;
  if (location.id === 'forest') delusionDrop = 1;
  if (location.id === 'cave') delusionDrop = 2;

  if (player.delusion > 0) {
    return {
      ...player,
      delusion: Math.max(0, player.delusion - delusionDrop)
    };
  } else {
    return {
      ...player,
      insight: player.insight + delusionDrop
    };
  }
};

export const createGoodDeedAction = (player) => {
  return {
    ...player,
    dana: player.dana - 1,
    merit: Math.min(MAX_MERIT, player.merit + 1)
  };
};

export const createBadDeedAction = (player, victimsWithDana, townBonus) => {
  const totalStolen = victimsWithDana.length + townBonus;
  return {
    ...player,
    merit: Math.max(MIN_MERIT, player.merit - totalStolen),
    dana: Math.min(getMaxDana(player), player.dana + totalStolen)
  };
};

export const createAlmsAction = (player) => {
  return {
    ...player,
    dana: Math.min(getMaxDana(player), player.dana + 1)
  };
};

export const createMonkAction = (player) => {
  return {
    ...player,
    isMonk: true,
    dana: 0
  };
};

export const createMoveAction = (player, targetLocation) => {
  const updatedPlayer = { ...player, location: targetLocation };

  // Greedy logic - steal dana when entering town
  if (player.isGreedy && targetLocation === 'town') {
    updatedPlayer.merit = Math.max(MIN_MERIT, updatedPlayer.merit - 1);
    updatedPlayer.dana = Math.min(getMaxDana(updatedPlayer), updatedPlayer.dana + 1);
  }

  return updatedPlayer;
};

// Evening ritual effects
export const createEveningRitualAction = (player) => {
  if (player.realm === 'heaven') {
    return {
      ...player,
      delusion: Math.max(0, player.delusion - 1),
      merit: Math.max(0, player.merit - 1)
    };
  } else if (player.realm === 'hell') {
    return {
      ...player,
      delusion: player.delusion + 1,
      merit: Math.min(0, player.merit + 1),
      life: Math.abs(player.merit + 1) // Life bound to absolute merit in hell
    };
  }
  // Human realm players handle evening differently (aging track)
  return player;
};

// Reincarnation logic
export const prepareReincarnation = (player) => {
  if (player.insight >= WINNING_INSIGHT) {
    return { type: 'victory', player };
  }

  let nextRealm = 'human';
  let nextRole = { isTeacher: false, isGreedy: false, isMonk: false, isMeditator: false };
  let startingLife = INITIAL_LIFE;

  if (player.realm === 'human') {
    if (player.merit > 0) nextRealm = 'heaven';
    else if (player.merit < 0) nextRealm = 'hell';
    else nextRealm = 'human';
  } else {
    nextRealm = 'human';
    if (player.realm === 'heaven') nextRole.isTeacher = true;
    else if (player.realm === 'hell') nextRole.isGreedy = true;
  }

  if (nextRealm === 'heaven') startingLife = Math.max(0, player.merit - 1);
  else if (nextRealm === 'hell') startingLife = Math.max(0, Math.abs(player.merit) - 1);

  return { type: 'reincarnate', player, nextRealm, nextRole, startingLife };
};

export const executeReincarnation = (player, nextRealm, nextRole, startingLife) => {
  if (nextRole.isTeacher) nextRole.isMeditator = true;

  let newMerit = player.merit;
  if (player.realm !== 'human') newMerit = 0;

  return {
    ...player,
    realm: nextRealm,
    life: startingLife,
    dana: 0,
    insight: 0,
    location: 'town',
    dayCount: 1,
    lifeCount: player.lifeCount + 1,
    isMonk: nextRole.isMonk,
    isTeacher: nextRole.isTeacher,
    isGreedy: nextRole.isGreedy,
    isMeditator: nextRole.isMeditator,
    merit: newMerit,
    age: 0 // Start at position 0
  };
};

export const createBodhisattvaReincarnation = (player) => {
  return {
    ...player,
    realm: 'human',
    life: INITIAL_LIFE,
    dana: 0,
    insight: 0,
    location: 'town',
    dayCount: 1,
    lifeCount: player.lifeCount + 1,
    isMonk: false,
    isTeacher: true,
    isGreedy: false,
    isMeditator: true,
    merit: player.merit, // Keep current Merit instead of resetting to 0
    age: 0
  };
};

// Interaction effects (teachers, greedy players)
export const applyLocationInteractions = (players, movingPlayer, targetLocation) => {
  const playersAtTarget = getPlayersAt(players, targetLocation);
  let updatedPlayers = [...players];
  let updatedMovingPlayer = { ...movingPlayer };

  // Teachers teach arriving player
  const teachers = playersAtTarget.filter(p => p.isTeacher && p.id !== movingPlayer.id);
  if (teachers.length > 0 && !updatedMovingPlayer.isMeditator) {
    updatedMovingPlayer.isMeditator = true;

    // Store the teaching event to be logged
    updatedMovingPlayer._teachingEvent = {
      teacher: teachers[0],
      message: `${updatedMovingPlayer.name} learned meditation from ${teachers[0].name}`
    };

    // Teachers gain merit
    updatedPlayers = updatedPlayers.map(p => {
      if (teachers.some(t => t.id === p.id)) {
        return { ...p, merit: Math.min(MAX_MERIT, p.merit + 1) };
      }
      return p;
    });
  }

  // Greedy players steal from arriving player
  const greedyPlayers = playersAtTarget.filter(p => p.isGreedy && p.id !== movingPlayer.id);
  greedyPlayers.forEach(greedy => {
    if (updatedMovingPlayer.dana > 0) {
      updatedMovingPlayer.dana = Math.max(0, updatedMovingPlayer.dana - 1);

      // Update greedy player
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === greedy.id) {
          return {
            ...p,
            dana: Math.min(getMaxDana(p), p.dana + 1),
            merit: Math.max(MIN_MERIT, p.merit - 1)
          };
        }
        return p;
      });
    }
  });

  // Update the moving player in the array
  updatedPlayers = updatedPlayers.map(p =>
    p.id === movingPlayer.id ? updatedMovingPlayer : p
  );

  return updatedPlayers;
};

// Action validation
export const canTakeAction = (player, action, gameState) => {
  const { phase, isMoving } = gameState;

  switch (action) {
    case 'move':
      return phase !== 'evening' && player.realm === 'human';
    case 'meditate':
      return phase !== 'evening' && !isMoving && player.isMeditator;
    case 'goodDeed':
      const hasOthersOrInTown = player.location === 'town' ||
        getPlayersAt(gameState.players, player.location).length > 1;
      return phase !== 'evening' && !isMoving && player.dana >= 1 && hasOthersOrInTown;
    case 'badDeed':
      const canSteal = player.location === 'town' ||
        getPlayersAt(gameState.players, player.location).some(p => p.id !== player.id && p.dana > 0);
      return phase !== 'evening' && !isMoving && player.dana < getMaxDana(player) && canSteal;
    case 'alms':
      return phase === 'morning' && !isMoving && player.isMonk && player.location === 'town' && player.dana < getMaxDana(player);
    case 'age':
      return phase === 'evening' && player.age < 5;
    case 'extend':
      return phase === 'evening' && player.age >= 5 && player.dana > 0;
    case 'die':
      return phase === 'evening' && player.age >= 5;
    case 'nirvana':
      return phase === 'evening' && player.age >= 5 && player.insight >= WINNING_INSIGHT;
    case 'bodhisattva':
      return phase === 'evening' && player.age >= 5 && player.insight >= WINNING_INSIGHT;
    default:
      return false;
  }
};

// Game Controller - handles all game orchestration
export class GameController {
  constructor() {
    this.initializeState();
  }

  initializeState() {
    this.state = {
      turnCount: 1,
      currentPlayerIdx: 0,
      actionsLeft: 2,
      phase: 'morning',
      winner: null,
      showEveningChoice: false,
      showReincarnationChoice: false,
      pendingReincarnation: null,
      isMoving: false,
      players: [
        createInitialPlayer(0, 'Blue', 'bg-blue-600'),
        createInitialPlayer(1, 'Green', 'bg-green-600'),
        createInitialPlayer(2, 'Red', 'bg-red-600')
      ],
      logs: [{ message: "Game started. Welcome to the Human Realm.", type: "neutral" }]
    };
  }

  // Method to reset game if state gets corrupted
  resetGame() {
    console.log('Resetting game state...');
    this.initializeState();
  }

  getState() {
    return { ...this.state };
  }

  getCurrentPlayer() {
    if (!this.state.players || this.state.players.length === 0) {
      console.error('No players available', this.state.players);
      return null;
    }
    if (this.state.currentPlayerIdx < 0 || this.state.currentPlayerIdx >= this.state.players.length) {
      console.error('Invalid currentPlayerIdx:', this.state.currentPlayerIdx, 'players length:', this.state.players.length);
      return null;
    }
    return this.state.players[this.state.currentPlayerIdx];
  }

  addLog(msg, type = "neutral", playerId = null) {
    this.state.logs = [...this.state.logs, { message: msg, type, playerId }];
  }

  updatePlayer(id, updates) {
    this.state.players = this.state.players.map(p => {
      if (p.id !== id) return p;
      const newValues = typeof updates === 'function' ? updates(p) : updates;
      return { ...p, ...newValues };
    });
  }

  advancePhase() {
    const currentPlayer = this.getCurrentPlayer();

    if (this.state.phase === 'morning') {
      // Spiritual realm players skip afternoon phase
      if (currentPlayer && currentPlayer.realm !== 'human') {
        this.state.phase = 'evening';
        this.addLog("It is now Evening. Time for the end of day ritual.", "neutral");
      } else {
        this.state.phase = 'afternoon';
        this.addLog("It is now Afternoon.", "neutral");
      }
    } else if (this.state.phase === 'afternoon') {
      this.state.phase = 'evening';
      this.addLog("It is now Evening. Time for the end of day ritual.", "neutral");
    } else {
      // End of Evening -> Next Turn
      this.state.phase = 'morning';
      this.state.showEveningChoice = false;
      let nextIdx = (this.state.currentPlayerIdx + 1) % this.state.players.length;

      // Increment day count for the next player
      this.state.players = this.state.players.map(p =>
        p.id === nextIdx ? { ...p, dayCount: p.dayCount + 1 } : p
      );

      this.state.currentPlayerIdx = nextIdx;

      // Log turn start with currency data (colored by player)
      const nextPlayer = this.state.players.find(p => p.id === nextIdx);
      console.log('DEBUG: nextIdx =', nextIdx, 'nextPlayer =', nextPlayer, 'nextPlayer.id =', nextPlayer?.id);
      if (nextPlayer) {
        const turnMessage = getPhaseTransitionMessage('evening', PHASES.MORNING, nextPlayer.name, nextPlayer);
        if (turnMessage) {
          this.addLog(turnMessage, "player", nextPlayer.id);
        }
      }
    }
  }

  handleMove(targetLoc) {
    const currentPlayer = this.getCurrentPlayer();
    let greedyLog = null;

    // Update current player location and clear meditation state
    this.state.players = this.state.players.map(p => {
      if (p.id === this.state.currentPlayerIdx) {
        let next = { ...createMoveAction(p, targetLoc), isMeditating: false };
        // Greedy Logic check
        if (p.isGreedy && targetLoc === 'town') {
          greedyLog = { message: `${p.name} (Greedy) stole Dana +1 entering Town for Merit -1`, playerId: p.id };
        }
        return next;
      }
      return p;
    });

    const me = this.state.players.find(p => p.id === this.state.currentPlayerIdx);

    // Apply location interactions
    this.state.players = applyLocationInteractions(this.state.players, me, targetLoc);

    // Check for teaching events
    const updatedPlayer = this.state.players.find(p => p.id === this.state.currentPlayerIdx);
    if (updatedPlayer._teachingEvent) {
      this.addLog(updatedPlayer._teachingEvent.message, "player", updatedPlayer.id);
      // Clean up the temporary teaching event
      delete updatedPlayer._teachingEvent;
    }

    if (greedyLog) {
      this.addLog(greedyLog.message, "player", greedyLog.playerId);
    }

    this.advancePhase();
    this.addLog(`${currentPlayer.name} moved to ${targetLoc}.`, "player", currentPlayer.id);
  }

  // Check available meditation slots at a location
  getAvailableMeditationSlots(locationId, excludePlayerId = null) {
    const location = LOCATIONS.find(l => l.id === locationId);
    if (!location || location.meditationSlots === 0) return 0;

    const playersAtLocation = getPlayersAt(this.state.players, locationId);
    const meditatingPlayers = playersAtLocation.filter(p =>
      p.isMeditating && p.id !== excludePlayerId
    );

    return location.meditationSlots - meditatingPlayers.length;
  }

  handleMeditate() {
    const currentPlayer = this.getCurrentPlayer();
    const loc = LOCATIONS.find(l => l.id === currentPlayer.location);

    // Check if meditation is possible at this location
    if (loc.meditationSlots === 0) {
      this.addLog(`${currentPlayer.name} cannot meditate in ${loc.name} - no meditation spots available`, "player", currentPlayer.id);
      return;
    }

    // Check if there are available meditation slots
    const availableSlots = this.getAvailableMeditationSlots(loc.id, currentPlayer.id);
    if (availableSlots === 0) {
      this.addLog(`${currentPlayer.name} cannot meditate - all meditation slots occupied in ${loc.name}`, "player", currentPlayer.id);
      return;
    }

    const playersAtLocation = getPlayersAt(this.state.players, loc.id);
    const newPlayer = {
      ...createMeditateAction(currentPlayer, loc, playersAtLocation),
      isMeditating: true
    };
    let delusionDrop = 0;
    if (loc.id === 'temple') delusionDrop = 1 + playersAtLocation.length - 1;
    if (loc.id === 'forest') delusionDrop = 1;
    if (loc.id === 'cave') delusionDrop = 2;

    this.updatePlayer(currentPlayer.id, newPlayer);

    if (newPlayer.delusion < currentPlayer.delusion) {
      this.addLog(`${currentPlayer.name} meditated for Delusion -${delusionDrop} (Delusion: ${newPlayer.delusion})`, "player", currentPlayer.id);
      if (newPlayer.delusion === 0 && currentPlayer.delusion > 0) {
        this.addLog(`${currentPlayer.name} has cleared all delusion!`, "player", currentPlayer.id);
      }
    } else {
      this.addLog(`${currentPlayer.name} meditated in clarity for Insight +${delusionDrop} (Insight: ${newPlayer.insight})`, "player", currentPlayer.id);
    }

    this.advancePhase();
  }

  handleGoodDeed() {
    const currentPlayer = this.getCurrentPlayer();
    const others = getPlayersAt(this.state.players, currentPlayer.location).filter(p => p.id !== currentPlayer.id);

    const newPlayer = { ...createGoodDeedAction(currentPlayer), isMeditating: false };
    this.updatePlayer(currentPlayer.id, newPlayer);

    if (others.length > 0 && currentPlayer.location !== 'town') {
      const receiver = others[0];
      this.updatePlayer(receiver.id, (prev) => ({
        dana: Math.min(getMaxDana(prev), prev.dana + 1),
        gainingDana: true
      }));

      // Clear dana gain animation after delay
      setTimeout(() => {
        this.updatePlayer(receiver.id, { gainingDana: false });
      }, 600);

      this.addLog(`${currentPlayer.name} gave Dana -1 to ${receiver.name} for Merit +1 (Dana: ${newPlayer.dana}, Merit: ${newPlayer.merit})`, "player", currentPlayer.id);
      this.addLog(`${receiver.name} received Dana +1 from ${currentPlayer.name}'s good deed (Dana: ${newReceiver.dana})`, "player", receiver.id);
    } else {
      this.addLog(`${currentPlayer.name} helped someone in town with Dana -1 for Merit +1 (Dana: ${newPlayer.dana}, Merit: ${newPlayer.merit})`, "player", currentPlayer.id);
    }

    this.advancePhase();
  }

  handleBadDeed() {
    const currentPlayer = this.getCurrentPlayer();
    const victimsWithDana = getPlayersAt(this.state.players, currentPlayer.location).filter(p => p.id !== currentPlayer.id && p.dana > 0);
    const townBonus = currentPlayer.location === 'town' ? 1 : 0;

    const newPlayer = { ...createBadDeedAction(currentPlayer, victimsWithDana, townBonus), isMeditating: false };
    const totalGain = victimsWithDana.length + townBonus;

    // Atomic update for bad deed
    this.state.players = this.state.players.map(p => {
      if (p.id === currentPlayer.id) {
        return {
          ...newPlayer,
          gainingDana: totalGain > 0
        };
      } else if (victimsWithDana.some(v => v.id === p.id)) {
        return { ...p, dana: p.dana - 1 };
      }
      return p;
    });

    // Clear dana gain animation after delay
    if (totalGain > 0) {
      setTimeout(() => {
        this.updatePlayer(currentPlayer.id, { gainingDana: false });
      }, 600);
    }

    // Log the bad deed action
    const totalStolen = victimsWithDana.length + townBonus;
    if (totalStolen > 0) {
      const sources = [];
      if (townBonus > 0) sources.push("Town");
      victimsWithDana.forEach(victim => sources.push(victim.name));

      this.addLog(`${currentPlayer.name} committed a bad deed and stole Dana +${totalStolen} (${sources.join(", ")}) for Merit -${totalStolen} (Dana: ${newPlayer.dana}, Merit: ${newPlayer.merit})`, "player", currentPlayer.id);

      // Log individual victim losses
      victimsWithDana.forEach(victim => {
        this.addLog(`${victim.name} lost Dana -1 from ${currentPlayer.name}'s theft (Dana: ${victim.dana - 1})`, "player", victim.id);
      });
    } else {
      this.addLog(`${currentPlayer.name} committed a bad deed but found nothing to steal for Merit -0`, "player", currentPlayer.id);
    }

    this.advancePhase();
  }

  handleAlms() {
    const currentPlayer = this.getCurrentPlayer();
    const newPlayer = createAlmsAction(currentPlayer);

    this.updatePlayer(currentPlayer.id, {
      ...newPlayer,
      isMeditating: false,
      gainingDana: true
    });

    // Clear dana gain animation after delay
    setTimeout(() => {
      this.updatePlayer(currentPlayer.id, { gainingDana: false });
    }, 600);

    this.addLog(`${currentPlayer.name} collected Dana +1 from alms (Dana: ${newPlayer.dana})`, "player", currentPlayer.id);
    this.advancePhase();
  }

  handleBecomeMonk() {
    const currentPlayer = this.getCurrentPlayer();
    const danaLost = currentPlayer.dana;
    const newPlayer = createMonkAction(currentPlayer);

    this.updatePlayer(currentPlayer.id, newPlayer);
    this.addLog(`${currentPlayer.name} ordained as a Monk (lost all Dana -${danaLost}, Dana: 0)`, "player", currentPlayer.id);
  }

  handleBliss() {
    const currentPlayer = this.getCurrentPlayer();
    const newDelusion = Math.max(0, currentPlayer.delusion - 1);

    this.updatePlayer(currentPlayer.id, { delusion: newDelusion });
    if (newDelusion < currentPlayer.delusion) {
      this.addLog(`${currentPlayer.name} experienced heavenly bliss: Delusion -1 (Delusion: ${newDelusion})`, "player", currentPlayer.id);
    } else {
      this.addLog(`${currentPlayer.name} experienced heavenly bliss: already at minimum delusion (Delusion: ${newDelusion})`, "player", currentPlayer.id);
    }
    this.advancePhase();
  }

  handleAgony() {
    const currentPlayer = this.getCurrentPlayer();
    const newDelusion = Math.min(MAX_DELUSION, currentPlayer.delusion + 1);

    this.updatePlayer(currentPlayer.id, { delusion: newDelusion });
    if (newDelusion > currentPlayer.delusion) {
      this.addLog(`${currentPlayer.name} endured hellish agony: Delusion +1 (Delusion: ${newDelusion})`, "player", currentPlayer.id);
    } else {
      this.addLog(`${currentPlayer.name} endured hellish agony: already at maximum delusion (Delusion: ${newDelusion})`, "player", currentPlayer.id);
    }
    this.advancePhase();
  }

  handleSpiritualAge() {
    const currentPlayer = this.getCurrentPlayer();

    // In spiritual realms, aging moves merit toward zero AND updates life accordingly
    let newMerit;
    let newLife;

    if (currentPlayer.realm === 'heaven') {
      newMerit = Math.max(0, currentPlayer.merit - 1);
      newLife = Math.max(0, newMerit - 1); // Hearts fill between 1 and merit position (exclusive)
    } else { // hell
      newMerit = Math.min(0, currentPlayer.merit + 1);
      newLife = Math.max(0, Math.abs(newMerit) - 1); // Hearts fill between -1 and merit position (exclusive)
    }

    this.updatePlayer(currentPlayer.id, { merit: newMerit, life: newLife });
    this.addLog(`${currentPlayer.name} aged in ${currentPlayer.realm}: Merit ${currentPlayer.realm === 'heaven' ? '-1' : '+1'} (Merit: ${newMerit}, Life: ${newLife})`, "player", currentPlayer.id);
    this.advancePhase();
  }

  handleEveningArrival() {
    const currentPlayer = this.getCurrentPlayer();

    this.state.players = this.state.players.map(p => {
      if (p.id !== currentPlayer.id) return p;

      // Spiritual realm players now use manual AGE/DIE buttons - don't auto-modify them
      if (p.realm === 'heaven' || p.realm === 'hell') {
        return p; // Return unchanged - spiritual realm players use manual actions
      }

      if (p.realm === 'human') {
        // Always show evening choice for humans - don't modify life yet
        this.state.showEveningChoice = true;
        return p; // Return unchanged for humans - they will choose their ritual
      }

      return p;
    });
  }

  ageNormally() {
    const currentPlayer = this.getCurrentPlayer();
    const newPlayer = createAgeAction(currentPlayer);
    const newPosition = newPlayer.age;
    const heartCollected = newPlayer.life > currentPlayer.life;

    const animations = [];
    if (heartCollected) {
      animations.push({
        type: 'removeHeart',
        playerId: currentPlayer.id,
        position: newPosition
      });
    }

    const logs = [{
      message: heartCollected
        ? `${currentPlayer.name} aged and removed a heart from position ${newPosition} (Life: ${newPlayer.life})`
        : `${currentPlayer.name} aged through empty position ${newPosition}`,
      type: 'player',
      playerId: currentPlayer.id
    }];

    this.updatePlayer(currentPlayer.id, newPlayer);
    logs.forEach(log => this.addLog(log.message, log.type, log.playerId));
    this.state.showEveningChoice = false;
    this.advancePhase();

    return { animations };
  }

  payToSurvive() {
    const currentPlayer = this.getCurrentPlayer();
    const newPlayer = createExtendAction(currentPlayer);
    const currentPos = currentPlayer.age;
    const newPosition = newPlayer.age;

    const animations = [{
      type: 'removeCoin',
      playerId: currentPlayer.id,
      index: currentPlayer.dana - 1 // Rightmost coin
    }];

    const logs = [{
      message: `${currentPlayer.name} paid Dana -1, placed it at position ${currentPos}, and aged to position ${newPosition} (Dana: ${newPlayer.dana})`,
      type: 'player',
      playerId: currentPlayer.id
    }];

    this.updatePlayer(currentPlayer.id, newPlayer);
    logs.forEach(log => this.addLog(log.message, log.type, log.playerId));
    this.state.showEveningChoice = false;
    this.advancePhase();

    return { animations };
  }

  chooseToDie() {
    this.state.showEveningChoice = false;
    // Prepare reincarnation data but don't execute yet
    const reincarnationData = prepareReincarnation(this.getCurrentPlayer());
    this.state.pendingReincarnation = reincarnationData;
    this.state.showReincarnationChoice = true;
  }

  chooseNirvana() {
    const currentPlayer = this.getCurrentPlayer();
    this.state.winner = currentPlayer;
    this.addLog(`*** ${currentPlayer.name} HAS ACHIEVED NIRVANA! GAME OVER ***`, "neutral", currentPlayer.id);
    this.state.showEveningChoice = false;
    this.advancePhase();
  }

  chooseBodhisattva() {
    const currentPlayer = this.getCurrentPlayer();
    const newPlayer = createBodhisattvaReincarnation(currentPlayer);

    this.updatePlayer(currentPlayer.id, newPlayer);
    this.addLog(`${currentPlayer.name} chose the Bodhisattva path - reborn as Teacher (Life: ${newPlayer.life}, Merit: ${newPlayer.merit})`, "player", currentPlayer.id);
    this.state.showEveningChoice = false;
    this.advancePhase();
  }

  confirmReincarnation() {
    if (this.state.pendingReincarnation.type === 'victory') {
      this.state.winner = this.state.pendingReincarnation.player;
      this.addLog(`*** ${this.state.pendingReincarnation.player.name} HAS ACHIEVED NIRVANA! GAME OVER ***`, "neutral", this.state.pendingReincarnation.player.id);
    } else {
      this.executeReincarnationInternal(this.state.pendingReincarnation);
      this.advancePhase();
    }
    this.state.showReincarnationChoice = false;
    this.state.pendingReincarnation = null;
  }

  executeReincarnationInternal({ player, nextRealm, nextRole, startingLife }) {
    this.addLog(`${player.name} has died.`, "player", player.id);

    const newPlayer = executeReincarnation(player, nextRealm, nextRole, startingLife);
    this.updatePlayer(player.id, newPlayer);

    this.addLog(`${player.name} reincarnated in ${nextRealm} Realm! (Life: ${newPlayer.life}, Merit: ${newPlayer.merit})`, "player", player.id);
  }

  toggleMoveMode() {
    if (this.state.phase === 'evening') return;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;
    if (currentPlayer.realm !== 'human') return;

    this.state.isMoving = !this.state.isMoving;
    if (this.state.isMoving) {
      this.addLog("Select a location to move to.", "player", currentPlayer.id);
    } else {
      this.addLog("Movement cancelled.", "player", currentPlayer.id);
    }
  }

  handleLocationClick(locId) {
    if (!this.state.isMoving) return;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.error('No current player available for location click');
      return;
    }

    const currentLocIdx = LOCATIONS.findIndex(l => l.id === currentPlayer.location);
    const targetLocIdx = LOCATIONS.findIndex(l => l.id === locId);

    if (Math.abs(currentLocIdx - targetLocIdx) !== 1) {
      this.addLog("Too far! You can only move to adjacent locations.", "player", currentPlayer.id);
      return;
    }

    this.handleMove(locId);
    this.state.isMoving = false;
  }

  skipToEvening() {
    this.state.phase = 'evening';
    this.addLog(`${this.getCurrentPlayer().name} skipped the rest of the day.`, "player", this.getCurrentPlayer().id);
    // Logic triggered by useEffect
  }
}

// Phase management
export const getNextPhase = (currentPhase) => {
  if (currentPhase === 'morning') return 'afternoon';
  if (currentPhase === 'afternoon') return 'evening';
  return 'morning'; // evening -> morning (next turn)
};

export const shouldAutoAdvancePhase = (player, phase) => {
  // Spiritual realm players auto-advance through morning/afternoon
  return player.realm !== 'human' && phase !== 'evening';
};