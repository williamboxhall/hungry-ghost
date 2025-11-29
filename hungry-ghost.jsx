import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Heart, Coins, Zap, Skull, Crown, Ghost, BookOpen, AlertCircle, ArrowRight, User, Sun, Sparkles, ArrowUp, ArrowDown, Move, Moon, SunMedium, Sunset } from 'lucide-react';

const LOCATIONS = [
  { id: 'cave', name: 'Cave', capacity: 1, type: 'meditation' },
  { id: 'forest', name: 'Forest', capacity: 2, type: 'meditation' },
  { id: 'town', name: 'Town', capacity: 99, type: 'social' },
  { id: 'temple', name: 'Temple', capacity: 99, type: 'mixed' }
];

const MAX_MERIT = 5;
const MIN_MERIT = -5;
const INITIAL_DELUSION = 30;
const WINNING_INSIGHT = 7;
const INITIAL_LIFE = 5;

// --- Visual Components ---

const DanaCoin = ({ size = 16, className = "", faded = false }) => (
  <div 
    className={`rounded-full flex items-center justify-center font-bold shadow-sm leading-none select-none ${className} ${faded ? 'bg-stone-200 border-stone-300 text-stone-400' : 'bg-yellow-400 border border-yellow-600 text-yellow-900'}`} 
    style={{ width: size, height: size, fontSize: size * 0.65 }}
  >
    $
  </div>
);

const Meeple = ({ player, size = "normal" }) => {
  const isSmall = size === "small";
  const baseSize = isSmall ? "w-8 h-8" : "w-12 h-12";
  const iconSize = isSmall ? 16 : 24;

  return (
    <div className={`relative ${baseSize} flex items-center justify-center transition-all duration-300`} title={`${player.name} (${player.realm})`}>
      <div className={`absolute inset-0 rounded-full ${player.color} border-2 border-white shadow-md flex items-center justify-center z-10`}>
        {player.isGreedy ? (
          <Ghost size={iconSize} className="text-white opacity-90" />
        ) : (
          <User size={iconSize} className="text-white opacity-90" />
        )}
      </div>
      {player.isTeacher && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-full p-0.5 shadow-sm">
          <Sun size={isSmall ? 12 : 16} className="text-yellow-500 fill-yellow-400" />
        </div>
      )}
      {player.isMeditator && !player.isTeacher && (
        <div className="absolute -top-1 -right-1 z-20 bg-blue-50 rounded-full p-0.5 shadow-sm border border-blue-100">
          <Sparkles size={isSmall ? 10 : 14} className="text-blue-500 fill-blue-200" />
        </div>
      )}
      {player.isMonk && (
        <div className="absolute -bottom-1 -right-1 z-20 bg-white rounded-full p-1 shadow-sm border border-stone-200" title="Begging Bowl">
           <div className={`bg-amber-700 rounded-b-full ${isSmall ? 'w-2.5 h-1.5' : 'w-3.5 h-2'}`}></div>
        </div>
      )}
    </div>
  );
};

const MeritSlider = ({ merit }) => {
  const steps = Array.from({ length: 11 }, (_, i) => i - 5);
  return (
    <div className="w-fit">
      <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-0.5 px-1">
        <span className="text-red-500 font-bold">-5</span>
        <span className="text-stone-500">0</span>
        <span className="text-blue-500 font-bold">+5</span>
      </div>
      <div className="relative flex items-center gap-0.5 bg-stone-200/50 rounded-full border border-stone-300 p-0.5 shadow-inner">
        {steps.map((step) => (
            <div 
                key={step} 
                className={`
                    relative z-0 w-5 h-5 rounded-full shadow-inner flex items-center justify-center
                    ${step === 0 ? 'bg-stone-300 border border-stone-400' : 'bg-white/50 border border-stone-200'}
                `}
            >
                {step === 0 && <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"></div>}
                {merit === step && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-5 h-5 bg-white border-2 border-stone-800 rounded-full flex items-center justify-center text-[10px] shadow-md transform scale-110">
                            ☯
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

const LifeTrack = ({ life, dana }) => {
    const LIFE_SLOTS = 5;
    const DANA_SLOTS = 10;
    return (
        <div className="flex gap-0.5 items-center bg-stone-200/50 p-0.5 rounded-lg border border-stone-300/50 w-fit">
            {[...Array(LIFE_SLOTS)].map((_, i) => {
                const isEmpty = i < (LIFE_SLOTS - life);
                return (
                    <div key={`life-${i}`} className={`relative w-5 h-5 rounded flex items-center justify-center bg-white border border-stone-200`}>
                        {!isEmpty ? <Heart size={12} className="text-red-500 fill-red-500 drop-shadow-sm" /> : <Heart size={12} className="text-stone-300 opacity-50" strokeWidth={1.5} />}
                    </div>
                );
            })}
            <div className="w-0.5 h-4 bg-stone-300 mx-0.5"></div>
            {[...Array(DANA_SLOTS)].map((_, i) => {
                const hasCoin = i < dana;
                return (
                    <div key={`dana-${i}`} className={`relative w-5 h-5 rounded flex items-center justify-center bg-stone-300/50 border border-stone-400/50 shadow-inner`}>
                        {hasCoin ? <DanaCoin size={16} /> : <DanaCoin size={16} faded={true} />}
                    </div>
                );
            })}
        </div>
    );
};

const DelusionGrid = ({ delusion }) => {
    return (
        <div className="grid grid-cols-10 gap-0.5 w-fit bg-stone-300/50 p-0.5 rounded border border-stone-300/50 shadow-inner">
            {[...Array(30)].map((_, i) => (
                <div key={i} className="w-5 h-5 flex items-center justify-center bg-white/60 rounded-sm shadow-sm border border-stone-100">
                    {i < delusion ? <Cloud size={12} className="text-stone-600 fill-stone-500" /> : <div className="w-1.5 h-1.5 bg-stone-200 rounded-full opacity-30"></div>}
                </div>
            ))}
        </div>
    );
};

const InsightLotus = ({ insight }) => {
    return (
        <div className="relative w-[180px] h-20 flex items-end justify-center">
            {[...Array(7)].map((_, i) => {
                const filled = i < insight;
                const xOffset = -42 + (i * 14); 
                const rotation = -45 + (i * 30);
                return (
                    <div key={i} className="absolute bottom-1" style={{ left: '50%', marginLeft: `${xOffset}px`, zIndex: filled ? 10 + i : 1 }}>
                        <div className={`w-8 h-8 rounded-tr-[100%] rounded-bl-[100%] border-2 transition-all duration-500 ${filled ? 'bg-pink-500 border-pink-700 shadow-sm opacity-100' : 'bg-stone-200 border-stone-300 opacity-40'}`} style={{ transformOrigin: 'bottom right', transform: `rotate(${rotation}deg)` }}>
                            {filled && <div className="absolute inset-2 bg-white opacity-20 rounded-tr-[100%] rounded-bl-[100%]"></div>}
                        </div>
                    </div>
                );
            })}
            <div className="absolute bottom-1 w-[140px] h-1.5 bg-stone-300 rounded-full opacity-30"></div>
        </div>
    );
};

const HungryGhostGame = () => {
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [actionsLeft, setActionsLeft] = useState(2);
  const [phase, setPhase] = useState('morning'); 
  const [logs, setLogs] = useState(["Game started. Welcome to the Human Realm."]);
  const [winner, setWinner] = useState(null);
  const [showEveningChoice, setShowEveningChoice] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const logContainerRef = useRef(null);

  const [players, setPlayers] = useState([
    { id: 0, name: 'Blue', color: 'bg-blue-600', location: 'town', realm: 'human', life: 5, merit: 0, dana: 0, delusion: INITIAL_DELUSION, insight: 0, isMonk: false, isMeditator: false, isTeacher: false, isGreedy: false },
    { id: 1, name: 'Green', color: 'bg-green-600', location: 'town', realm: 'human', life: 5, merit: 0, dana: 0, delusion: INITIAL_DELUSION, insight: 0, isMonk: false, isMeditator: false, isTeacher: false, isGreedy: false },
    { id: 2, name: 'Red', color: 'bg-red-600', location: 'town', realm: 'human', life: 5, merit: 0, dana: 0, delusion: INITIAL_DELUSION, insight: 0, isMonk: false, isMeditator: false, isTeacher: false, isGreedy: false }
  ]);

  const currentPlayer = players[currentPlayerIdx];

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
      if (phase === 'evening') {
          handleEveningArrival();
      }
  }, [phase]);

  const getPlayersAt = (locId) => players.filter(p => p.location === locId && p.realm === 'human');

  const updatePlayer = (id, updates) => {
    setPlayers(prev => prev.map(p => {
        if (p.id !== id) return p;
        const newValues = typeof updates === 'function' ? updates(p) : updates;
        return { ...p, ...newValues };
    }));
  };

  const advancePhase = () => {
      if (phase === 'morning') {
          setPhase('afternoon');
          addLog("It is now Afternoon.");
      } else if (phase === 'afternoon') {
          setPhase('evening');
          addLog("It is now Evening. Time for the end of day ritual.");
      } else {
          setPhase('morning');
          setShowEveningChoice(false);
          let nextIdx = (currentPlayerIdx + 1) % players.length;
          setCurrentPlayerIdx(nextIdx);
          addLog(`It is Morning. ${players[nextIdx].name}'s turn begins.`);
      }
  };

  const skipToEvening = () => {
      setPhase('evening');
      addLog(`${currentPlayer.name} skipped the rest of the day.`);
  };

  const toggleMoveMode = () => {
      if (phase === 'evening') return;
      if (currentPlayer.realm !== 'human') return;
      setIsMoving(!isMoving);
      if (!isMoving) addLog("Select a location to move to.");
  };

  const handleLocationClick = (locId) => {
      if (!isMoving) return;
      const currentLocIdx = LOCATIONS.findIndex(l => l.id === currentPlayer.location);
      const targetLocIdx = LOCATIONS.findIndex(l => l.id === locId);
      
      if (Math.abs(currentLocIdx - targetLocIdx) !== 1) {
          addLog("Too far! You can only move to adjacent locations.");
          return;
      }
      handleMove(locId);
      setIsMoving(false);
  };

  const handleMove = (targetLoc) => {
    let greedyLog = null;
    setPlayers(currentPlayers => {
        let updatedPlayers = currentPlayers.map(p => {
            if (p.id === currentPlayerIdx) {
                let next = { ...p, location: targetLoc };
                if (p.isGreedy && targetLoc === 'town') {
                    next.merit = Math.max(MIN_MERIT, next.merit - 1);
                    next.dana = next.dana + 1;
                    greedyLog = `${p.name} (Greedy) stole entering Town! (-1 Merit, +1 Dana)`;
                }
                return next;
            }
            return p;
        });

        const me = updatedPlayers.find(p => p.id === currentPlayerIdx);
        const playersAtTarget = updatedPlayers.filter(p => p.location === targetLoc && p.id !== me.id);

        let newMe = { ...me };
        const teachers = playersAtTarget.filter(p => p.isTeacher);
        if (teachers.length > 0 && !newMe.isMeditator) {
            newMe.isMeditator = true;
            updatedPlayers = updatedPlayers.map(p => {
                if (p.isTeacher && p.location === targetLoc && p.id !== me.id) {
                    return { ...p, merit: Math.min(MAX_MERIT, p.merit + 1) };
                }
                return p;
            });
        }

        const greedys = playersAtTarget.filter(p => p.isGreedy);
        greedys.forEach(g => {
            if (newMe.dana > 0) {
                newMe.dana = Math.max(0, newMe.dana - 1);
                updatedPlayers = updatedPlayers.map(p => {
                    if (p.id === g.id) {
                        return { ...p, dana: p.dana + 1, merit: Math.max(MIN_MERIT, p.merit - 1) };
                    }
                    return p;
                });
            }
        });
        return updatedPlayers.map(p => p.id === me.id ? newMe : p);
    });

    if (greedyLog) addLog(greedyLog);
    advancePhase();
    addLog(`${currentPlayer.name} moved to ${targetLoc}.`);
  };

  const handleMeditate = () => {
    if (phase === 'evening') return;
    const loc = LOCATIONS.find(l => l.id === currentPlayer.location);
    let delusionDrop = 0;
    if (loc.id === 'temple') delusionDrop = 1 + getPlayersAt(loc.id).length - 1; 
    if (loc.id === 'forest') delusionDrop = 1;
    if (loc.id === 'cave') delusionDrop = 2;

    updatePlayer(currentPlayer.id, (prev) => {
        let newDelusion = prev.delusion;
        let newInsight = prev.insight;
        if (newDelusion > 0) {
            newDelusion = Math.max(0, newDelusion - delusionDrop);
            addLog(`${currentPlayer.name} meditated. Delusion reduced by ${delusionDrop}.`);
            if (newDelusion === 0 && prev.delusion > 0) addLog(`${currentPlayer.name} has cleared all Delusion!`);
        } else {
            newInsight += delusionDrop;
            addLog(`${currentPlayer.name} meditated in clarity. Gained ${delusionDrop} Insight.`);
        }
        return { delusion: newDelusion, insight: newInsight };
    });
    advancePhase();
  };

  const handleGoodDeed = () => {
    if (phase === 'evening') return;
    const others = getPlayersAt(currentPlayer.location).filter(p => p.id !== currentPlayer.id);
    updatePlayer(currentPlayer.id, (prev) => ({ dana: prev.dana - 1, merit: Math.min(MAX_MERIT, prev.merit + 1) }));
    if (others.length > 0 && currentPlayer.location !== 'town') {
        const receiver = others[0];
        updatePlayer(receiver.id, (prev) => ({ dana: prev.dana + 1 }));
        addLog(`${currentPlayer.name} gave 1 Dana to ${receiver.name} (Good Deed).`);
    } else {
        addLog(`${currentPlayer.name} donated 1 Dana to the temple box.`);
    }
    advancePhase();
  };

  const handleBadDeed = () => {
    if (phase === 'evening') return;
    setPlayers(currentPlayers => {
        const me = currentPlayers.find(p => p.id === currentPlayerIdx);
        let gained = 0;
        
        const updatedPlayers = currentPlayers.map(p => {
            if (p.location === me.location && p.id !== me.id) {
                if (p.dana > 0) {
                    gained++;
                    return { ...p, dana: p.dana - 1 };
                }
            }
            return p;
        });

        const townBonus = (me.location === 'town') ? 1 : 0;
        const totalGain = gained + townBonus;

        return updatedPlayers.map(p => {
            if (p.id === me.id) {
                return { ...p, merit: Math.max(MIN_MERIT, p.merit - 1), dana: p.dana + totalGain };
            }
            return p;
        });
    });
    
    const victims = getPlayersAt(currentPlayer.location).filter(p => p.id !== currentPlayer.id && p.dana > 0).map(p => p.name);
    let totalGained = victims.length + (currentPlayer.location === 'town' ? 1 : 0);
    let gainMsg = totalGained > 0 ? `Stole ${totalGained} Dana.` : "Found nothing to steal.";
    advancePhase();
    addLog(`${currentPlayer.name} committed a Bad Deed. ${gainMsg} (-1 Merit)`);
  };

  const handleAlms = () => {
    if (phase !== 'morning') return;
    updatePlayer(currentPlayer.id, (prev) => ({ dana: prev.dana + 1 }));
    addLog(`${currentPlayer.name} collected Alms. (+1 Dana)`);
    advancePhase();
  };

  const handleBecomeMonk = () => {
      updatePlayer(currentPlayer.id, { isMonk: true, dana: 0 }); 
      addLog(`${currentPlayer.name} has taken robes and become a Monk.`);
  };

  const handleEveningArrival = () => {
      setPlayers(currentPlayers => {
          return currentPlayers.map(p => {
              if (p.id !== currentPlayer.id) return p;
              let newLife = p.life - 1;
              let newDana = p.dana;
              let newDelusion = p.delusion;
              let newMerit = p.merit;
              if (p.realm === 'heaven') {
                  newDelusion = Math.max(0, p.delusion - 1);
                  newMerit = Math.max(0, p.merit - 1);
              } else if (p.realm === 'hell') {
                  newDelusion = p.delusion + 1;
                  newMerit = Math.min(0, p.merit + 1);
                  newLife = Math.abs(newMerit);
              }
              if (p.realm === 'human' && newLife <= 0 && newDana > 0) {
                     setShowEveningChoice(true);
              } 
              return { ...p, life: newLife, dana: newDana, delusion: newDelusion, merit: newMerit };
          });
      });
  };

  useEffect(() => {
      if (phase === 'evening' && !showEveningChoice) {
          if (currentPlayer.realm === 'human' && currentPlayer.life <= 0 && currentPlayer.dana <= 0) {
              handleDeath(currentPlayer);
          } else if (currentPlayer.realm === 'heaven' && (currentPlayer.life <= 0 || currentPlayer.merit === 0)) {
              handleDeath(currentPlayer);
          } else if (currentPlayer.realm === 'hell' && (currentPlayer.life <= 0 || currentPlayer.merit === 0)) {
               handleDeath(currentPlayer);
          }
      }
  }, [phase, showEveningChoice, players]);

  const payToSurvive = () => {
      updatePlayer(currentPlayer.id, (prev) => ({ life: 1, dana: prev.dana - 1 }));
      addLog(`${currentPlayer.name} paid 1 Dana to extend life.`);
      setShowEveningChoice(false);
  };

  const chooseToDie = () => {
      setShowEveningChoice(false);
      handleDeath(currentPlayer);
  };

  const handlePassTime = () => {
      handleEveningArrival();
      advancePhase();
  };

  const handleDeath = (player) => {
      if (player.insight >= WINNING_INSIGHT) {
          setWinner(player);
          addLog(`*** ${player.name} HAS AWAKENED! GAME OVER ***`);
          return;
      }
      addLog(`${player.name} has died.`);
      let nextRealm = 'human', nextRole = { isTeacher: false, isGreedy: false, isMonk: false, isMeditator: false };
      if (player.realm === 'human') {
          if (player.merit > 0) nextRealm = 'heaven'; else if (player.merit < 0) nextRealm = 'hell';
      } else {
          if (player.realm === 'heaven') nextRole.isTeacher = true; if (player.realm === 'hell') nextRole.isGreedy = true;   
      }
      if (nextRole.isTeacher) nextRole.isMeditator = true; 
      let newMerit = player.realm !== 'human' ? 0 : player.merit;
      updatePlayer(player.id, { realm: nextRealm, life: INITIAL_LIFE, dana: 0, insight: 0, location: 'town', ...nextRole, merit: newMerit });
      addLog(`${player.name} reincarnated in ${nextRealm} Realm!`);
  };

  const othersHere = getPlayersAt(currentPlayer.location).filter(p => p.id !== currentPlayer.id);
  const canInteract = currentPlayer.location === 'town' || othersHere.length > 0;
  const mustTakeRobes = currentPlayer.realm === 'human' && currentPlayer.location === 'temple' && !currentPlayer.isMonk && !showEveningChoice;

  const getActionPanelStyle = () => {
      if (currentPlayer.color.includes('blue')) return "border-blue-300 bg-blue-50/50";
      if (currentPlayer.color.includes('green')) return "border-green-300 bg-green-50/50";
      if (currentPlayer.color.includes('red')) return "border-red-300 bg-red-50/50";
      return "border-stone-200 bg-white";
  };

  const getActionHeaderStyle = () => {
      if (currentPlayer.color.includes('blue')) return "text-blue-700 border-blue-200";
      if (currentPlayer.color.includes('green')) return "text-green-700 border-green-200";
      if (currentPlayer.color.includes('red')) return "text-red-700 border-red-200";
      return "text-gray-700 border-b";
  };

  const getPhaseIcon = () => {
      if (phase === 'morning') return <SunMedium size={14} className="text-yellow-600"/>;
      if (phase === 'afternoon') return <Sun size={14} className="text-orange-500"/>;
      return <Moon size={14} className="text-indigo-600"/>;
  };

  const ActionButton = ({ label, effects, icon, disabled, onClick, active }) => (
      <button onClick={onClick} disabled={disabled} className={`w-full flex items-center justify-between px-3 py-2.5 rounded border shadow-sm transition-all ${active ? 'ring-2 ring-offset-1 ring-blue-400 bg-blue-50 border-blue-300' : ''} ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}>
         <span className="text-[11px] font-bold uppercase">{label}</span>
         <div className="flex items-center gap-1 opacity-80">{effects}{icon && <span className="ml-1">{icon}</span>}</div>
      </button>
  );

  const renderPlayerCard = (player) => {
      const isActive = player.id === currentPlayer.id;
      let bgClass = "bg-gray-50", borderClass = "border-gray-200";
      if (player.color.includes('blue')) { bgClass = "bg-blue-50"; borderClass = "border-blue-200"; }
      if (player.color.includes('green')) { bgClass = "bg-green-50"; borderClass = "border-green-200"; }
      if (player.color.includes('red')) { bgClass = "bg-red-50"; borderClass = "border-red-200"; }

      return (
          <div key={player.id} className={`p-1.5 rounded-xl border-2 transition-all duration-300 ${isActive ? 'ring-4 ring-yellow-400 shadow-xl scale-[1.02] z-10' : 'scale-100 z-0'} ${bgClass} ${borderClass} flex flex-col gap-1 relative shadow-sm`}>
              <div className="flex flex-col gap-1">
                  <div>
                      <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1"><ArrowUp size={10}/> MERIT <ArrowDown size={10}/></div>
                      <MeritSlider merit={player.merit} />
                  </div>
                  <div>
                      <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1"><Heart size={10}/> LIFE / DANA <DanaCoin size={10}/></div>
                      <LifeTrack life={player.life} dana={player.dana} />
                  </div>
                  <div className="flex items-start justify-between gap-1 mt-0.5">
                      <div>
                         <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1"><Cloud size={10}/> DELUSION</div>
                         <DelusionGrid delusion={player.delusion} />
                      </div>
                      <div className="flex flex-col items-center">
                         <div className="text-[10px] text-gray-500 font-bold mb-0.5 text-center">INSIGHT</div>
                         <div className="transform scale-75 origin-bottom">
                            <InsightLotus insight={player.insight} />
                         </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderLocation = (loc) => {
    const playersHere = getPlayersAt(loc.id);
    const isCurrentLoc = currentPlayer.location === loc.id && currentPlayer.realm === 'human';
    const currentLocIdx = LOCATIONS.findIndex(l => l.id === currentPlayer.location);
    const thisLocIdx = LOCATIONS.findIndex(l => l.id === loc.id);
    const isAdjacent = Math.abs(currentLocIdx - thisLocIdx) === 1;
    const isMoveTarget = isMoving && isAdjacent;
    const isDimmmed = isMoving && !isAdjacent && !isCurrentLoc;
    const isNormal = !isMoving && !isCurrentLoc && !isDimmmed;

    return (
      <div key={loc.id} onClick={() => handleLocationClick(loc.id)} className={`relative flex flex-col items-center p-2 border-2 rounded-lg w-28 h-28 shrink-0 transition-all duration-300 ${isCurrentLoc ? 'border-yellow-400 bg-yellow-50 shadow-md z-10 scale-105' : ''} ${isMoveTarget ? 'border-green-400 bg-green-50 cursor-pointer shadow-lg scale-105 z-10 animate-pulse' : ''} ${isDimmmed ? 'border-gray-200 bg-gray-100 opacity-40 grayscale' : ''} ${isNormal && !isCurrentLoc ? 'border-gray-200 bg-white opacity-90' : ''}`}>
        <div className="absolute top-2 w-full text-center">
            <div className="font-bold text-gray-700 leading-none">{loc.name}</div>
            <div className="text-[10px] text-gray-400 mt-1">
                {loc.id === 'forest' ? 'Max 2' : loc.id === 'cave' ? 'Max 1' : ''}
            </div>
        </div>
        <div className="absolute bottom-2 w-full flex justify-center gap-1 px-1">
            {playersHere.map(p => (<Meeple key={p.id} player={p} size="small" />))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-100 text-slate-800 font-sans p-4 flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto px-2 py-2 pb-20 h-full">
              {players.map(p => renderPlayerCard(p))}
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 h-[calc(100vh-2rem)]">
              <div className={`border-4 border-stone-300 rounded-xl bg-stone-200/50 p-2 shrink-0 flex flex-col gap-2 shadow-inner transition-all ${isMoving ? 'grayscale-0 opacity-100' : 'grayscale-[0.2] opacity-90'}`}>
                  <div className="bg-stone-200 p-2 rounded-lg border border-stone-300 overflow-x-auto">
                      <div className="flex justify-between items-center min-w-[500px]">
                         {LOCATIONS.map((loc, i) => (
                             <React.Fragment key={loc.id}>
                                {renderLocation(loc)}
                                {i < LOCATIONS.length - 1 && <div className="h-2 bg-stone-300 flex-1 mx-2 rounded-full border border-stone-400"></div>}
                             </React.Fragment>
                         ))}
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <div className="flex-1 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 justify-between h-16">
                          <div className="text-blue-300 font-bold text-xs w-16 text-center">HEAVEN</div>
                          <div className="flex gap-1 flex-wrap justify-end">
                              {players.filter(p => p.realm === 'heaven').map(p => (<Meeple key={p.id} player={p} size="small" />))}
                              {players.filter(p => p.realm === 'heaven').length === 0 && <span className="text-blue-200 text-xs italic">Empty</span>}
                          </div>
                      </div>
                      <div className="flex-1 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 justify-between h-16">
                          <div className="text-red-300 font-bold text-xs w-16 text-center">HELL</div>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {players.filter(p => p.realm === 'hell').map(p => (<Meeple key={p.id} player={p} size="small" />))}
                            {players.filter(p => p.realm === 'hell').length === 0 && <span className="text-red-200 text-xs italic">Empty</span>}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
                  <div className={`p-3 rounded-xl shadow-sm border-2 transition-colors duration-300 w-56 flex flex-col shrink-0 h-full ${getActionPanelStyle()}`}>
                      <h3 className={`font-bold text-xs mb-2 pb-1 border-b ${getActionHeaderStyle()} flex justify-between items-center shrink-0`}>
                          <span>{currentPlayer.name}</span>
                          <span className="flex items-center gap-1 font-normal bg-white/50 px-2 py-0.5 rounded text-[10px] uppercase">
                              {getPhaseIcon()} {phase}
                          </span>
                      </h3>
                      <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0 mb-2">
                          {mustTakeRobes ? (
                              <div className="flex flex-col items-center justify-center h-full gap-2">
                                  <p className="text-xs text-orange-800 text-center font-bold">You have entered the Temple.</p>
                                  <ActionButton label="Take Robes" onClick={handleBecomeMonk} icon={<BookOpen size={14}/>} effects={<span className="text-[9px] italic">Become Monk</span>} />
                              </div>
                          ) : currentPlayer.realm === 'human' && !showEveningChoice && phase !== 'evening' ? (
                              <>
                                  <ActionButton label="Move" onClick={toggleMoveMode} active={isMoving} icon={<Move size={14}/>} />
                                  <ActionButton label="Meditate" onClick={handleMeditate} disabled={!currentPlayer.isMeditator} icon={<Cloud size={14}/>} effects={<div className="flex items-center gap-0.5 text-[9px]"><ArrowDown size={8}/>Del/Insight</div>} />
                                  <ActionButton label="Good Deed" onClick={handleGoodDeed} disabled={currentPlayer.dana < 1 || !canInteract} effects={<div className="flex items-center gap-0.5 text-[9px]"><ArrowDown size={8}/>$<ArrowUp size={8}/>☯</div>} />
                                  <ActionButton label="Bad Deed" onClick={handleBadDeed} disabled={!canInteract} effects={<div className="flex items-center gap-0.5 text-[9px]"><ArrowDown size={8}/>☯<ArrowUp size={8}/>$</div>} />
                                  <ActionButton label="Alms" onClick={handleAlms} disabled={phase !== 'morning' || !currentPlayer.isMonk || currentPlayer.location !== 'town'} icon={<DanaCoin size={12}/>} effects={<div className="flex items-center gap-0.5 text-[9px]"><ArrowUp size={8}/>$</div>} />
                                  <ActionButton label="Learn" disabled={true} effects={<span className="text-[9px] italic">Automatic</span>} />
                              </>
                          ) : showEveningChoice ? (
                              <div className="flex flex-col gap-2 h-full justify-center animate-in fade-in zoom-in duration-300">
                                  <p className="text-center text-xs font-bold text-red-600 mb-1">Survive Death?</p>
                                  <ActionButton label="Pay for Life" onClick={payToSurvive} effects={<div className="flex items-center gap-0.5"><ArrowDown size={8}/><DanaCoin size={12}/></div>} />
                                  <button onClick={chooseToDie} className="p-2 bg-stone-700 text-white border border-stone-600 rounded font-bold text-xs hover:bg-stone-600 flex items-center justify-between"><span>ACCEPT DEATH</span><Skull size={14}/></button>
                              </div>
                          ) : phase === 'evening' ? (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                  <p className="text-[10px] text-gray-500">Evening Ritual Complete</p>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                  <p className="text-[10px] text-gray-500">In <span className="font-bold uppercase">{currentPlayer.realm}</span></p>
                                  <button onClick={handlePassTime} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 shadow-lg text-xs w-full">PASS TIME</button>
                              </div>
                          )}
                      </div>
                      
                      {/* Footer Fixed Actions */}
                      {!showEveningChoice && phase !== 'evening' && currentPlayer.realm === 'human' && (
                          <div className="pt-2 border-t border-gray-200 shrink-0">
                              <button onClick={skipToEvening} className="w-full p-2 bg-stone-700 text-white rounded hover:bg-stone-600 font-bold flex items-center justify-between px-3 text-[10px]"><span>SKIP</span><span className="font-normal opacity-70">To Evening</span></button>
                          </div>
                      )}
                      {phase === 'evening' && !showEveningChoice && (
                           <div className="pt-2 border-t border-gray-200 shrink-0">
                               <button onClick={advancePhase} className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold flex items-center justify-between px-3 text-[10px]"><span>END DAY</span><div className="flex items-center opacity-80 gap-0.5"><Heart size={10}/> <ArrowDown size={8}/></div></button>
                           </div>
                      )}
                  </div>
                  <div ref={logContainerRef} className="bg-stone-900 text-green-400 p-3 rounded-xl shadow-inner flex-1 min-h-0 overflow-y-auto font-mono text-[10px] border border-stone-700 h-full">
                      <div className="font-bold text-stone-500 mb-1 border-b border-stone-700 pb-1 sticky top-0 bg-stone-900">Log</div>
                      {logs.map((log, i) => (<div key={i} className="mb-0.5 opacity-90 border-l-2 border-green-800 pl-2">{log}</div>))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HungryGhostGame;