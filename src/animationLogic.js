// Animation Logic Module - Pure functions for animation state management
// This module contains no React or DOM dependencies

// Animation types
export const ANIMATION_TYPES = {
  REMOVE_HEART: 'removeHeart',
  REMOVE_COIN: 'removeCoin',
  GAIN_DANA: 'gainDana',
  LOSE_DANA: 'loseDana',
  MERIT_CHANGE: 'meritChange',
  DELUSION_CHANGE: 'delusionChange',
  INSIGHT_CHANGE: 'insightChange',
  PLAYER_MOVE: 'playerMove',
  REALM_TRANSITION: 'realmTransition',
  FADE_IN: 'fadeIn',
  FADE_OUT: 'fadeOut'
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  [ANIMATION_TYPES.REMOVE_HEART]: 500,
  [ANIMATION_TYPES.REMOVE_COIN]: 500,
  [ANIMATION_TYPES.GAIN_DANA]: 600,
  [ANIMATION_TYPES.LOSE_DANA]: 400,
  [ANIMATION_TYPES.MERIT_CHANGE]: 800,
  [ANIMATION_TYPES.DELUSION_CHANGE]: 600,
  [ANIMATION_TYPES.INSIGHT_CHANGE]: 1000,
  [ANIMATION_TYPES.PLAYER_MOVE]: 300,
  [ANIMATION_TYPES.REALM_TRANSITION]: 1200,
  [ANIMATION_TYPES.FADE_IN]: 300,
  [ANIMATION_TYPES.FADE_OUT]: 200
};

// Animation state factory
export const createAnimationState = () => ({
  activeAnimations: {},
  animationQueue: [],
  isAnimating: false
});

// Animation creation functions
export const createRemoveHeartAnimation = (playerId, position) => ({
  id: `${playerId}_removeHeart_${position}`,
  type: ANIMATION_TYPES.REMOVE_HEART,
  playerId,
  position,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.REMOVE_HEART],
  startTime: Date.now()
});

export const createRemoveCoinAnimation = (playerId, coinIndex) => ({
  id: `${playerId}_removeCoin_${coinIndex}`,
  type: ANIMATION_TYPES.REMOVE_COIN,
  playerId,
  coinIndex,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.REMOVE_COIN],
  startTime: Date.now()
});

export const createGainDanaAnimation = (playerId, amount = 1) => ({
  id: `${playerId}_gainDana`,
  type: ANIMATION_TYPES.GAIN_DANA,
  playerId,
  amount,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.GAIN_DANA],
  startTime: Date.now()
});

export const createLoseDanaAnimation = (playerId, amount = 1) => ({
  id: `${playerId}_loseDana`,
  type: ANIMATION_TYPES.LOSE_DANA,
  playerId,
  amount,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.LOSE_DANA],
  startTime: Date.now()
});

export const createMeritChangeAnimation = (playerId, oldValue, newValue) => ({
  id: `${playerId}_meritChange`,
  type: ANIMATION_TYPES.MERIT_CHANGE,
  playerId,
  oldValue,
  newValue,
  delta: newValue - oldValue,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.MERIT_CHANGE],
  startTime: Date.now()
});

export const createDelusionChangeAnimation = (playerId, oldValue, newValue) => ({
  id: `${playerId}_delusionChange`,
  type: ANIMATION_TYPES.DELUSION_CHANGE,
  playerId,
  oldValue,
  newValue,
  delta: newValue - oldValue,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.DELUSION_CHANGE],
  startTime: Date.now()
});

export const createInsightChangeAnimation = (playerId, oldValue, newValue) => ({
  id: `${playerId}_insightChange`,
  type: ANIMATION_TYPES.INSIGHT_CHANGE,
  playerId,
  oldValue,
  newValue,
  delta: newValue - oldValue,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.INSIGHT_CHANGE],
  startTime: Date.now()
});

export const createPlayerMoveAnimation = (playerId, fromLocation, toLocation) => ({
  id: `${playerId}_move`,
  type: ANIMATION_TYPES.PLAYER_MOVE,
  playerId,
  fromLocation,
  toLocation,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.PLAYER_MOVE],
  startTime: Date.now()
});

export const createRealmTransitionAnimation = (playerId, fromRealm, toRealm) => ({
  id: `${playerId}_realmTransition`,
  type: ANIMATION_TYPES.REALM_TRANSITION,
  playerId,
  fromRealm,
  toRealm,
  duration: ANIMATION_DURATIONS[ANIMATION_TYPES.REALM_TRANSITION],
  startTime: Date.now()
});

// Animation state management
export const addAnimation = (animationState, animation) => ({
  ...animationState,
  activeAnimations: {
    ...animationState.activeAnimations,
    [animation.id]: animation
  },
  isAnimating: true
});

export const removeAnimation = (animationState, animationId) => {
  const { [animationId]: removed, ...remainingAnimations } = animationState.activeAnimations;

  return {
    ...animationState,
    activeAnimations: remainingAnimations,
    isAnimating: Object.keys(remainingAnimations).length > 0
  };
};

export const clearAllAnimations = (animationState) => ({
  ...animationState,
  activeAnimations: {},
  animationQueue: [],
  isAnimating: false
});

export const clearPlayerAnimations = (animationState, playerId) => {
  const filteredAnimations = Object.keys(animationState.activeAnimations)
    .filter(id => !id.startsWith(`${playerId}_`))
    .reduce((acc, id) => {
      acc[id] = animationState.activeAnimations[id];
      return acc;
    }, {});

  return {
    ...animationState,
    activeAnimations: filteredAnimations,
    isAnimating: Object.keys(filteredAnimations).length > 0
  };
};

// Animation queuing
export const queueAnimation = (animationState, animation) => ({
  ...animationState,
  animationQueue: [...animationState.animationQueue, animation]
});

export const processAnimationQueue = (animationState) => {
  if (animationState.animationQueue.length === 0) {
    return animationState;
  }

  const [nextAnimation, ...remainingQueue] = animationState.animationQueue;

  return {
    ...addAnimation(animationState, nextAnimation),
    animationQueue: remainingQueue
  };
};

// Animation expiry checking
export const getExpiredAnimations = (animationState, currentTime = Date.now()) => {
  return Object.entries(animationState.activeAnimations)
    .filter(([id, animation]) => {
      return currentTime >= animation.startTime + animation.duration;
    })
    .map(([id, animation]) => ({ id, animation }));
};

export const removeExpiredAnimations = (animationState, currentTime = Date.now()) => {
  const expiredAnimations = getExpiredAnimations(animationState, currentTime);

  let newAnimationState = animationState;
  expiredAnimations.forEach(({ id }) => {
    newAnimationState = removeAnimation(newAnimationState, id);
  });

  return {
    animationState: newAnimationState,
    expiredAnimations: expiredAnimations.map(({ animation }) => animation)
  };
};

// Animation detection from game state changes
export const detectAnimationsFromStateChange = (beforeState, afterState) => {
  const animations = [];

  // Compare each player's state
  beforeState.players.forEach(beforePlayer => {
    const afterPlayer = afterState.players.find(p => p.id === beforePlayer.id);
    if (!afterPlayer) return;

    // Dana changes
    if (beforePlayer.dana !== afterPlayer.dana) {
      if (afterPlayer.dana > beforePlayer.dana) {
        animations.push(createGainDanaAnimation(beforePlayer.id, afterPlayer.dana - beforePlayer.dana));
      } else {
        animations.push(createLoseDanaAnimation(beforePlayer.id, beforePlayer.dana - afterPlayer.dana));
      }
    }

    // Merit changes
    if (beforePlayer.merit !== afterPlayer.merit) {
      animations.push(createMeritChangeAnimation(beforePlayer.id, beforePlayer.merit, afterPlayer.merit));
    }

    // Delusion changes
    if (beforePlayer.delusion !== afterPlayer.delusion) {
      animations.push(createDelusionChangeAnimation(beforePlayer.id, beforePlayer.delusion, afterPlayer.delusion));
    }

    // Insight changes
    if (beforePlayer.insight !== afterPlayer.insight) {
      animations.push(createInsightChangeAnimation(beforePlayer.id, beforePlayer.insight, afterPlayer.insight));
    }

    // Location changes
    if (beforePlayer.location !== afterPlayer.location) {
      animations.push(createPlayerMoveAnimation(beforePlayer.id, beforePlayer.location, afterPlayer.location));
    }

    // Realm changes
    if (beforePlayer.realm !== afterPlayer.realm) {
      animations.push(createRealmTransitionAnimation(beforePlayer.id, beforePlayer.realm, afterPlayer.realm));
    }

    // Age position changes with heart collection
    if (beforePlayer.agePosition !== afterPlayer.agePosition && afterPlayer.life > beforePlayer.life) {
      animations.push(createRemoveHeartAnimation(beforePlayer.id, afterPlayer.agePosition));
    }

    // Dana placement on age track
    if (beforePlayer.agePosition !== afterPlayer.agePosition && afterPlayer.dana < beforePlayer.dana) {
      animations.push(createRemoveCoinAnimation(beforePlayer.id, beforePlayer.dana - 1));
    }
  });

  return animations;
};

// Animation utilities
export const isAnimationActive = (animationState, animationId) => {
  return animationState.activeAnimations.hasOwnProperty(animationId);
};

export const getActiveAnimationsForPlayer = (animationState, playerId) => {
  return Object.entries(animationState.activeAnimations)
    .filter(([id, animation]) => animation.playerId === playerId)
    .map(([id, animation]) => ({ id, ...animation }));
};

export const getAnimationProgress = (animation, currentTime = Date.now()) => {
  const elapsed = currentTime - animation.startTime;
  return Math.min(1, elapsed / animation.duration);
};

export const isAnimationComplete = (animation, currentTime = Date.now()) => {
  return getAnimationProgress(animation, currentTime) >= 1;
};

// Animation conflict resolution
export const hasConflictingAnimation = (animationState, newAnimation) => {
  return Object.values(animationState.activeAnimations).some(existingAnimation => {
    return existingAnimation.playerId === newAnimation.playerId &&
           existingAnimation.type === newAnimation.type;
  });
};

export const resolveAnimationConflict = (animationState, newAnimation) => {
  const conflictingAnimations = Object.entries(animationState.activeAnimations)
    .filter(([id, animation]) => {
      return animation.playerId === newAnimation.playerId &&
             animation.type === newAnimation.type;
    });

  let resolvedState = animationState;

  // Remove conflicting animations
  conflictingAnimations.forEach(([id, animation]) => {
    resolvedState = removeAnimation(resolvedState, id);
  });

  // Add the new animation
  return addAnimation(resolvedState, newAnimation);
};

// Convert animations to React-compatible format
export const getReactAnimationState = (animationState) => {
  const reactAnimations = {};

  Object.values(animationState.activeAnimations).forEach(animation => {
    const key = `${animation.playerId}_${animation.type}`;

    switch (animation.type) {
      case ANIMATION_TYPES.REMOVE_HEART:
        reactAnimations[`${animation.playerId}_removingHeart`] = animation.position;
        break;
      case ANIMATION_TYPES.REMOVE_COIN:
        reactAnimations[`${animation.playerId}_removingCoin`] = animation.coinIndex;
        break;
      case ANIMATION_TYPES.GAIN_DANA:
        reactAnimations[`${animation.playerId}_gainingDana`] = true;
        break;
      case ANIMATION_TYPES.LOSE_DANA:
        reactAnimations[`${animation.playerId}_losingDana`] = true;
        break;
      default:
        reactAnimations[key] = true;
    }
  });

  return reactAnimations;
};