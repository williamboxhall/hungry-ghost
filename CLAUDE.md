# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based board game implementation of "Hungry Ghost" - a Buddhist-themed game prototype. The project is currently a single-page React application with a complete game implementation featuring multiple players, realms (human, heaven, hell), and spiritual progression mechanics.

## Development Commands

Key commands:

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture & Structure

**Technology Stack:**
- React 18.2.0 with JSX
- Vite 4.4.5 (build tool and dev server)
- Tailwind CSS (utility-first styling)
- Lucide React (icon library)
- ES Modules

**Key Files:**
- `src/main.jsx` - Entry point, renders the main game component
- `src/HungryGhostGame.jsx` - Complete game implementation (~820 lines)
- `index.html` - HTML entry point
- `src/index.css` - Global styles (likely Tailwind imports)

**Game Architecture:**
The entire game logic is contained within a single React component (`HungryGhostGame`) using:
- React hooks for state management (useState, useEffect, useRef)
- Complex player state with realms, merit/karma system, life/dana tracking
- Location-based gameplay with movement and interaction mechanics
- Turn-based phases (morning, afternoon, evening)
- Reincarnation system between realms based on merit/karma

**Core Game Entities:**
- **Players**: 3 players (Blue, Green, Red) with tracked states: realm, life, merit, dana, delusion, insight, roles (monk/teacher/meditator/greedy)
- **Locations**: Cave (1 player), Forest (2 players), Town (unlimited), Temple (unlimited)
- **Realms**: Human (main gameplay), Heaven (merit reward), Hell (merit punishment)
- **Actions**: Move, Meditate, Good Deed, Bad Deed, Alms collection

## Key Game Logic Patterns

**State Updates:** The game uses functional setState patterns with complex state transformations, often requiring atomic updates across multiple players simultaneously.

**Phase Management:** Three-phase turns (morning/afternoon/evening) with different available actions per phase.

**Reincarnation Logic:** Players die and reincarnate based on merit score, moving between realms with different starting conditions and abilities.

**Location Interactions:** Movement triggers automatic interactions (teachers teaching arriving players, greedy players stealing from others).

## Development Notes

- The game uses extensive Tailwind classes for styling with custom merit sliders, life/dana tracks, and delusion grids
- Visual components include custom meeples, merit sliders, life/dana tracks, delusion grids, and insight lotus displays
- All game logic is client-side only - no backend integration
- Uses React Strict Mode for development
- ESLint configuration enforces code quality standards