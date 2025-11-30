import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Move, Trophy, Cloud, Heart } from 'lucide-react';

// Import game logic (no React dependencies)
import { GameController, LOCATIONS } from './gameLogic.js';

// Import rendering components
import {
  YinYang,
  DanaCoin,
  Meeple,
  PlayerCard,
  LocationCard,
  ActionButton,
  getPlayerLogColor,
  getBorderColor,
  getActionPanelStyle,
  getActionHeaderStyle,
  getPhaseIcon
} from './gameRenderer.jsx';

const HungryGhostGame = () => {
  // Initialize game controller
  const [gameController] = useState(() => new GameController());
  const [gameState, setGameState] = useState(gameController.getState());
  const [previousGameState, setPreviousGameState] = useState(null);
  const [animations, setAnimations] = useState({});

  const logContainerRef = useRef(null);

  // Helper to update React state from game controller
  const syncGameState = () => {
    setPreviousGameState(gameState);
    setGameState(gameController.getState());
  };

  // Auto-scroll log container when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameState.logs]);

  // Auto-advance spiritual realm players to evening instantly
  useEffect(() => {
    const currentPlayer = gameController.getCurrentPlayer();
    if (currentPlayer.realm !== 'human' && gameState.phase !== 'evening') {
      if (gameState.phase === 'morning') {
        gameController.advancePhase();
        syncGameState();
      } else if (gameState.phase === 'afternoon') {
        gameController.advancePhase();
        syncGameState();
      }
    }
  }, [gameState.phase]);

  // Check for reincarnation triggers
  useEffect(() => {
    if (gameState.phase === 'evening' && !gameState.showEveningChoice && !gameState.showReincarnationChoice) {
      const currentPlayer = gameController.getCurrentPlayer();
      if (currentPlayer.realm === 'human') {
        // For humans, always show evening choice - they use the aging track system
        gameController.state.showEveningChoice = true;
        syncGameState();
      } else if (currentPlayer.realm === 'heaven' && (currentPlayer.life <= 0 || currentPlayer.merit === 0)) {
        // Auto-reincarnate from spiritual realms
        gameController.chooseToDie();
        syncGameState();
      } else if (currentPlayer.realm === 'hell' && (currentPlayer.life <= 0 || currentPlayer.merit === 0)) {
        // Auto-reincarnate from spiritual realms
        gameController.chooseToDie();
        syncGameState();
      }
    }
  }, [gameState.phase, gameState.showEveningChoice, gameState.showReincarnationChoice, gameState.players]);

  // Action handlers that delegate to game controller
  const handleAction = (action, ...args) => {
    let result = null;

    switch (action) {
      case 'move':
        gameController.handleMove(args[0]);
        break;
      case 'meditate':
        gameController.handleMeditate();
        break;
      case 'goodDeed':
        gameController.handleGoodDeed();
        break;
      case 'badDeed':
        gameController.handleBadDeed();
        break;
      case 'alms':
        gameController.handleAlms();
        break;
      case 'becomeMonk':
        gameController.handleBecomeMonk();
        break;
      case 'ageNormally':
        result = gameController.ageNormally();
        break;
      case 'payToSurvive':
        result = gameController.payToSurvive();
        break;
      case 'chooseToDie':
        gameController.chooseToDie();
        break;
      case 'chooseNirvana':
        gameController.chooseNirvana();
        break;
      case 'chooseBodhisattva':
        gameController.chooseBodhisattva();
        break;
      case 'confirmReincarnation':
        gameController.confirmReincarnation();
        break;
      case 'toggleMoveMode':
        gameController.toggleMoveMode();
        break;
      case 'handleLocationClick':
        gameController.handleLocationClick(args[0]);
        break;
      case 'advancePhase':
        gameController.advancePhase();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        return;
    }

    // Handle animations if returned
    if (result && result.animations) {
      const newAnimState = {};
      result.animations.forEach(anim => {
        if (anim.type === 'removeHeart') {
          newAnimState[`${anim.playerId}_removingHeart`] = anim.position;
        } else if (anim.type === 'removeCoin') {
          newAnimState[`${anim.playerId}_removingCoin`] = anim.index;
        }
      });
      setAnimations(newAnimState);

      // Clear animations after delay
      setTimeout(() => {
        setAnimations({});
      }, 500);
    }

    syncGameState();
  };

  // Derived state from game controller
  const currentPlayer = gameController.getCurrentPlayer();
  const getPlayersAt = (locId, players) => players.filter(p => p.location === locId && p.realm === 'human');
  const othersHere = getPlayersAt(currentPlayer.location, gameState.players).filter(p => p.id !== currentPlayer.id);
  const canInteract = currentPlayer.location === 'town' || othersHere.length > 0;
  const mustTakeRobes = currentPlayer.realm === 'human' && currentPlayer.location === 'temple' && !currentPlayer.isMonk && !gameState.showEveningChoice;
  const availableMeditationSlots = gameController.getAvailableMeditationSlots(currentPlayer.location);
  const canMeditate = !gameState.isMoving && currentPlayer.isMeditator && availableMeditationSlots > 0;

  const renderLocation = (loc, gameStateData, currentPlayerData, locations) => {
    const getPlayersAtLocation = (locId) => gameStateData.players.filter(p => p.location === locId && p.realm === 'human');

    const playersHere = getPlayersAtLocation(loc.id);
    const isCurrentLoc = currentPlayerData.location === loc.id && currentPlayerData.realm === 'human';
    const currentLocIdx = locations.findIndex(l => l.id === currentPlayerData.location);
    const thisLocIdx = locations.findIndex(l => l.id === loc.id);
    const isAdjacent = Math.abs(currentLocIdx - thisLocIdx) === 1;
    const isMoveTarget = gameStateData.isMoving && isAdjacent;
    const isDimmed = gameStateData.isMoving && !isAdjacent && !isCurrentLoc;
    const isNormal = !gameStateData.isMoving && !isCurrentLoc && !isDimmed;

    return (
      <LocationCard
        key={loc.id}
        location={loc}
        playersHere={playersHere}
        isCurrentLoc={isCurrentLoc}
        isMoveTarget={isMoveTarget}
        isDimmed={isDimmed}
        isNormal={isNormal}
        onLocationClick={(locId) => handleAction('handleLocationClick', locId)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800 font-sans p-4 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        <div className="lg:col-span-5 flex flex-col gap-2 overflow-y-auto px-2 py-2 pb-8 h-full">
          {gameState.players.map(p => {
            const previousPlayer = previousGameState?.players.find(prev => prev.id === p.id) || null;
            return (
              <PlayerCard
                key={p.id}
                player={p}
                isActive={p.id === currentPlayer.id}
                previousPlayer={previousPlayer}
              />
            );
          })}
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
          <div className={`border-4 border-stone-300 rounded-xl bg-stone-200/50 p-2 shrink-0 flex flex-col gap-2 shadow-inner transition-all ${gameState.isMoving ? 'grayscale-0 opacity-100' : 'grayscale-[0.2] opacity-90'}`}>
            <div className="bg-stone-200 p-2 rounded-lg border border-stone-300 overflow-x-auto">
              <div className="flex justify-between items-center min-w-[500px]">
                {LOCATIONS.map((loc, i) => (
                  <React.Fragment key={loc.id}>
                    {renderLocation(loc, gameState, currentPlayer, LOCATIONS)}
                    {i < LOCATIONS.length - 1 && <div className="h-2 bg-stone-300 flex-1 mx-2 rounded-full border border-stone-400"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 justify-between h-16">
                <div className="text-blue-300 font-bold text-xs w-16 text-center">HEAVEN</div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {gameState.players.filter(p => p.realm === 'heaven').map(p => (<Meeple key={p.id} player={p} size="small" />))}
                  {gameState.players.filter(p => p.realm === 'heaven').length === 0 && <span className="text-blue-200 text-xs italic">Empty</span>}
                </div>
              </div>
              <div className="flex-1 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 justify-between h-16">
                <div className="text-red-300 font-bold text-xs w-16 text-center">HELL</div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {gameState.players.filter(p => p.realm === 'hell').map(p => (<Meeple key={p.id} player={p} size="small" />))}
                  {gameState.players.filter(p => p.realm === 'hell').length === 0 && <span className="text-red-200 text-xs italic">Empty</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-1 min-h-0">
            <div className={`p-3 rounded-xl shadow-sm border-2 transition-colors duration-300 w-[230px] flex flex-col shrink-0 h-[480px] ${getActionPanelStyle(currentPlayer)}`}>
              <h3 className={`font-bold text-xs mb-2 pb-1 border-b ${getActionHeaderStyle(currentPlayer)} flex justify-between items-center shrink-0`}>
                <div className="text-center">
                  <div>{currentPlayer.name}</div>
                  <div className="text-[10px] font-normal">Life: {currentPlayer.lifeCount}</div>
                  <div className="text-[10px] font-normal">Day: {currentPlayer.dayCount}</div>
                </div>
                <span className="flex items-center gap-1 font-normal bg-white/50 px-2 py-0.5 rounded text-[10px] uppercase">
                  {getPhaseIcon(gameState.phase)} {gameState.phase}
                </span>
              </h3>
              <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0 mb-2">
                {mustTakeRobes ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <p className="text-xs text-orange-800 text-center font-bold">You have entered the Temple.</p>
                    <ActionButton label="Ordain" onClick={() => handleAction('becomeMonk')} mandatory={true} icon={<span className="text-sm">+🥣</span>} />
                  </div>
                ) : currentPlayer.realm === 'human' && !gameState.showEveningChoice && gameState.phase !== 'evening' ? (
                  <>
                    <ActionButton label="Move" onClick={() => handleAction('toggleMoveMode')} active={gameState.isMoving} icon={<Move size={14}/>} />
                    <ActionButton label="Meditate" onClick={() => handleAction('meditate')} disabled={!canMeditate} icon={<><ArrowDown size={10}/><Cloud size={12}/></>} />
                    <ActionButton label="Good Deed" onClick={() => handleAction('goodDeed')} disabled={gameState.isMoving || currentPlayer.dana < 1 || !canInteract} icon={<><ArrowDown size={10}/><DanaCoin size={10}/><ArrowUp size={10}/><YinYang size={10} filled={true}/></>} />
                    <ActionButton label="Bad Deed" onClick={() => handleAction('badDeed')} disabled={gameState.isMoving || !canInteract || currentPlayer.dana >= 10} icon={<><ArrowDown size={10}/><YinYang size={10} filled={true}/><ArrowUp size={10}/><DanaCoin size={10}/></>} />
                    <ActionButton label="Alms" onClick={() => handleAction('alms')} disabled={gameState.isMoving || gameState.phase !== 'morning' || !currentPlayer.isMonk || currentPlayer.location !== 'town'} icon={<><ArrowUp size={10}/><DanaCoin size={10}/></>} />
                    <ActionButton
                      label="Skip"
                      onClick={() => handleAction('advancePhase')}
                      disabled={gameState.isMoving}
                      icon={<><span className="text-xs">⏭️</span>{gameState.phase === 'morning' ? <span className="text-xs">☀️</span> : <span className="text-xs">🌙</span>}</>}
                    />
                  </>
                ) : currentPlayer.realm !== 'human' && gameState.phase !== 'evening' ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <p className="text-[10px] text-gray-500">Time passes in <span className="font-bold uppercase">{currentPlayer.realm}</span></p>
                    <p className="text-xs text-gray-400">⏭️ Auto-advancing to Evening</p>
                  </div>
                ) : gameState.showEveningChoice ? (
                  <>
                    <ActionButton
                      label="Age"
                      onClick={() => handleAction('ageNormally')}
                      disabled={currentPlayer.age >= 5}
                      icon={<><span className="text-sm">👤</span><ArrowRight size={10}/><Heart size={12} className="text-red-500 fill-red-500"/><ArrowDown size={8}/></>}
                    />
                    <ActionButton
                      label="Extend"
                      onClick={() => handleAction('payToSurvive')}
                      disabled={currentPlayer.age < 5 || currentPlayer.dana <= 0}
                      icon={<><span className="text-sm">👤</span><ArrowRight size={10}/><DanaCoin size={12}/><ArrowDown size={8}/></>}
                    />
                    <ActionButton
                      label="Die"
                      onClick={() => handleAction('chooseToDie')}
                      disabled={currentPlayer.age < 5}
                      icon={<><span className="text-sm">💀</span><span className="text-sm">🔄</span></>}
                    />
                    {currentPlayer.age >= 5 && currentPlayer.insight >= 7 && (
                      <>
                        <ActionButton
                          label="Nirvana"
                          onClick={() => handleAction('chooseNirvana')}
                          mandatory={true}
                          icon={<><span className="text-sm">🪷</span><Trophy size={10}/></>}
                        />
                        <ActionButton
                          label="Bodhisattva"
                          onClick={() => handleAction('chooseBodhisattva')}
                          mandatory={true}
                          icon={<><span className="text-sm">🧘</span><span className="text-sm">🔄</span></>}
                        />
                      </>
                    )}
                  </>
                ) : gameState.showReincarnationChoice && gameState.pendingReincarnation ? (
                  <div className="flex flex-col gap-2 h-full justify-center animate-in fade-in zoom-in duration-300">
                    {gameState.pendingReincarnation.type === 'victory' ? (
                      <>
                        <p className="text-center text-xs font-bold text-green-600 mb-1">🏆 ENLIGHTENMENT ACHIEVED! 🏆</p>
                        <p className="text-center text-[10px] text-gray-600 mb-2">You have broken the cycle of Samsara</p>
                        <ActionButton
                          label="Nirvana"
                          onClick={() => handleAction('confirmReincarnation')}
                          mandatory={true}
                          icon={<span className="text-sm">🪷</span>}
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-center text-xs font-bold text-purple-600 mb-1">Reincarnation</p>
                        <p className="text-center text-[10px] text-gray-600 mb-2">
                          You will be reborn in the <span className="font-bold uppercase text-purple-700">{gameState.pendingReincarnation.nextRealm}</span> realm
                          {gameState.pendingReincarnation.nextRole.isTeacher && <span className="block text-green-600">as a Teacher</span>}
                          {gameState.pendingReincarnation.nextRole.isGreedy && <span className="block text-red-600">as Greedy</span>}
                        </p>
                        <ActionButton
                          label="Reincarnate"
                          onClick={() => handleAction('confirmReincarnation')}
                          mandatory={true}
                          icon={<><span className="text-sm">💀</span><span className="text-sm">🔄</span></>}
                        />
                      </>
                    )}
                  </div>
                ) : gameState.phase === 'evening' && currentPlayer.realm !== 'human' ? (
                  <div className="flex flex-col gap-2 h-full justify-center">
                    <ActionButton
                      label="Wait"
                      onClick={() => {
                        gameController.handleEveningArrival();
                        gameController.advancePhase();
                        syncGameState();
                      }}
                      mandatory={true}
                      icon={currentPlayer.realm === 'heaven' ?
                        <><YinYang size={10} filled={true}/><ArrowDown size={8}/><span className="text-xs">☁️</span><ArrowDown size={8}/></> :
                        <><YinYang size={10} filled={true}/><ArrowUp size={8}/><span className="text-xs">☁️</span><ArrowUp size={8}/></>
                      }
                    />
                    <p className="text-center text-[8px] text-gray-500">
                      {currentPlayer.realm === 'heaven' ? 'Karma down, delusion down' : 'Karma up, delusion up'}
                    </p>
                  </div>
                ) : gameState.phase === 'evening' ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <p className="text-[10px] text-gray-500">Evening Ritual Complete</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <p className="text-[10px] text-gray-500">In <span className="font-bold uppercase">{currentPlayer.realm}</span></p>
                    <ActionButton
                      label="Pass Time"
                      onClick={() => {
                        gameController.handleEveningArrival();
                        gameController.advancePhase();
                        syncGameState();
                      }}
                      mandatory={true}
                      icon={currentPlayer.realm === 'heaven' ?
                        <><YinYang size={10} filled={true}/><ArrowDown size={8}/><span className="text-xs">☁️</span><ArrowDown size={8}/></> :
                        currentPlayer.realm === 'hell' ?
                        <><YinYang size={10} filled={true}/><ArrowUp size={8}/><span className="text-xs">☁️</span><ArrowUp size={8}/></> :
                        <ArrowRight size={14}/>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <div ref={logContainerRef} className="bg-stone-900 p-3 rounded-xl shadow-inner flex-1 min-h-0 overflow-y-auto font-mono text-[10px] border border-stone-700 h-[480px] max-h-[480px]">
              <div className="font-bold text-stone-500 mb-1 border-b border-stone-700 pb-1 sticky top-0 bg-stone-900">Log</div>
              <div className="space-y-0.5">
                {gameState.logs.map((log, i) => (
                  <div key={i} className={`opacity-90 border-l-2 pl-2 ${getPlayerLogColor(log.playerId, gameState.players)} ${getBorderColor(log.playerId, gameState.players)}`}>
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HungryGhostGame;