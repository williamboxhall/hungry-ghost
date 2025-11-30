import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Heart, Coins, Zap, Skull, Crown, Ghost, BookOpen, AlertCircle, ArrowRight, User, Sun, Sparkles, ArrowUp, ArrowDown, Move, Moon, SunMedium, Sunset, RotateCcw, Trophy, FastForward, Sunrise } from 'lucide-react';

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
      {/* Base Avatar Circle */}
      <div className={`absolute inset-0 rounded-full ${player.color} border-2 border-white shadow-md flex items-center justify-center z-10`}>
        {player.isGreedy ? (
          <Ghost size={iconSize} className="text-white opacity-90" />
        ) : (
          <User size={iconSize} className="text-white opacity-90" />
        )}
      </div>

      {/* Teacher Halo (Sun) */}
      {player.isTeacher && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-full p-0.5 shadow-sm">
          <Sun size={isSmall ? 12 : 16} className="text-yellow-500 fill-yellow-400" />
        </div>
      )}

      {/* Meditator Sparkles */}
      {player.isMeditator && !player.isTeacher && (
        <div className="absolute -top-1 -right-1 z-20 bg-blue-50 rounded-full p-0.5 shadow-sm border border-blue-100">
          <Sparkles size={isSmall ? 10 : 14} className="text-blue-500 fill-blue-200" />
        </div>
      )}

      {/* Monk Begging Bowl */}
      {player.isMonk && (
        <div className="absolute -bottom-1 -right-1 z-20 bg-white rounded-full p-1 shadow-sm border border-stone-200" title="Begging Bowl">
           <div className={`bg-amber-700 rounded-b-full ${isSmall ? 'w-2.5 h-1.5' : 'w-3.5 h-2'}`}></div>
        </div>
      )}
    </div>
  );
};

// Merit Slider Component
const MeritSlider = ({ merit, realm = 'human', playerColor = '' }) => {
  const steps = Array.from({ length: 11 }, (_, i) => i - 5);

  const getMeritLabelColor = (value) => {
    if (value === -5) return "text-red-600";
    if (value === -4) return "text-red-500";
    if (value === -3) return "text-red-400";
    if (value === -2) return "text-pink-500";
    if (value === -1) return "text-pink-400";
    if (value === 0) return "text-gray-400";
    if (value === 1) return "text-blue-300";
    if (value === 2) return "text-blue-400";
    if (value === 3) return "text-blue-500";
    if (value === 4) return "text-blue-600";
    if (value === 5) return "text-blue-700";
    return "text-gray-400";
  };

  const getHeartPositions = () => {
    if (realm === 'heaven' && merit > 0) {
      // Hearts fill gaps from +1 up to but NOT including merit marker
      return Array.from({length: merit - 1}, (_, i) => i + 1);
    } else if (realm === 'hell' && merit < 0) {
      // Hearts fill gaps from -1 down to but NOT including merit marker
      return Array.from({length: Math.abs(merit) - 1}, (_, i) => -(i + 1));
    }
    return [];
  };

  const getHeartColor = () => {
    if (playerColor.includes('blue')) return "text-blue-500 fill-blue-500";
    if (playerColor.includes('green')) return "text-green-500 fill-green-500";
    if (playerColor.includes('red')) return "text-red-500 fill-red-500";
    return "text-red-500 fill-red-500"; // Default red
  };

  const isInSpiritualRealm = realm === 'heaven' || realm === 'hell';
  const heartPositions = getHeartPositions();

  return (
    <div className="w-fit">
      {/* Gradient Colored Labels */}
      <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
        {steps.map((step) => (
          <div key={step} className={`w-5 h-3 flex items-center justify-center text-[8px] font-mono ${getMeritLabelColor(step)}`}>
            {step >= 0 ? `+${step}` : step}
          </div>
        ))}
      </div>
      
      {/* Track Container */}
      <div className="relative flex items-center gap-0.5 bg-stone-200/50 rounded-full border border-stone-300 p-0.5 shadow-inner">
        {/* Sockets */}
        {steps.map((step) => (
            <div 
                key={step} 
                className={`
                    relative z-0 w-5 h-5 rounded-full shadow-inner flex items-center justify-center
                    ${step === 0 ? 'bg-stone-300 border border-stone-400' : 'bg-white/50 border border-stone-200'}
                `}
            >
                {step === 0 && <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"></div>}

                {/* Hearts for spiritual realms */}
                {isInSpiritualRealm && heartPositions.includes(step) && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Heart size={14} className={`${getHeartColor()} drop-shadow-sm animate-fall-in`} />
                    </div>
                )}

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

// Life & Dana Track
const LifeTrack = ({ life, dana, playerColor = '', agePosition = 0, placedDana = [] }) => {
    const TOTAL_SLOTS = 16; // 1 aging position + 5 life + 10 dana
    const LIFE_SLOTS = 5;
    const DANA_SLOTS = 10;

    const getHeartColor = () => {
        if (playerColor.includes('blue')) return "text-blue-500 fill-blue-500";
        if (playerColor.includes('green')) return "text-green-500 fill-green-500";
        if (playerColor.includes('red')) return "text-red-500 fill-red-500";
        return "text-red-500 fill-red-500"; // Default red
    };

    return (
        <div className="w-fit">
            {/* Section Headers */}
            <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
                {/* Aging position header */}
                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-500 font-bold">
                    👤
                </div>

                {/* Life headers */}
                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-500 font-bold">
                    LIFE
                </div>
                {[...Array(LIFE_SLOTS - 1)].map((_, i) => (
                    <div key={`life-spacer-${i}`} className="w-5 h-3"></div>
                ))}

                {/* Divider Space */}
                <div className="w-0.5 h-3 mx-0.5"></div>

                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-500 font-bold">
                    DANA
                </div>
                {[...Array(DANA_SLOTS - 1)].map((_, i) => (
                    <div key={`dana-spacer-${i}`} className="w-5 h-3"></div>
                ))}
            </div>

            {/* Numbered Labels */}
            <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
                {/* Aging position label */}
                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-400 font-mono">
                    0
                </div>

                {/* Life Labels */}
                {[...Array(LIFE_SLOTS)].map((_, i) => (
                    <div key={`life-label-${i}`} className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-400 font-mono">
                        {i + 1}
                    </div>
                ))}

                {/* Divider Space */}
                <div className="w-0.5 h-3 mx-0.5"></div>

                {/* Dana Labels */}
                {[...Array(DANA_SLOTS)].map((_, i) => (
                    <div key={`dana-label-${i}`} className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-400 font-mono">
                        {LIFE_SLOTS + i + 1}
                    </div>
                ))}
            </div>

            <div className="flex gap-0.5 items-center bg-stone-200/50 p-0.5 rounded-lg border border-stone-300/50 w-fit">
                {/* Aging Position (0) */}
                <div className="relative w-5 h-5 rounded flex items-center justify-center bg-green-50 border border-green-300">
                    {agePosition === 0 && (
                        <span className="text-sm">👤</span>
                    )}
                    {agePosition !== 0 && placedDana.includes(0) && (
                        <DanaCoin size={12} />
                    )}
                </div>

                {/* Life Section */}
                {[...Array(LIFE_SLOTS)].map((_, i) => {
                    const pos = i + 1; // Life positions are 1-5
                    const heartCollected = agePosition >= pos; // Heart collected if head has passed this position
                    const isHeadHere = agePosition === pos;
                    const hasDana = placedDana.includes(pos);

                    return (
                        <div
                            key={`life-${i}`}
                            className={`relative w-5 h-5 rounded flex items-center justify-center bg-white border border-stone-200`}
                        >
                            {isHeadHere && (
                                <span className="absolute z-20 text-sm">👤</span>
                            )}
                            {!heartCollected && !isHeadHere && !hasDana && (
                                <Heart size={12} className={`${getHeartColor()} drop-shadow-sm`} />
                            )}
                            {hasDana && !isHeadHere && (
                                <DanaCoin size={12} />
                            )}
                            {heartCollected && !hasDana && !isHeadHere && (
                                <Heart size={12} className="text-stone-300 opacity-30" strokeWidth={1.5} />
                            )}
                        </div>
                    );
                })}

                {/* Divider */}
                <div className="w-0.5 h-4 bg-stone-300 mx-0.5"></div>

                {/* Dana Section */}
                {[...Array(DANA_SLOTS)].map((_, i) => {
                    const hasCoin = i < dana;
                    return (
                        <div
                            key={`dana-${i}`}
                            className={`relative w-5 h-5 rounded flex items-center justify-center bg-stone-300/50 border border-stone-400/50 shadow-inner`}
                        >
                            {hasCoin ? (
                                <DanaCoin size={16} />
                            ) : (
                                <DanaCoin size={16} faded={true} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Delusion Grid
const DelusionGrid = ({ delusion }) => {
    return (
        <div className="grid grid-cols-10 gap-0.5 w-fit bg-stone-300/50 p-0.5 rounded border border-stone-300/50 shadow-inner">
            {[...Array(30)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-5 h-5 flex items-center justify-center bg-white/60 rounded-sm shadow-sm border border-stone-100"
                >
                    {i < delusion ? (
                        <Cloud size={12} className="text-stone-600 fill-stone-500" />
                    ) : (
                        // Empty slot
                        <div className="w-1.5 h-1.5 bg-stone-200 rounded-full opacity-30"></div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Insight Lotus
const InsightLotus = ({ insight }) => {
    return (
        <div className="relative w-[180px] h-20 flex items-end justify-center">
            {/* 7 Petals spanning 180 degrees */}
            {[...Array(7)].map((_, i) => {
                const filled = i < insight;
                const xOffset = -42 + (i * 14); 
                const rotation = -45 + (i * 30);

                return (
                    <div 
                        key={i}
                        className="absolute bottom-1"
                        style={{
                            left: '50%',
                            marginLeft: `${xOffset}px`,
                            zIndex: filled ? 10 + i : 1, 
                        }}
                    >
                        <div 
                            className={`
                                w-8 h-8 
                                rounded-tr-[100%] rounded-bl-[100%]
                                border-2 transition-all duration-500
                                ${filled 
                                    ? 'bg-pink-500 border-pink-700 shadow-sm opacity-100' 
                                    : 'bg-stone-200 border-stone-300 opacity-40'}
                            `}
                            style={{
                                transformOrigin: 'bottom right',
                                transform: `rotate(${rotation}deg)` 
                            }}
                        >
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
  // Game State
  const [turnCount, setTurnCount] = useState(1);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [actionsLeft, setActionsLeft] = useState(2);
  const [phase, setPhase] = useState('morning'); 
  const [logs, setLogs] = useState([{ message: "Game started. Welcome to the Human Realm.", type: "neutral" }]);
  const [winner, setWinner] = useState(null);
  const [showEveningChoice, setShowEveningChoice] = useState(false);
  const [showReincarnationChoice, setShowReincarnationChoice] = useState(false);
  const [pendingReincarnation, setPendingReincarnation] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [pendingInteractions, setPendingInteractions] = useState([]);
  const [showInteractionChoice, setShowInteractionChoice] = useState(false);
  
  const logContainerRef = useRef(null);

  // Players
  const [players, setPlayers] = useState([
    { id: 0, name: 'Blue', color: 'bg-blue-600', location: 'town', realm: 'human', life: 5, merit: 0, dana: 0, delusion: INITIAL_DELUSION, insight: 0, dayCount: 1, lifeCount: 1, isMonk: false, isMeditator: false, isTeacher: false, isGreedy: false, agePosition: 0, placedDana: [] },
    { id: 1, name: 'Green', color: 'bg-green-600', location: 'town', realm: 'human', life: 5, merit: 0, dana: 0, delusion: INITIAL_DELUSION, insight: 0, dayCount: 1, lifeCount: 1, isMonk: false, isMeditator: false, isTeacher: false, isGreedy: false, agePosition: 0, placedDana: [] },
    { id: 2, name: 'Red', color: 'bg-red-600', location: 'town', realm: 'human', life: 5, merit: 0, dana: 0, delusion: INITIAL_DELUSION, insight: 0, dayCount: 1, lifeCount: 1, isMonk: false, isMeditator: false, isTeacher: false, isGreedy: false, agePosition: 0, placedDana: [] }
  ]);

  const currentPlayer = players[currentPlayerIdx];

  const addLog = (msg, type = "neutral", playerId = null) => {
    setLogs(prev => [...prev, { message: msg, type, playerId }]);
  };

  const getPlayerLogColor = (playerId) => {
    if (playerId === null) return "text-white";
    const player = players.find(p => p.id === playerId);
    if (!player) return "text-white";

    if (player.color.includes('blue')) return "text-blue-400";
    if (player.color.includes('green')) return "text-green-400";
    if (player.color.includes('red')) return "text-red-400";
    return "text-white";
  };

  const getBorderColor = (playerId) => {
    if (playerId === null) return "border-stone-600";
    const player = players.find(p => p.id === playerId);
    if (!player) return "border-stone-600";

    if (player.color.includes('blue')) return "border-blue-600";
    if (player.color.includes('green')) return "border-green-600";
    if (player.color.includes('red')) return "border-red-600";
    return "border-stone-600";
  };

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Evening Ritual Effect - Runs ONLY when phase changes to evening
  useEffect(() => {
      if (phase === 'evening') {
          handleEveningArrival();
      }
  }, [phase]);

  // --- Helper Logic ---

  const getPlayersAt = (locId) => players.filter(p => p.location === locId && p.realm === 'human');
  
  // Consolidated state update helper
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
          addLog("It is now Afternoon.", "neutral");
      } else if (phase === 'afternoon') {
          setPhase('evening');
          addLog("It is now Evening. Time for the end of day ritual.", "neutral");
      } else {
          // End of Evening -> Next Turn
          setPhase('morning');
          setShowEveningChoice(false);
          let nextIdx = (currentPlayerIdx + 1) % players.length;

          // Increment day count for the next player
          setPlayers(prev => prev.map(p =>
              p.id === nextIdx ? { ...p, dayCount: p.dayCount + 1 } : p
          ));

          setCurrentPlayerIdx(nextIdx);
          addLog(`It is Morning. ${players[nextIdx].name}'s turn begins.`, "neutral", nextIdx);
      }
  };

  // Skip actions and go straight to Evening ritual
  const skipToEvening = () => {
      setPhase('evening');
      addLog(`${currentPlayer.name} skipped the rest of the day.`, "player", currentPlayer.id);
      // Logic triggered by useEffect
  };

  // --- Core Actions ---

  const toggleMoveMode = () => {
      if (phase === 'evening') return;
      if (currentPlayer.realm !== 'human') return;
      
      setIsMoving(!isMoving);
      if (!isMoving) {
          addLog("Select a location to move to.", "player", currentPlayer.id);
      }
  };

  const handleLocationClick = (locId) => {
      if (!isMoving) return;
      
      const currentLocIdx = LOCATIONS.findIndex(l => l.id === currentPlayer.location);
      const targetLocIdx = LOCATIONS.findIndex(l => l.id === locId);
      
      if (Math.abs(currentLocIdx - targetLocIdx) !== 1) {
          addLog("Too far! You can only move to adjacent locations.", "player", currentPlayer.id);
          return;
      }

      handleMove(locId);
      setIsMoving(false);
  };

  const handleMove = (targetLoc) => {
    // Separate the logging variable to avoid side effect inside reducer
    let greedyLog = null;
    
    // Consolidated update
    setPlayers(currentPlayers => {
        // 1. Update current player location
        let updatedPlayers = currentPlayers.map(p => {
            if (p.id === currentPlayerIdx) {
                let next = { ...p, location: targetLoc };
                // Greedy Logic check
                if (p.isGreedy && targetLoc === 'town') {
                    next.merit = Math.max(MIN_MERIT, next.merit - 1);
                    next.dana = next.dana + 1;
                    greedyLog = { message: `${p.name} (Greedy) stole Dana +1 entering Town for Merit -1`, playerId: p.id };
                }
                return next;
            }
            return p;
        });

        const me = updatedPlayers.find(p => p.id === currentPlayerIdx);
        const playersAtTarget = updatedPlayers.filter(p => p.location === targetLoc && p.id !== me.id);

        // 2. Post-Move Triggers (Teachers & Greedy in target location affect arriving player)
        // We need to update 'me' again based on who is there
        let newMe = { ...me };

        // Teachers teach me
        const teachers = playersAtTarget.filter(p => p.isTeacher);
        if (teachers.length > 0 && !newMe.isMeditator) {
            newMe.isMeditator = true;
            // Teachers gain merit
            updatedPlayers = updatedPlayers.map(p => {
                if (p.isTeacher && p.location === targetLoc && p.id !== me.id) {
                    return { ...p, merit: Math.min(MAX_MERIT, p.merit + 1) };
                }
                return p;
            });
        }

        // Greedy players steal from me
        const greedys = playersAtTarget.filter(p => p.isGreedy);
        greedys.forEach(g => {
            if (newMe.dana > 0) {
                newMe.dana = Math.max(0, newMe.dana - 1);
                // Greedy gains
                updatedPlayers = updatedPlayers.map(p => {
                    if (p.id === g.id) {
                        return { ...p, dana: p.dana + 1, merit: Math.max(MIN_MERIT, p.merit - 1) };
                    }
                    return p;
                });
            }
        });

        // Apply updates to 'me' in the array
        return updatedPlayers.map(p => p.id === me.id ? newMe : p);
    });

    if (greedyLog) {
        addLog(greedyLog.message, "player", greedyLog.playerId);
    }

    advancePhase();
    addLog(`${currentPlayer.name} moved to ${targetLoc}.`, "player", currentPlayer.id);
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
            addLog(`${currentPlayer.name} meditated for Delusion -${delusionDrop}`, "player", currentPlayer.id);
            if (newDelusion === 0 && prev.delusion > 0) {
                addLog(`${currentPlayer.name} has cleared all delusion!`, "player", currentPlayer.id);
            }
        } else {
            newInsight += delusionDrop;
            addLog(`${currentPlayer.name} meditated in clarity for Insight +${delusionDrop}`, "player", currentPlayer.id);
        }
        return { delusion: newDelusion, insight: newInsight };
    });
    
    advancePhase();
  };

  const handleGoodDeed = () => {
    if (phase === 'evening') return;
    
    const others = getPlayersAt(currentPlayer.location).filter(p => p.id !== currentPlayer.id);

    updatePlayer(currentPlayer.id, (prev) => ({ 
        dana: prev.dana - 1,
        merit: Math.min(MAX_MERIT, prev.merit + 1)
    }));
    
    if (others.length > 0 && currentPlayer.location !== 'town') {
        const receiver = others[0];
        updatePlayer(receiver.id, (prev) => ({ dana: prev.dana + 1 }));
        addLog(`${currentPlayer.name} gave Dana -1 to ${receiver.name} for Merit +1`, "player", currentPlayer.id);
        addLog(`${receiver.name} received Dana +1 from ${currentPlayer.name}'s good deed`, "player", receiver.id);
    } else {
        addLog(`${currentPlayer.name} donated Dana -1 to temple box for Merit +1`, "player", currentPlayer.id);
    }

    advancePhase();
  };

  const handleBadDeed = () => {
    if (phase === 'evening') return;

    // Capture victims before update
    const victimsWithDana = getPlayersAt(currentPlayer.location).filter(p => p.id !== currentPlayer.id && p.dana > 0);
    const townBonus = currentPlayer.location === 'town' ? 1 : 0;

    // Atomic update for bad deed
    setPlayers(currentPlayers => {
        const me = currentPlayers.find(p => p.id === currentPlayerIdx);
        const totalGain = victimsWithDana.length + townBonus;

        return currentPlayers.map(p => {
            if (p.id === me.id) {
                return {
                    ...p,
                    merit: Math.max(MIN_MERIT, p.merit - totalGain),
                    dana: p.dana + totalGain
                };
            } else if (victimsWithDana.some(v => v.id === p.id)) {
                return { ...p, dana: p.dana - 1 };
            }
            return p;
        });
    });

    // Log the bad deed action
    const totalStolen = victimsWithDana.length + townBonus;
    if (totalStolen > 0) {
        const sources = [];
        if (townBonus > 0) sources.push("Town");
        victimsWithDana.forEach(victim => sources.push(victim.name));

        addLog(`${currentPlayer.name} committed a bad deed and stole Dana +${totalStolen} (${sources.join(", ")}) for Merit -${totalStolen}`, "player", currentPlayer.id);

        // Log individual victim losses
        victimsWithDana.forEach(victim => {
            addLog(`${victim.name} lost Dana -1 from ${currentPlayer.name}'s theft`, "player", victim.id);
        });
    } else {
        addLog(`${currentPlayer.name} committed a bad deed but found nothing to steal for Merit -0`, "player", currentPlayer.id);
    }

    advancePhase();
  };

  const handleAlms = () => {
    if (phase !== 'morning') return;
    
    updatePlayer(currentPlayer.id, (prev) => ({ dana: prev.dana + 1 }));
    addLog(`${currentPlayer.name} collected Dana +1 from alms`, "player", currentPlayer.id);
    advancePhase();
  };

  const handleBecomeMonk = () => {
      const danaLost = currentPlayer.dana;
      updatePlayer(currentPlayer.id, { isMonk: true, dana: 0 });
      addLog(`${currentPlayer.name} ordained as a Monk (lost all Dana -${danaLost})`, "player", currentPlayer.id);
  };

  // --- Evening Logic ---

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
                  addLog(`${p.name} heavenly existence: Delusion -1, Merit -1`, "neutral", p.id);
              } else if (p.realm === 'hell') {
                  newDelusion = p.delusion + 1;
                  newMerit = Math.min(0, p.merit + 1);
                  newLife = Math.abs(newMerit);
                  addLog(`${p.name} hellish suffering: Delusion +1, Merit +1`, "neutral", p.id);
              }

              if (p.realm === 'human') {
                  // Always show evening choice for humans - don't modify life yet
                  setShowEveningChoice(true);
                  return p; // Return unchanged for humans - they will choose their ritual
              } 
              return { ...p, life: newLife, dana: newDana, delusion: newDelusion, merit: newMerit };
          });
      });
  };

  useEffect(() => {
      if (phase === 'evening' && !showEveningChoice && !showReincarnationChoice) {
          if (currentPlayer.realm === 'human') {
              // For humans, always show evening choice - they use the aging track system
              setShowEveningChoice(true);
          } else if (currentPlayer.realm === 'heaven' && (currentPlayer.life <= 0 || currentPlayer.merit === 0)) {
              // Auto-reincarnate from spiritual realms
              const reincarnationData = prepareReincarnation(currentPlayer);
              setPendingReincarnation(reincarnationData);
              setShowReincarnationChoice(true);
          } else if (currentPlayer.realm === 'hell' && (currentPlayer.life <= 0 || currentPlayer.merit === 0)) {
              // Auto-reincarnate from spiritual realms
              const reincarnationData = prepareReincarnation(currentPlayer);
              setPendingReincarnation(reincarnationData);
              setShowReincarnationChoice(true);
          }
      }
  }, [phase, showEveningChoice, showReincarnationChoice, players]);

  const ageNormally = () => {
      const newPosition = currentPlayer.agePosition + 1;

      // Check what's at the new position
      let heartCollected = 0;
      if (newPosition <= 5 && currentPlayer.agePosition < newPosition) {
          // There was a heart at this position that we're knocking off
          heartCollected = 1;
      }

      updatePlayer(currentPlayer.id, (prev) => ({
          agePosition: newPosition,
          life: prev.life + heartCollected // Collect the heart we knocked off
      }));

      if (heartCollected > 0) {
          addLog(`${currentPlayer.name} aged and collected a heart from position ${newPosition}`, "player", currentPlayer.id);
      } else {
          addLog(`${currentPlayer.name} aged through empty position ${newPosition}`, "player", currentPlayer.id);
      }

      setShowEveningChoice(false);
      advancePhase();
  };

  const payToSurvive = () => {
      const currentPos = currentPlayer.agePosition;
      const newPosition = currentPos + 1;

      updatePlayer(currentPlayer.id, (prev) => ({
          dana: prev.dana - 1,
          agePosition: newPosition,
          placedDana: [...(prev.placedDana || []), currentPos] // Place dana at current position before moving
      }));

      addLog(`${currentPlayer.name} paid Dana -1, placed it at position ${currentPos}, and aged to position ${newPosition}`, "player", currentPlayer.id);
      setShowEveningChoice(false);
      advancePhase();
  };

  const chooseToDie = () => {
      setShowEveningChoice(false);
      // Prepare reincarnation data but don't execute yet
      const reincarnationData = prepareReincarnation(currentPlayer);
      setPendingReincarnation(reincarnationData);
      setShowReincarnationChoice(true);
  };

  const chooseNirvana = () => {
      setWinner(currentPlayer);
      addLog(`*** ${currentPlayer.name} HAS ACHIEVED NIRVANA! GAME OVER ***`, "neutral", currentPlayer.id);
      setShowEveningChoice(false);
      advancePhase();
  };

  const chooseBodhisattva = () => {
      // Reincarnate as Teacher in Human Realm, keeping Merit
      updatePlayer(currentPlayer.id, {
          realm: 'human',
          life: INITIAL_LIFE,
          dana: 0,
          insight: 0,
          location: 'town',
          dayCount: 1,
          lifeCount: currentPlayer.lifeCount + 1,
          isMonk: false,
          isTeacher: true,
          isGreedy: false,
          isMeditator: true,
          merit: currentPlayer.merit, // Keep current Merit instead of resetting to 0
          agePosition: 0,
          placedDana: []
      });

      addLog(`${currentPlayer.name} chose the Bodhisattva path - reborn as Teacher keeping Merit ${currentPlayer.merit >= 0 ? '+' : ''}${currentPlayer.merit}`, "player", currentPlayer.id);
      setShowEveningChoice(false);
      advancePhase();
  };

  const prepareReincarnation = (player) => {
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

      if (nextRealm === 'heaven') startingLife = player.merit;
      else if (nextRealm === 'hell') startingLife = Math.abs(player.merit);

      return { type: 'reincarnate', player, nextRealm, nextRole, startingLife };
  };

  const confirmReincarnation = () => {
      if (pendingReincarnation.type === 'victory') {
          setWinner(pendingReincarnation.player);
          addLog(`*** ${pendingReincarnation.player.name} HAS ACHIEVED NIRVANA! GAME OVER ***`, "neutral", pendingReincarnation.player.id);
      } else {
          executeReincarnation(pendingReincarnation);
          advancePhase();
      }
      setShowReincarnationChoice(false);
      setPendingReincarnation(null);
  };

  const handlePassTime = () => {
      handleEveningArrival();
      advancePhase();
  };

  const executeReincarnation = ({ player, nextRealm, nextRole, startingLife }) => {
      addLog(`${player.name} has died.`, "player", player.id);

      if (nextRole.isTeacher) nextRole.isMeditator = true;

      let newMerit = player.merit;
      if (player.realm !== 'human') newMerit = 0;

      updatePlayer(player.id, {
          realm: nextRealm,
          life: startingLife,
          dana: 0,
          insight: 0,
          location: 'town',
          dayCount: 1,
          lifeCount: player.lifeCount + 1, // Increment life counter
          isMonk: nextRole.isMonk,
          isTeacher: nextRole.isTeacher,
          isGreedy: nextRole.isGreedy,
          isMeditator: nextRole.isMeditator,
          merit: newMerit,
          agePosition: 0, // Reset aging track
          placedDana: []  // Clear placed dana
      });

      addLog(`${player.name} reincarnated in ${nextRealm} Realm!`, "player", player.id);
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
      if (phase === 'morning') return <Sunrise size={14} className="text-yellow-600"/>;
      if (phase === 'afternoon') return <Sun size={14} className="text-orange-500"/>;
      return <Moon size={14} className="text-indigo-600"/>;
  };

  const ActionButton = ({ label, icon, disabled, onClick, active, mandatory = false }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded border-2 shadow-sm transition-all text-xs font-bold
            ${active ? 'border-blue-400 bg-blue-50 shadow-lg' : ''}
            ${mandatory ? 'bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100' : ''}
            ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : !mandatory && !active ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400' : ''}
        `}
      >
         <span className="uppercase">{label}</span>
         {icon && <span className="flex items-center gap-1">{icon}</span>}
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
                  {/* Karma Section */}
                  <div className="border-b border-gray-300 pb-1">
                      <div className="text-[10px] text-gray-500 font-bold mb-1 text-center">
                          KARMA
                      </div>
                      <div className="flex items-start justify-between gap-1">
                          <div className="flex-1">
                              <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1"><ArrowUp size={10}/> MERIT <ArrowDown size={10}/></div>
                              <MeritSlider merit={player.merit} realm={player.realm} playerColor={player.color} />
                          </div>
                          <div className="flex-1">
                              <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1"><Cloud size={10}/> DELUSION</div>
                              <DelusionGrid delusion={player.delusion} />
                          </div>
                      </div>
                  </div>

                  {/* Life Section - Greyed out in spiritual realms */}
                  <div className={`flex items-start justify-between gap-1 mt-0.5 ${player.realm !== 'human' ? 'opacity-30 pointer-events-none' : ''}`}>
                      <div className="flex-1">
                          <LifeTrack
                              life={player.life}
                              dana={player.dana}
                              playerColor={player.color}
                              agePosition={player.agePosition || 0}
                              placedDana={player.placedDana || []}
                          />
                      </div>
                      <div className="flex-1">
                          <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1">INSIGHT</div>
                          <div className="transform scale-75 origin-top-left -translate-x-7">
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
    <div className="min-h-screen bg-stone-100 text-slate-800 font-sans p-4 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          <div className="lg:col-span-5 flex flex-col gap-2 overflow-y-auto px-2 py-2 pb-8 h-full">
              {players.map(p => renderPlayerCard(p))}
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 h-full">
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

              <div className="flex gap-4 flex-1 min-h-0">
                  <div className={`p-3 rounded-xl shadow-sm border-2 transition-colors duration-300 w-52 flex flex-col shrink-0 h-[480px] ${getActionPanelStyle()}`}>
                      <h3 className={`font-bold text-xs mb-2 pb-1 border-b ${getActionHeaderStyle()} flex justify-between items-center shrink-0`}>
                          <div className="text-center">
                              <div>{currentPlayer.name}</div>
                              <div className="text-[10px] font-normal">Life: {currentPlayer.lifeCount}</div>
                              <div className="text-[10px] font-normal">Day: {currentPlayer.dayCount}</div>
                          </div>
                          <span className="flex items-center gap-1 font-normal bg-white/50 px-2 py-0.5 rounded text-[10px] uppercase">
                              {getPhaseIcon()} {phase}
                          </span>
                      </h3>
                      <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0 mb-2">
                          {mustTakeRobes ? (
                              <div className="flex flex-col items-center justify-center h-full gap-2">
                                  <p className="text-xs text-orange-800 text-center font-bold">You have entered the Temple.</p>
                                  <ActionButton label="Ordain" onClick={handleBecomeMonk} mandatory={true} icon={<span className="text-sm">🥣</span>} />
                              </div>
                          ) : currentPlayer.realm === 'human' && !showEveningChoice && phase !== 'evening' ? (
                              <>
                                  <ActionButton label="Move" onClick={toggleMoveMode} active={isMoving} icon={<Move size={14}/>} />
                                  <ActionButton label="Meditate" onClick={handleMeditate} disabled={isMoving || !currentPlayer.isMeditator} icon={<><ArrowDown size={10}/><Cloud size={12}/></>} />
                                  <ActionButton label="Good Deed" onClick={handleGoodDeed} disabled={isMoving || currentPlayer.dana < 1 || !canInteract} icon={<><ArrowDown size={10}/><DanaCoin size={10}/><ArrowUp size={10}/>☯</>} />
                                  <ActionButton label="Bad Deed" onClick={handleBadDeed} disabled={isMoving || !canInteract || currentPlayer.dana >= 10} icon={<><ArrowDown size={10}/>☯<ArrowUp size={10}/><DanaCoin size={10}/></>} />
                                  <ActionButton label="Alms" onClick={handleAlms} disabled={isMoving || phase !== 'morning' || !currentPlayer.isMonk || currentPlayer.location !== 'town'} icon={<><ArrowUp size={10}/><DanaCoin size={10}/></>} />
                                  <ActionButton
                                      label="Skip"
                                      onClick={advancePhase}
                                      disabled={isMoving}
                                      icon={<><FastForward size={12}/>{phase === 'morning' ? <Sun size={12} className="text-orange-500"/> : <Moon size={12} className="text-indigo-600"/>}</>}
                                  />
                              </>
                          ) : showEveningChoice ? (
                              <>
                                  <ActionButton
                                      label="Age"
                                      onClick={ageNormally}
                                      disabled={currentPlayer.agePosition >= 5}
                                      icon={<><span className="text-sm">👤</span><ArrowRight size={10}/><span className="text-sm">❤️</span><ArrowDown size={8}/></>}
                                  />
                                  <ActionButton
                                      label="Extend"
                                      onClick={payToSurvive}
                                      disabled={currentPlayer.agePosition < 5 || currentPlayer.dana <= 0}
                                      icon={<><span className="text-sm">👤</span><ArrowRight size={10}/><DanaCoin size={10}/><ArrowDown size={8}/></>}
                                  />
                                  <ActionButton
                                      label="Die"
                                      onClick={chooseToDie}
                                      disabled={currentPlayer.agePosition < 5 && currentPlayer.dana > 0}
                                      icon={<><span className="text-sm">💀</span><RotateCcw size={10}/></>}
                                  />
                                  {currentPlayer.agePosition >= 5 && currentPlayer.insight >= WINNING_INSIGHT && (
                                      <>
                                          <ActionButton
                                              label="Nirvana"
                                              onClick={chooseNirvana}
                                              mandatory={true}
                                              icon={<><span className="text-sm">🪷</span><Trophy size={10}/></>}
                                          />
                                          <ActionButton
                                              label="Bodhisattva"
                                              onClick={chooseBodhisattva}
                                              mandatory={true}
                                              icon={<><span className="text-sm">🧘</span><RotateCcw size={10}/></>}
                                          />
                                      </>
                                  )}
                              </>
                          ) : showReincarnationChoice && pendingReincarnation ? (
                              <div className="flex flex-col gap-2 h-full justify-center animate-in fade-in zoom-in duration-300">
                                  {pendingReincarnation.type === 'victory' ? (
                                      <>
                                          <p className="text-center text-xs font-bold text-green-600 mb-1">🏆 ENLIGHTENMENT ACHIEVED! 🏆</p>
                                          <p className="text-center text-[10px] text-gray-600 mb-2">You have broken the cycle of Samsara</p>
                                          <ActionButton
                                              label="Nirvana"
                                              onClick={confirmReincarnation}
                                              mandatory={true}
                                              icon={<span className="text-sm">🪷</span>}
                                          />
                                      </>
                                  ) : (
                                      <>
                                          <p className="text-center text-xs font-bold text-purple-600 mb-1">Reincarnation</p>
                                          <p className="text-center text-[10px] text-gray-600 mb-2">
                                              You will be reborn in the <span className="font-bold uppercase text-purple-700">{pendingReincarnation.nextRealm}</span> realm
                                              {pendingReincarnation.nextRole.isTeacher && <span className="block text-green-600">as a Teacher</span>}
                                              {pendingReincarnation.nextRole.isGreedy && <span className="block text-red-600">as Greedy</span>}
                                          </p>
                                          <ActionButton
                                              label="Reincarnate"
                                              onClick={confirmReincarnation}
                                              mandatory={true}
                                              icon={<><Skull size={12}/><RotateCcw size={12}/></>}
                                          />
                                      </>
                                  )}
                              </div>
                          ) : phase === 'evening' ? (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                  <p className="text-[10px] text-gray-500">Evening Ritual Complete</p>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                  <p className="text-[10px] text-gray-500">In <span className="font-bold uppercase">{currentPlayer.realm}</span></p>
                                  <ActionButton
                                      label="Pass Time"
                                      onClick={handlePassTime}
                                      mandatory={true}
                                      icon={<ArrowRight size={14}/>}
                                  />
                              </div>
                          )}
                      </div>
                      
                  </div>
                  <div ref={logContainerRef} className="bg-stone-900 p-3 rounded-xl shadow-inner flex-1 min-h-0 overflow-y-auto font-mono text-[10px] border border-stone-700 h-[480px] max-h-[480px]">
                      <div className="font-bold text-stone-500 mb-1 border-b border-stone-700 pb-1 sticky top-0 bg-stone-900">Log</div>
                      <div className="space-y-0.5">
                          {logs.map((log, i) => (
                              <div key={i} className={`opacity-90 border-l-2 pl-2 ${getPlayerLogColor(log.playerId)} ${getBorderColor(log.playerId)}`}>
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