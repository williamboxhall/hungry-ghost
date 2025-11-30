// Game Renderer Module - Pure UI components that render based on player state
// This module contains only React components with no game logic

import React from 'react';
import { Cloud, Heart, Ghost, ArrowRight, User, Sparkles, ArrowUp, ArrowDown, Move, Trophy } from 'lucide-react';

// --- Visual Components ---

export const YinYang = ({ size = 10, className = "", filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    {filled ? (
      // Filled version with proper black and white and visible dots
      <>
        <circle cx="12" cy="12" r="11" fill="white" stroke="black" strokeWidth="1"/>
        <path d="M12 1 A11 11 0 0 0 12 23 A5.5 5.5 0 0 0 12 12 A5.5 5.5 0 0 1 12 1 Z" fill="black"/>
        <circle cx="12" cy="17.5" r="2.5" fill="white"/>
        <circle cx="12" cy="6.5" r="2.5" fill="black"/>
      </>
    ) : (
      // Outline version
      <>
        <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 1 A11 11 0 0 0 12 23 A5.5 5.5 0 0 0 12 12 A5.5 5.5 0 0 1 12 1 Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="6.5" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="12" cy="17.5" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
      </>
    )}
  </svg>
);

export const HeadOutline = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 18c0-4 2.5-6 6-6s6 2 6 6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const DanaCoin = ({ size = 16, className = "", faded = false }) => (
  <div
    className={`rounded-full flex items-center justify-center font-bold shadow-sm leading-none select-none ${faded ? 'bg-stone-200 border-stone-300 text-stone-400' : 'bg-yellow-400 border border-yellow-600 text-yellow-900'} ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.65 }}
  >
    $
  </div>
);

export const Meeple = ({ player, size = "normal" }) => {
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
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-yellow-200 rounded-full"></div>
          </div>
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
export const MeritSlider = ({ merit, realm = 'human', playerColor = '' }) => {
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
      // Hearts fill gaps from 0 up to but NOT including merit marker
      return Array.from({length: merit}, (_, i) => i);
    } else if (realm === 'hell' && merit < 0) {
      // Hearts fill gaps from 0 down to but NOT including merit marker
      return Array.from({length: Math.abs(merit)}, (_, i) => -i);
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
      {/* Merit header: left arrow, yin-yang, right arrow */}
      <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
        {steps.map((step, index) => (
          <div key={step} className="w-5 h-3 flex items-center justify-center text-[8px] text-black font-bold">
            {step === -1 && "←"}
            {step === 0 && <YinYang size={8} filled={true} />}
            {step === 1 && "→"}
          </div>
        ))}
      </div>

      {/* Numbered Labels */}
      <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
        {steps.map((step) => (
          <div key={step} className={`w-5 h-3 flex items-center justify-center text-[8px] font-mono ${getMeritLabelColor(step)}`}>
            {step === 0 ? "0" : step > 0 ? `+${step}` : step}
          </div>
        ))}
      </div>

      {/* Track Container */}
      <div className="relative flex items-center gap-0.5 bg-stone-200/50 rounded-lg border border-stone-300 p-0.5 shadow-inner">
        {/* Sockets */}
        {steps.map((step) => (
            <div
                key={step}
                className="relative z-0 w-5 h-5 rounded shadow-inner flex items-center justify-center bg-stone-300/50 border border-stone-400/50"
            >
                {/* Base yin-yang symbol for empty sockets */}
                <YinYang size={10} className="opacity-50 text-stone-400" filled={false} />

                {/* Hearts for spiritual realms */}
                {isInSpiritualRealm && heartPositions.includes(step) && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Heart size={14} className={`${getHeartColor()} drop-shadow-sm animate-fall-in`} />
                    </div>
                )}

                {merit === step && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <YinYang size={14} filled={true} />
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

// Pure Life & Dana Track - renders based only on player state
export const LifeTrack = ({ player, animations = {} }) => {
    const LIFE_SLOTS = 5;
    const DANA_SLOTS = 10;

    const getHeartColor = (playerColor) => {
        if (playerColor.includes('blue')) return "text-blue-500 fill-blue-500";
        if (playerColor.includes('green')) return "text-green-500 fill-green-500";
        if (playerColor.includes('red')) return "text-red-500 fill-red-500";
        return "text-red-500 fill-red-500";
    };

    // Animation state accessors
    const removingHeart = animations[`${player.id}_removingHeart`];
    const removingCoin = animations[`${player.id}_removingCoin`];

    // Pure rendering logic - all state explicitly passed as parameters
    const renderSlot = (position, playerState, animationState) => {
        const isHeadPosition = playerState.agePosition === position;
        const hasDanaPlaced = playerState.placedDana && playerState.placedDana.includes(position);

        if (position === 0) {
            // Aging position (0)
            return (
                <div key="aging-0" className="relative w-5 h-5 rounded flex items-center justify-center bg-stone-300/50 border border-stone-400/50 shadow-inner">
                    {isHeadPosition ? (
                        <span className="text-sm">👤</span>
                    ) : hasDanaPlaced ? (
                        <DanaCoin size={12} />
                    ) : (
                        <HeadOutline size={12} className="text-stone-400 opacity-50" />
                    )}
                </div>
            );
        } else if (position >= 1 && position <= LIFE_SLOTS) {
            // Life positions (1-5): show hearts or collected state
            const heartCollected = playerState.agePosition >= position; // Head has passed this position

            return (
                <div key={`life-${position}`} className="relative w-5 h-5 rounded flex items-center justify-center bg-stone-300/50 border border-stone-400/50 shadow-inner">
                    {isHeadPosition && (
                        <span className="absolute z-20 text-sm">👤</span>
                    )}
                    {!heartCollected && !isHeadPosition && !hasDanaPlaced && (
                        <Heart size={12} className={`${getHeartColor(playerState.color)} drop-shadow-sm ${animationState.removingHeart === position ? 'animate-heart-removal' : ''}`} />
                    )}
                    {hasDanaPlaced && !isHeadPosition && (
                        <DanaCoin size={12} />
                    )}
                    {heartCollected && !hasDanaPlaced && !isHeadPosition && (
                        <Heart size={12} className="text-stone-400 opacity-50" strokeWidth={1.5} />
                    )}
                </div>
            );
        } else {
            // Dana positions (6-15): show filled/empty based on dana count
            const danaIndex = position - LIFE_SLOTS - 1; // Convert to 0-9 index
            const hasCoin = danaIndex < playerState.dana;

            return (
                <div key={`dana-${danaIndex}`} className="relative w-5 h-5 rounded flex items-center justify-center bg-stone-300/50 border border-stone-400/50 shadow-inner">
                    {hasCoin ? (
                        <DanaCoin size={16} className={animationState.removingCoin === danaIndex ? 'animate-coin-removal' : ''} />
                    ) : (
                        <DanaCoin size={16} faded={true} />
                    )}
                </div>
            );
        }
    };

    return (
        <div className="w-fit">
            {/* Section Header */}
            <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-500 font-bold">👤</div>
                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-500 font-bold">→</div>
            </div>

            {/* Numbered Labels */}
            <div className="flex gap-0.5 items-center mb-0.5 px-0.5">
                <div className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-400 font-mono">0</div>
                {[...Array(LIFE_SLOTS)].map((_, i) => (
                    <div key={`life-label-${i}`} className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-400 font-mono">
                        {i + 1}
                    </div>
                ))}
                {[...Array(DANA_SLOTS)].map((_, i) => (
                    <div key={`dana-label-${i}`} className="w-5 h-3 flex items-center justify-center text-[8px] text-gray-400 font-mono">
                        {LIFE_SLOTS + i + 1}
                    </div>
                ))}
            </div>

            <div className="flex gap-0.5 items-center bg-stone-200/50 p-0.5 rounded-lg border border-stone-300/50 w-fit">
                {/* Render all 16 slots (0 + 5 life + 10 dana) - state passed explicitly */}
                {Array.from({ length: 16 }, (_, i) => renderSlot(i, player, { removingHeart, removingCoin }))}
            </div>
        </div>
    );
};

// Delusion Grid
export const DelusionGrid = ({ delusion, playerColor = '' }) => {
    return (
        <div className="grid grid-cols-10 gap-0.5 w-fit p-0.5">
            {[...Array(30)].map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                    {i < delusion ? (
                        <span className="text-sm">☁️</span>
                    ) : (
                        <div className="w-4 h-4 rounded-full border border-stone-300 bg-stone-100 opacity-40"></div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Insight Lotus
export const InsightLotus = ({ insight }) => {
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

// Action Button Component
export const ActionButton = ({ label, icon, disabled, onClick, active, mandatory = false }) => (
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

// Player Card Renderer
export const PlayerCard = ({ player, isActive, animations = {} }) => {
    let bgClass = "bg-gray-50", borderClass = "border-gray-200";
    if (player.color.includes('blue')) { bgClass = "bg-blue-50"; borderClass = "border-blue-200"; }
    if (player.color.includes('green')) { bgClass = "bg-green-50"; borderClass = "border-green-200"; }
    if (player.color.includes('red')) { bgClass = "bg-red-50"; borderClass = "border-red-200"; }

    return (
        <div className={`p-1.5 rounded-xl border-2 transition-all duration-300 ${isActive ? 'ring-4 ring-yellow-400 shadow-xl scale-[1.02] z-10' : 'scale-100 z-0'} ${bgClass} ${borderClass} flex flex-col gap-1 relative shadow-sm`}>
            <div className="flex flex-col gap-1">
                {/* Karma Section */}
                <div className="border-b border-gray-300 pb-1">
                    <div className="text-[10px] text-gray-500 font-bold mb-1 text-center">
                        KARMA
                    </div>
                    <div className="flex items-start justify-between gap-1">
                        <div className="flex-1">
                            <MeritSlider merit={player.merit} realm={player.realm} playerColor={player.color} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-end">
                                <DelusionGrid delusion={player.delusion} playerColor={player.color} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Life Section - Greyed out in spiritual realms */}
                <div className={`flex items-start gap-1 mt-0.5 ${player.realm !== 'human' ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="flex-1">
                        <LifeTrack player={player} animations={animations} />
                    </div>
                    <div className="w-32">
                        <div className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center justify-center gap-1">
                            <span className="text-sm">🪷</span>
                        </div>
                        <div className="flex justify-start">
                            <div className="transform scale-75 -ml-20">
                                <InsightLotus insight={player.insight} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Location Renderer
export const LocationCard = ({ location, playersHere, isCurrentLoc, isMoveTarget, isDimmed, isNormal, onLocationClick }) => {
    return (
      <div onClick={() => onLocationClick(location.id)} className={`relative flex flex-col items-center p-2 border-2 rounded-lg w-28 h-28 shrink-0 transition-all duration-300 ${isCurrentLoc ? 'border-yellow-400 bg-yellow-50 shadow-md z-10 scale-105' : ''} ${isMoveTarget ? 'border-green-400 bg-green-50 cursor-pointer shadow-lg scale-105 z-10 animate-pulse' : ''} ${isDimmed ? 'border-gray-200 bg-gray-100 opacity-40 grayscale' : ''} ${isNormal && !isCurrentLoc ? 'border-gray-200 bg-white opacity-90' : ''}`}>
        <div className="absolute top-2 w-full text-center">
            <div className="font-bold text-gray-700 leading-none">{location.name}</div>
            <div className="text-[10px] text-gray-400 mt-1">
                {location.id === 'forest' ? 'Max 2' : location.id === 'cave' ? 'Max 1' : ''}
            </div>
        </div>
        <div className="absolute bottom-2 w-full flex justify-center gap-1 px-1">
            {playersHere.map(p => (<Meeple key={p.id} player={p} size="small" />))}
        </div>
      </div>
    );
};

// UI Helper Functions
export const getPlayerLogColor = (playerId, players) => {
    if (playerId === null) return "text-white";
    const player = players.find(p => p.id === playerId);
    if (!player) return "text-white";

    if (player.color.includes('blue')) return "text-blue-400";
    if (player.color.includes('green')) return "text-green-400";
    if (player.color.includes('red')) return "text-red-400";
    return "text-white";
};

export const getBorderColor = (playerId, players) => {
    if (playerId === null) return "border-stone-600";
    const player = players.find(p => p.id === playerId);
    if (!player) return "border-stone-600";

    if (player.color.includes('blue')) return "border-blue-600";
    if (player.color.includes('green')) return "border-green-600";
    if (player.color.includes('red')) return "border-red-600";
    return "border-stone-600";
};

export const getActionPanelStyle = (currentPlayer) => {
    if (currentPlayer.color.includes('blue')) return "border-blue-300 bg-blue-50/50";
    if (currentPlayer.color.includes('green')) return "border-green-300 bg-green-50/50";
    if (currentPlayer.color.includes('red')) return "border-red-300 bg-red-50/50";
    return "border-stone-200 bg-white";
};

export const getActionHeaderStyle = (currentPlayer) => {
    if (currentPlayer.color.includes('blue')) return "text-blue-700 border-blue-200";
    if (currentPlayer.color.includes('green')) return "text-green-700 border-green-200";
    if (currentPlayer.color.includes('red')) return "text-red-700 border-red-200";
    return "text-gray-700 border-b";
};

export const getPhaseIcon = (phase) => {
    if (phase === 'morning') return <span className="text-sm">🌅</span>;
    if (phase === 'afternoon') return <span className="text-sm">☀️</span>;
    return <span className="text-sm">🌙</span>;
};