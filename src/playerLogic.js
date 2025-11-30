// Player Logic Module - Pure functions for player state management
// This module contains no React or DOM dependencies

// Constants
export const MAX_MERIT = 5;
export const MIN_MERIT = -5;
export const INITIAL_DELUSION = 30;
export const WINNING_INSIGHT = 7;
export const INITIAL_LIFE = 5;

// Player factory function
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
  agePosition: 0,
  placedDana: []
});

// Player state queries
export const isPlayerInRealm = (player, realm) => player.realm === realm;

export const canPlayerMeditate = (player) => player.isMeditator;

export const canPlayerCollectAlms = (player) => player.isMonk;

export const hasPlayerReachedEnlightenment = (player) =>
  player.insight >= WINNING_INSIGHT;

export const getPlayerMeritDirection = (player) => {
  if (player.merit > 0) return 'positive';
  if (player.merit < 0) return 'negative';
  return 'neutral';
};

export const isPlayerAtAgeLimit = (player) => player.agePosition >= 5;

export const canPlayerExtendLife = (player) =>
  player.agePosition >= 5 && player.dana > 0;

// Player state transformations
export const updatePlayerRealm = (player, newRealm) => ({
  ...player,
  realm: newRealm
});

export const updatePlayerLocation = (player, newLocation) => ({
  ...player,
  location: newLocation
});

export const addPlayerRole = (player, role) => ({
  ...player,
  [role]: true
});

export const removePlayerRole = (player, role) => ({
  ...player,
  [role]: false
});

export const updatePlayerStats = (player, stats) => ({
  ...player,
  ...stats
});

export const incrementPlayerDay = (player) => ({
  ...player,
  dayCount: player.dayCount + 1
});

export const incrementPlayerLife = (player) => ({
  ...player,
  lifeCount: player.lifeCount + 1
});

// Age track operations
export const movePlayerAgePosition = (player, newPosition) => ({
  ...player,
  agePosition: newPosition
});

export const addDanaToAgeTrack = (player, position) => ({
  ...player,
  placedDana: [...(player.placedDana || []), position]
});

export const clearPlayerAgeTrack = (player) => ({
  ...player,
  agePosition: -1,
  placedDana: []
});

// Merit operations (with bounds checking)
export const adjustPlayerMerit = (player, adjustment) => ({
  ...player,
  merit: Math.max(MIN_MERIT, Math.min(MAX_MERIT, player.merit + adjustment))
});

export const setPlayerMerit = (player, merit) => ({
  ...player,
  merit: Math.max(MIN_MERIT, Math.min(MAX_MERIT, merit))
});

// Dana operations
export const adjustPlayerDana = (player, adjustment) => ({
  ...player,
  dana: Math.max(0, player.dana + adjustment)
});

export const setPlayerDana = (player, dana) => ({
  ...player,
  dana: Math.max(0, dana)
});

// Delusion operations
export const adjustPlayerDelusion = (player, adjustment) => ({
  ...player,
  delusion: Math.max(0, player.delusion + adjustment)
});

export const clearPlayerDelusion = (player) => ({
  ...player,
  delusion: 0
});

// Insight operations
export const adjustPlayerInsight = (player, adjustment) => ({
  ...player,
  insight: Math.max(0, player.insight + adjustment)
});

export const clearPlayerInsight = (player) => ({
  ...player,
  insight: 0
});

// Life operations
export const adjustPlayerLife = (player, adjustment) => ({
  ...player,
  life: Math.max(0, player.life + adjustment)
});

export const setPlayerLife = (player, life) => ({
  ...player,
  life: Math.max(0, life)
});

// Complex player transformations
export const createPlayerReincarnation = (player, realmData) => {
  const { nextRealm, nextRole, startingLife } = realmData;

  // Teachers are automatically meditators
  if (nextRole.isTeacher) {
    nextRole.isMeditator = true;
  }

  // Preserve merit only from non-human realms
  let newMerit = player.merit;
  if (player.realm !== 'human') {
    newMerit = 0;
  }

  return {
    ...player,
    realm: nextRealm,
    life: startingLife,
    dana: 0,
    insight: 0,
    location: 'town',
    dayCount: 1,
    lifeCount: player.lifeCount + 1,
    isMonk: nextRole.isMonk || false,
    isTeacher: nextRole.isTeacher || false,
    isGreedy: nextRole.isGreedy || false,
    isMeditator: nextRole.isMeditator || false,
    merit: newMerit,
    agePosition: -1, // Start before position 0
    placedDana: []
  };
};

export const createBodhisattvaReincarnation = (player) => ({
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
  merit: player.merit, // Keep current Merit
  agePosition: -1,
  placedDana: []
});

// Player collection utilities
export const findPlayerById = (players, playerId) =>
  players.find(p => p.id === playerId);

export const updatePlayerInArray = (players, playerId, updates) =>
  players.map(p => p.id === playerId ? { ...p, ...updates } : p);

export const replacePlayerInArray = (players, playerId, newPlayer) =>
  players.map(p => p.id === playerId ? newPlayer : p);

export const getPlayersInRealm = (players, realm) =>
  players.filter(p => p.realm === realm);

export const getPlayersWithRole = (players, role) =>
  players.filter(p => p[role] === true);

export const getPlayersAtLocation = (players, location, realm = 'human') =>
  players.filter(p => p.location === location && p.realm === realm);

// Player comparison utilities
export const comparePlayersByMerit = (a, b) => b.merit - a.merit;

export const comparePlayersByInsight = (a, b) => b.insight - a.insight;

export const comparePlayersByDayCount = (a, b) => a.dayCount - b.dayCount;

// Player validation
export const isValidPlayer = (player) => {
  return (
    typeof player === 'object' &&
    typeof player.id === 'number' &&
    typeof player.name === 'string' &&
    typeof player.color === 'string' &&
    typeof player.location === 'string' &&
    typeof player.realm === 'string' &&
    typeof player.merit === 'number' &&
    typeof player.dana === 'number' &&
    typeof player.delusion === 'number' &&
    typeof player.insight === 'number' &&
    player.merit >= MIN_MERIT &&
    player.merit <= MAX_MERIT &&
    player.dana >= 0 &&
    player.delusion >= 0 &&
    player.insight >= 0
  );
};