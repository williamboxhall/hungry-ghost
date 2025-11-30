// Action Logic Module - Pure functions for action validation, effects, and execution
// This module contains no React or DOM dependencies

import {
  adjustPlayerMerit,
  adjustPlayerDana,
  adjustPlayerDelusion,
  adjustPlayerInsight,
  adjustPlayerLife,
  movePlayerAgePosition,
  addDanaToAgeTrack,
  addPlayerRole,
  setPlayerDana,
  canPlayerMeditate,
  canPlayerCollectAlms,
  isPlayerAtAgeLimit,
  canPlayerExtendLife,
  getPlayersAtLocation
} from './playerLogic.js';

import {
  getMeditationEffect,
  canMeditateAtLocation,
  canCollectAlmsAtLocation,
  canOrdinateAtLocation,
  canPerformSocialActionAtLocation
} from './locationLogic.js';

// Action types
export const ACTION_TYPES = {
  MOVE: 'move',
  MEDITATE: 'meditate',
  GOOD_DEED: 'goodDeed',
  BAD_DEED: 'badDeed',
  ALMS: 'alms',
  ORDINATE: 'ordinate',
  AGE: 'age',
  EXTEND_LIFE: 'extend',
  DIE: 'die',
  SKIP_PHASE: 'skip'
};

// Action validation functions
export const canTakeAction = (player, action, gameState) => {
  const { phase, isMoving, players } = gameState;

  switch (action) {
    case ACTION_TYPES.MOVE:
      return {
        allowed: phase !== 'evening' && player.realm === 'human',
        reason: phase === 'evening' ? 'Cannot move during evening' :
                player.realm !== 'human' ? 'Only human realm players can move' : null
      };

    case ACTION_TYPES.MEDITATE:
      if (phase === 'evening') return { allowed: false, reason: 'Cannot meditate during evening' };
      if (isMoving) return { allowed: false, reason: 'Cannot meditate while in move mode' };
      if (!canPlayerMeditate(player)) return { allowed: false, reason: 'Must be a meditator to meditate' };
      if (!canMeditateAtLocation(player.location)) return { allowed: false, reason: 'Cannot meditate at this location' };
      return { allowed: true };

    case ACTION_TYPES.GOOD_DEED:
      if (phase === 'evening') return { allowed: false, reason: 'Cannot perform good deeds during evening' };
      if (isMoving) return { allowed: false, reason: 'Cannot perform good deeds while in move mode' };
      if (player.dana < 1) return { allowed: false, reason: 'Need at least 1 dana to perform a good deed' };

      const hasInteractionTargets = player.location === 'town' ||
        getPlayersAtLocation(players, player.location).filter(p => p.id !== player.id).length > 0;
      if (!hasInteractionTargets) return { allowed: false, reason: 'Need to be in town or with other players' };

      return { allowed: true };

    case ACTION_TYPES.BAD_DEED:
      if (phase === 'evening') return { allowed: false, reason: 'Cannot perform bad deeds during evening' };
      if (isMoving) return { allowed: false, reason: 'Cannot perform bad deeds while in move mode' };
      if (player.dana >= 10) return { allowed: false, reason: 'Already have maximum dana' };

      const canSteal = player.location === 'town' ||
        getPlayersAtLocation(players, player.location).some(p => p.id !== player.id && p.dana > 0);
      if (!canSteal) return { allowed: false, reason: 'Nothing to steal here' };

      return { allowed: true };

    case ACTION_TYPES.ALMS:
      if (phase !== 'morning') return { allowed: false, reason: 'Can only collect alms in the morning' };
      if (isMoving) return { allowed: false, reason: 'Cannot collect alms while in move mode' };
      if (!canPlayerCollectAlms(player)) return { allowed: false, reason: 'Must be a monk to collect alms' };
      if (!canCollectAlmsAtLocation(player.location)) return { allowed: false, reason: 'Must be in town to collect alms' };
      return { allowed: true };

    case ACTION_TYPES.ORDINATE:
      if (!canOrdinateAtLocation(player.location)) return { allowed: false, reason: 'Must be in temple to ordinate' };
      if (player.isMonk) return { allowed: false, reason: 'Already a monk' };
      return { allowed: true };

    case ACTION_TYPES.AGE:
      if (phase !== 'evening') return { allowed: false, reason: 'Can only age during evening' };
      if (player.age >= 5) return { allowed: false, reason: 'Already at maximum age' };
      return { allowed: true };

    case ACTION_TYPES.EXTEND_LIFE:
      if (phase !== 'evening') return { allowed: false, reason: 'Can only extend life during evening' };
      if (!isPlayerAtAgeLimit(player)) return { allowed: false, reason: 'Can only extend life at age limit' };
      if (!canPlayerExtendLife(player)) return { allowed: false, reason: 'Need dana to extend life' };
      return { allowed: true };

    case ACTION_TYPES.DIE:
      if (phase !== 'evening') return { allowed: false, reason: 'Can only die during evening' };
      if (!isPlayerAtAgeLimit(player)) return { allowed: false, reason: 'Can only die at age limit' };
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Unknown action' };
  }
};

// Pure action effect functions
export const createAgeAction = (player) => {
  const newPosition = player.age + 1;

  // Check if there's a heart to collect
  if (newPosition <= 5 && player.age < newPosition) {
    return {
      player: {
        ...movePlayerAgePosition(player, newPosition),
        ...adjustPlayerLife(player, 1)
      },
      effects: [{
        type: 'heart_collected',
        position: newPosition,
        message: `Collected heart from position ${newPosition}`
      }]
    };
  } else {
    return {
      player: movePlayerAgePosition(player, newPosition),
      effects: [{
        type: 'aging',
        position: newPosition,
        message: `Aged to position ${newPosition}`
      }]
    };
  }
};

export const createExtendAction = (player) => {
  const currentPos = player.age;
  const newPosition = currentPos + 1;

  return {
    player: {
      ...adjustPlayerDana(player, -1),
      ...movePlayerAgePosition(player, newPosition),
      ...addDanaToAgeTrack(player, currentPos)
    },
    effects: [{
      type: 'life_extended',
      danaPosition: currentPos,
      newPosition: newPosition,
      message: `Paid dana to extend life from ${currentPos} to ${newPosition}`
    }]
  };
};

export const createMeditateAction = (player, location, playersAtLocation) => {
  const delusionDrop = getMeditationEffect(location.id, playersAtLocation);

  if (player.delusion > 0) {
    const newDelusion = Math.max(0, player.delusion - delusionDrop);
    return {
      player: adjustPlayerDelusion(player, -delusionDrop),
      effects: [{
        type: 'delusion_reduced',
        amount: delusionDrop,
        newDelusion: newDelusion,
        message: `Meditated for delusion -${delusionDrop}`
      }]
    };
  } else {
    return {
      player: adjustPlayerInsight(player, delusionDrop),
      effects: [{
        type: 'insight_gained',
        amount: delusionDrop,
        newInsight: player.insight + delusionDrop,
        message: `Meditated in clarity for insight +${delusionDrop}`
      }]
    };
  }
};

export const createGoodDeedAction = (player) => {
  return {
    player: {
      ...adjustPlayerDana(player, -1),
      ...adjustPlayerMerit(player, 1)
    },
    effects: [{
      type: 'good_deed',
      danaCost: 1,
      meritGain: 1,
      message: 'Performed a good deed for merit +1'
    }]
  };
};

export const createBadDeedAction = (player, victimsWithDana, townBonus) => {
  const totalStolen = victimsWithDana.length + townBonus;

  return {
    player: {
      ...adjustPlayerMerit(player, -totalStolen),
      ...adjustPlayerDana(player, totalStolen)
    },
    effects: [{
      type: 'bad_deed',
      danaGained: totalStolen,
      meritLost: totalStolen,
      victims: victimsWithDana.map(v => v.name),
      townBonus: townBonus > 0,
      message: `Performed bad deed for dana +${totalStolen}, merit -${totalStolen}`
    }]
  };
};

export const createAlmsAction = (player) => {
  return {
    player: adjustPlayerDana(player, 1),
    effects: [{
      type: 'alms_collected',
      danaGained: 1,
      message: 'Collected alms for dana +1'
    }]
  };
};

export const createOrdinationAction = (player) => {
  const danaLost = player.dana;

  return {
    player: {
      ...addPlayerRole(player, 'isMonk'),
      ...setPlayerDana(player, 0)
    },
    effects: [{
      type: 'ordination',
      danaLost: danaLost,
      message: `Ordained as monk (lost ${danaLost} dana)`
    }]
  };
};

// Action execution utilities
export const executeAction = (player, action, context = {}) => {
  const { players, location, gameState } = context;

  switch (action.type) {
    case ACTION_TYPES.AGE:
      return createAgeAction(player);

    case ACTION_TYPES.EXTEND_LIFE:
      return createExtendAction(player);

    case ACTION_TYPES.MEDITATE:
      const playersAtLocation = getPlayersAtLocation(players, player.location);
      return createMeditateAction(player, location, playersAtLocation);

    case ACTION_TYPES.GOOD_DEED:
      return createGoodDeedAction(player);

    case ACTION_TYPES.BAD_DEED:
      const victimsWithDana = getPlayersAtLocation(players, player.location)
        .filter(p => p.id !== player.id && p.dana > 0);
      const townBonus = player.location === 'town' ? 1 : 0;
      return createBadDeedAction(player, victimsWithDana, townBonus);

    case ACTION_TYPES.ALMS:
      return createAlmsAction(player);

    case ACTION_TYPES.ORDINATE:
      return createOrdinationAction(player);

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

// Action batching and validation
export const validateActionSequence = (actions, player, gameState) => {
  let currentPlayer = { ...player };
  let currentGameState = { ...gameState };
  const validations = [];

  for (const action of actions) {
    const validation = canTakeAction(currentPlayer, action.type, currentGameState);
    validations.push({
      action,
      validation,
      playerState: { ...currentPlayer }
    });

    if (validation.allowed) {
      // Simulate the action to update state for next validation
      const result = executeAction(currentPlayer, action, {
        players: currentGameState.players,
        gameState: currentGameState
      });
      currentPlayer = result.player;
    }
  }

  return {
    allValid: validations.every(v => v.validation.allowed),
    validations,
    finalPlayerState: currentPlayer
  };
};

// Action suggestions
export const getAvailableActions = (player, gameState) => {
  const actions = [];

  for (const actionType of Object.values(ACTION_TYPES)) {
    const validation = canTakeAction(player, actionType, gameState);
    if (validation.allowed) {
      actions.push({
        type: actionType,
        name: getActionName(actionType),
        description: getActionDescription(actionType),
        validation
      });
    }
  }

  return actions;
};

export const getActionName = (actionType) => {
  const names = {
    [ACTION_TYPES.MOVE]: 'Move',
    [ACTION_TYPES.MEDITATE]: 'Meditate',
    [ACTION_TYPES.GOOD_DEED]: 'Good Deed',
    [ACTION_TYPES.BAD_DEED]: 'Bad Deed',
    [ACTION_TYPES.ALMS]: 'Collect Alms',
    [ACTION_TYPES.ORDINATE]: 'Ordinate as Monk',
    [ACTION_TYPES.AGE]: 'Age Normally',
    [ACTION_TYPES.EXTEND_LIFE]: 'Extend Life',
    [ACTION_TYPES.DIE]: 'Die',
    [ACTION_TYPES.SKIP_PHASE]: 'Skip Phase'
  };

  return names[actionType] || actionType;
};

export const getActionDescription = (actionType) => {
  const descriptions = {
    [ACTION_TYPES.MOVE]: 'Travel to an adjacent location',
    [ACTION_TYPES.MEDITATE]: 'Reduce delusion or gain insight through meditation',
    [ACTION_TYPES.GOOD_DEED]: 'Spend dana to gain merit by helping others',
    [ACTION_TYPES.BAD_DEED]: 'Steal dana from others, losing merit',
    [ACTION_TYPES.ALMS]: 'Collect dana as a monk in town',
    [ACTION_TYPES.ORDINATE]: 'Become a monk and lose all dana',
    [ACTION_TYPES.AGE]: 'Move along the age track and collect hearts',
    [ACTION_TYPES.EXTEND_LIFE]: 'Spend dana to continue living past age limit',
    [ACTION_TYPES.DIE]: 'End current life and proceed to reincarnation',
    [ACTION_TYPES.SKIP_PHASE]: 'Pass turn without taking an action'
  };

  return descriptions[actionType] || 'Unknown action';
};

// Action history and logging
export const createActionRecord = (player, action, result, timestamp = Date.now()) => {
  return {
    playerId: player.id,
    playerName: player.name,
    action: action.type,
    actionData: action,
    beforeState: {
      merit: player.merit,
      dana: player.dana,
      delusion: player.delusion,
      insight: player.insight,
      life: player.life,
      location: player.location,
      age: player.age
    },
    afterState: result.player ? {
      merit: result.player.merit,
      dana: result.player.dana,
      delusion: result.player.delusion,
      insight: result.player.insight,
      life: result.player.life,
      location: result.player.location,
      age: result.player.age
    } : null,
    effects: result.effects || [],
    timestamp
  };
};