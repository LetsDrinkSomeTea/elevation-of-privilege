# Copilot Instructions - Elevation of Privilege (EoP)

## Project Overview

This is a web-based implementation of the "Elevation of Privilege" card game - a security threat modeling tool originally created by Microsoft. The application allows distributed gameplay where a host shares their screen and players access their individual hands via unique URLs.

## Architecture

### Three-View System

1. **Setup (index.html)** - Generates unique game links using a seed and player count
2. **Host View (host.html)** - Shows all cards grouped by threat category for screen sharing
3. **Player View (player.html)** - Shows each player's individual hand of cards

### Card Distribution Algorithm

- Cards are shuffled using a **seeded random number generator** (implemented in `script.js`)
- The seed ensures all players get the same shuffle when using identical seed values
- Distribution is fair: cards are divided evenly, with extra cards distributed to the first N players
- **Critical**: The same seed + player count always produces identical card distributions across all clients

### Data Flow

- No backend/server - everything runs client-side
- URL parameters (`seed`, `players`, `player`) passed between pages
- Card deck defined in `script.js` (7 suits × 13 values = 91 cards)
- Card images referenced from `img/` directory with pattern: `{SuitName}_{Value}.jpg`

## Key Files

- `script.js` - Core game logic (deck creation, seeded shuffle, card distribution, view initialization)
- `style.css` - Responsive styling with suit-specific colors matching STRIDE+Privacy threat categories
- `generate_cards.py` - Python script to generate card images (uses Pillow)

## STRIDE Categories

The 7 suits correspond to security threat types:

- **S**poofing (red: #800000)
- **T**ampering (green: #70ad47)
- **R**epudiation (yellow: #ffc000)
- **I**nformation Disclosure (cyan: #49b7ad)
- **D**enial of Service (gray: #404040)
- **E**levation of Privilege (blue: #5b9bd5)
- **P**rivacy (purple: #7030a0)

Card values: 2-10, B (Bube/Jack), D (Dame/Queen), K (König/King), A (Ass/Ace)

## Development

**Generate card images:**

```bash
python generate_cards.py
```

This creates 91 JPG images in the `img/` directory.

**Testing:**
Open `index.html` in a browser - no build step or dev server required.

## Conventions

- German UI labels (e.g., "Spieler", "Bube", "Dame", "König")
- Card filenames use English suit names: `Spoofing_A.jpg`, `Privacy_7.jpg`
- Suit codes in JS: S, T, R, I, D, E, P (single letters for compact storage)
- Player numbering starts at 1 (not 0)
- Card state is managed via CSS class `.played` (toggles opacity/grayscale)
