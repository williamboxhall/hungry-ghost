# Hungry Ghost

A web-based Buddhist-themed board game prototype built with React. Players navigate through different realms (human, heaven, hell) accumulating merit and karma, seeking spiritual awakening through meditation and moral choices.

## Features

- **Multi-realm gameplay**: Human, Heaven, and Hell realms with unique mechanics
- **Spiritual progression**: Merit/karma system affecting reincarnation
- **Multiple locations**: Cave, Forest, Town, and Temple with different capacities and benefits
- **Role system**: Players can become Monks, Teachers, Meditators, or Greedy spirits
- **Turn-based phases**: Morning, Afternoon, and Evening phases with different available actions
- **Victory condition**: Achieve enlightenment by gaining 7 Insight points

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint to check code quality
npm run lint
```

The development server runs on `http://localhost:5173` by default.

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **ESLint** - Code linting

## Game Rules

Players take turns performing actions like moving between locations, meditating to reduce delusion, performing good/bad deeds, and collecting alms. Death leads to reincarnation based on accumulated merit, with the ultimate goal of achieving enlightenment.
