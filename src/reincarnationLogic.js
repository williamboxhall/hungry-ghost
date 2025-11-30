// Reincarnation Logic Module - Pure functions for death, karma evaluation, and rebirth mechanics
// This module contains no React or DOM dependencies

import {
  WINNING_INSIGHT,
  INITIAL_LIFE,
  getPlayerMeritDirection,
  hasPlayerReachedEnlightenment,
  createPlayerReincarnation,
  createBodhisattvaReincarnation
} from './playerLogic.js';

// Karma evaluation for reincarnation destination
export const evaluateKarma = (merit) => {
  if (merit > 0) return 'heaven';
  if (merit < 0) return 'hell';
  return 'human';
};

// Determine starting life in spiritual realms
export const calculateSpiritualRealmLife = (merit, realm) => {
  if (realm === 'heaven') return merit; // Positive merit becomes life
  if (realm === 'hell') return Math.abs(merit); // Absolute merit becomes life
  return INITIAL_LIFE; // Human realm gets default life
};

// Determine roles gained from reincarnation
export const determineReincarnationRoles = (fromRealm, toRealm) => {
  const roles = {
    isTeacher: false,
    isGreedy: false,
    isMonk: false,
    isMeditator: false
  };

  if (fromRealm === 'heaven' && toRealm === 'human') {
    roles.isTeacher = true;
    roles.isMeditator = true; // Teachers are automatically meditators
  } else if (fromRealm === 'hell' && toRealm === 'human') {
    roles.isGreedy = true;
  }

  return roles;
};

// Check if player should reincarnate from spiritual realm
export const shouldReincarnateFromSpiritualRealm = (player) => {
  if (player.realm === 'human') return false;

  // Spiritual realm players reincarnate when merit or life reaches 0
  return player.merit === 0 || player.life <= 0;
};

// Check death conditions for human realm
export const checkHumanRealmDeath = (player) => {
  // Human players die when they reach age limit and choose to die or can't extend
  if (player.age >= 5) {
    return {
      canDie: true,
      mustDie: player.dana === 0, // Must die if no dana to extend
      canExtend: player.dana > 0,
      canAchieveNirvana: hasPlayerReachedEnlightenment(player)
    };
  }

  return {
    canDie: false,
    mustDie: false,
    canExtend: false,
    canAchieveNirvana: false
  };
};

// Prepare reincarnation data
export const prepareReincarnation = (player) => {
  // Check for victory condition first
  if (hasPlayerReachedEnlightenment(player)) {
    return {
      type: 'victory',
      player,
      message: 'Enlightenment achieved! You may choose Nirvana or the Bodhisattva path.'
    };
  }

  const nextRealm = evaluateKarma(player.merit);
  const nextRole = determineReincarnationRoles(player.realm, nextRealm);
  const startingLife = calculateSpiritualRealmLife(player.merit, nextRealm);

  return {
    type: 'reincarnate',
    player,
    nextRealm,
    nextRole,
    startingLife,
    message: `You will be reborn in the ${nextRealm} realm.`
  };
};

// Execute reincarnation transformation
export const executeReincarnation = (player, reincarnationData) => {
  if (reincarnationData.type === 'victory') {
    return player; // Victory doesn't change player state until choice is made
  }

  const { nextRealm, nextRole, startingLife } = reincarnationData;

  return createPlayerReincarnation(player, {
    nextRealm,
    nextRole,
    startingLife
  });
};

// Execute Bodhisattva choice
export const executeBodhisattvaChoice = (player) => {
  return createBodhisattvaReincarnation(player);
};

// Spiritual realm evening effects
export const applySpiritualRealmEffects = (player) => {
  if (player.realm === 'heaven') {
    return {
      ...player,
      delusion: Math.max(0, player.delusion - 1),
      merit: Math.max(0, player.merit - 1),
      life: Math.max(0, player.merit - 1) // Life follows merit in heaven
    };
  } else if (player.realm === 'hell') {
    const newMerit = Math.min(0, player.merit + 1);
    return {
      ...player,
      delusion: player.delusion + 1,
      merit: newMerit,
      life: Math.abs(newMerit) // Life follows absolute merit in hell
    };
  }

  return player; // No changes for human realm
};

// Death triggers and conditions
export const getDeathTriggers = (player) => {
  const triggers = [];

  if (player.realm === 'human') {
    const deathCheck = checkHumanRealmDeath(player);
    if (deathCheck.canDie) {
      triggers.push({
        type: 'aging',
        condition: 'Age limit reached',
        required: deathCheck.mustDie,
        alternatives: deathCheck.canExtend ? ['extend_life'] : []
      });
    }
  } else {
    if (shouldReincarnateFromSpiritualRealm(player)) {
      triggers.push({
        type: 'spiritual_completion',
        condition: `${player.realm} existence completed`,
        required: true,
        alternatives: []
      });
    }
  }

  return triggers;
};

// Victory conditions
export const checkVictoryConditions = (player) => {
  const conditions = [];

  if (hasPlayerReachedEnlightenment(player)) {
    const deathCheck = checkHumanRealmDeath(player);

    if (deathCheck.canDie) {
      conditions.push({
        type: 'nirvana',
        condition: 'Achieved 7 insight and can choose death',
        description: 'Enter Nirvana and win the game immediately'
      });

      conditions.push({
        type: 'bodhisattva',
        condition: 'Achieved 7 insight and can choose death',
        description: 'Return as a Teacher to help others achieve enlightenment'
      });
    }
  }

  return conditions;
};

// Reincarnation history tracking
export const createReincarnationRecord = (player, reincarnationData, choice = null) => {
  return {
    playerId: player.id,
    fromRealm: player.realm,
    toRealm: reincarnationData.nextRealm || null,
    merit: player.merit,
    insight: player.insight,
    lifeNumber: player.lifeCount,
    choice: choice, // 'natural', 'nirvana', 'bodhisattva'
    timestamp: Date.now()
  };
};

// Karma calculation utilities
export const calculateKarmaBalance = (merit, delusion, insight) => {
  return {
    merit,
    delusion,
    insight,
    netKarma: merit - (delusion / 10) + insight,
    dominantForce: getDominantKarmaForce(merit, delusion, insight)
  };
};

export const getDominantKarmaForce = (merit, delusion, insight) => {
  if (insight >= WINNING_INSIGHT) return 'enlightenment';
  if (delusion > 20) return 'delusion';
  if (merit > 2) return 'positive_merit';
  if (merit < -2) return 'negative_merit';
  return 'balanced';
};

// Realm-specific utilities
export const getRealmDescription = (realm) => {
  const descriptions = {
    human: 'The realm of choice and opportunity, where karma is created through actions',
    heaven: 'A realm of bliss where positive karma is slowly consumed',
    hell: 'A realm of suffering where negative karma is slowly purified'
  };

  return descriptions[realm] || 'Unknown realm';
};

export const getRealmTransitionMessage = (fromRealm, toRealm, merit) => {
  if (fromRealm === toRealm) {
    return `Reborn in the same ${toRealm} realm`;
  }

  if (toRealm === 'heaven') {
    return `Your positive merit (${merit}) has earned you a place in Heaven`;
  }

  if (toRealm === 'hell') {
    return `Your negative merit (${merit}) has led you to Hell for purification`;
  }

  if (toRealm === 'human') {
    return `Your balanced karma returns you to the Human realm for another chance`;
  }

  return `Transitioning from ${fromRealm} to ${toRealm}`;
};

// Advanced reincarnation logic
export const calculateReincarnationOutcomes = (players) => {
  return players.map(player => {
    const reincarnationData = prepareReincarnation(player);
    const victoryConditions = checkVictoryConditions(player);
    const deathTriggers = getDeathTriggers(player);

    return {
      player,
      reincarnationData,
      victoryConditions,
      deathTriggers,
      karmaBalance: calculateKarmaBalance(player.merit, player.delusion, player.insight)
    };
  });
};