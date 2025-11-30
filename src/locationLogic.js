// Location Logic Module - Pure functions for location and movement mechanics
// This module contains no React or DOM dependencies

import {
  MAX_MERIT,
  MIN_MERIT,
  getPlayersAtLocation,
  updatePlayerLocation,
  adjustPlayerMerit,
  adjustPlayerDana,
  addPlayerRole
} from './playerLogic.js';

// Location definitions
export const LOCATIONS = [
  { id: 'cave', name: 'Cave', capacity: 1, type: 'meditation' },
  { id: 'forest', name: 'Forest', capacity: 2, type: 'meditation' },
  { id: 'town', name: 'Town', capacity: 99, type: 'social' },
  { id: 'temple', name: 'Temple', capacity: 99, type: 'mixed' }
];

// Location queries
export const getLocationById = (locationId) =>
  LOCATIONS.find(loc => loc.id === locationId);

export const getLocationIndex = (locationId) =>
  LOCATIONS.findIndex(loc => loc.id === locationId);

export const getAdjacentLocations = (locationId) => {
  const currentIndex = getLocationIndex(locationId);
  if (currentIndex === -1) return [];

  const adjacent = [];
  if (currentIndex > 0) {
    adjacent.push(LOCATIONS[currentIndex - 1]);
  }
  if (currentIndex < LOCATIONS.length - 1) {
    adjacent.push(LOCATIONS[currentIndex + 1]);
  }
  return adjacent;
};

export const areLocationsAdjacent = (loc1Id, loc2Id) => {
  const index1 = getLocationIndex(loc1Id);
  const index2 = getLocationIndex(loc2Id);
  return Math.abs(index1 - index2) === 1;
};

export const getLocationCapacity = (locationId) => {
  const location = getLocationById(locationId);
  return location ? location.capacity : 0;
};

export const isLocationAtCapacity = (players, locationId) => {
  const playersAtLocation = getPlayersAtLocation(players, locationId);
  const capacity = getLocationCapacity(locationId);
  return playersAtLocation.length >= capacity;
};

// Movement validation
export const canMoveToLocation = (currentLocationId, targetLocationId) => {
  return areLocationsAdjacent(currentLocationId, targetLocationId);
};

export const canPlayerMoveToLocation = (player, targetLocationId, allPlayers) => {
  // Check if move is to adjacent location
  if (!canMoveToLocation(player.location, targetLocationId)) {
    return { canMove: false, reason: 'Too far! You can only move to adjacent locations.' };
  }

  // Check location capacity
  if (isLocationAtCapacity(allPlayers, targetLocationId)) {
    const location = getLocationById(targetLocationId);
    return { canMove: false, reason: `${location.name} is at capacity (${location.capacity} players).` };
  }

  return { canMove: true };
};

// Movement effects
export const createMoveAction = (player, targetLocationId) => {
  let updatedPlayer = updatePlayerLocation(player, targetLocationId);

  // Greedy logic - steal dana when entering town
  if (player.isGreedy && targetLocationId === 'town') {
    updatedPlayer = adjustPlayerMerit(updatedPlayer, -1);
    updatedPlayer = adjustPlayerDana(updatedPlayer, 1);
  }

  return updatedPlayer;
};

// Location interaction effects
export const applyLocationInteractions = (players, arrivingPlayer, targetLocationId) => {
  const playersAtTarget = getPlayersAtLocation(players, targetLocationId)
    .filter(p => p.id !== arrivingPlayer.id);

  let updatedPlayers = [...players];
  let updatedArrivingPlayer = { ...arrivingPlayer };
  const interactions = [];

  // Teachers teach arriving player
  const teachers = playersAtTarget.filter(p => p.isTeacher);
  if (teachers.length > 0 && !updatedArrivingPlayer.isMeditator) {
    updatedArrivingPlayer = addPlayerRole(updatedArrivingPlayer, 'isMeditator');

    interactions.push({
      type: 'teaching',
      teacher: teachers[0],
      student: updatedArrivingPlayer,
      message: `${updatedArrivingPlayer.name} learned meditation from ${teachers[0].name}`
    });

    // Teachers gain merit
    updatedPlayers = updatedPlayers.map(p => {
      if (teachers.some(t => t.id === p.id)) {
        return adjustPlayerMerit(p, 1);
      }
      return p;
    });
  }

  // Greedy players steal from arriving player
  const greedyPlayers = playersAtTarget.filter(p => p.isGreedy);
  greedyPlayers.forEach(greedy => {
    if (updatedArrivingPlayer.dana > 0) {
      updatedArrivingPlayer = adjustPlayerDana(updatedArrivingPlayer, -1);

      interactions.push({
        type: 'theft',
        thief: greedy,
        victim: updatedArrivingPlayer,
        message: `${greedy.name} stole Dana from ${updatedArrivingPlayer.name}`
      });

      // Update greedy player
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === greedy.id) {
          return {
            ...adjustPlayerDana(p, 1),
            ...adjustPlayerMerit(p, -1)
          };
        }
        return p;
      });
    }
  });

  // Update the arriving player in the array
  updatedPlayers = updatedPlayers.map(p =>
    p.id === arrivingPlayer.id ? updatedArrivingPlayer : p
  );

  return {
    players: updatedPlayers,
    interactions
  };
};

// Meditation location effects
export const getMeditationEffect = (locationId, playersAtLocation) => {
  switch (locationId) {
    case 'temple':
      // Base 1 + 1 per additional player present
      return 1 + Math.max(0, playersAtLocation.length - 1);
    case 'forest':
      return 1;
    case 'cave':
      return 2;
    default:
      return 0;
  }
};

export const canMeditateAtLocation = (locationId) => {
  const location = getLocationById(locationId);
  return location && (location.type === 'meditation' || location.type === 'mixed');
};

// Social interaction locations
export const canPerformSocialActionAtLocation = (locationId) => {
  const location = getLocationById(locationId);
  return location && (location.type === 'social' || location.type === 'mixed');
};

export const canCollectAlmsAtLocation = (locationId) => {
  return locationId === 'town';
};

export const canOrdinateAtLocation = (locationId) => {
  return locationId === 'temple';
};

// Location state utilities
export const getLocationOccupancy = (players, locationId) => {
  const playersAtLocation = getPlayersAtLocation(players, locationId);
  const capacity = getLocationCapacity(locationId);

  return {
    current: playersAtLocation.length,
    capacity,
    isFull: playersAtLocation.length >= capacity,
    players: playersAtLocation
  };
};

export const getLocationsByType = (type) =>
  LOCATIONS.filter(loc => loc.type === type);

export const getAllLocationOccupancies = (players) => {
  return LOCATIONS.reduce((acc, location) => {
    acc[location.id] = getLocationOccupancy(players, location.id);
    return acc;
  }, {});
};

// Special location rules
export const isTempleOrdinationRequired = (player, locationId) => {
  return locationId === 'temple' && player.realm === 'human' && !player.isMonk;
};

export const getLocationDescription = (locationId) => {
  const location = getLocationById(locationId);
  if (!location) return 'Unknown location';

  const descriptions = {
    cave: 'Solitary meditation cave with high spiritual efficiency',
    forest: 'Natural meditation spot for peaceful contemplation',
    town: 'Social hub for alms collection and community deeds',
    temple: 'Sacred space for group meditation and ordination'
  };

  return descriptions[locationId] || location.name;
};

export const getLocationConstraints = (locationId) => {
  const location = getLocationById(locationId);
  if (!location) return {};

  return {
    capacity: location.capacity,
    requiresOrdination: locationId === 'temple',
    allowsMeditation: canMeditateAtLocation(locationId),
    allowsSocialActions: canPerformSocialActionAtLocation(locationId),
    allowsAlms: canCollectAlmsAtLocation(locationId)
  };
};