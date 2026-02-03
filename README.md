# Elevation of Privilege (EoP) 🎮

A web-based implementation of the security threat modeling card game originally created by Microsoft. This digital version enables distributed gameplay where a host shares their screen and players access their individual hands via unique URLs.

[![License: CC BY 3.0](https://img.shields.io/badge/License-CC%20BY%203.0-lightgrey.svg)](https://creativecommons.org/licenses/by/3.0/)

---

## 🚀 Quick Start

### Running Locally

```bash
# Clone the repository
git clone <repo-url>
cd elevation-of-privilege

# Start a local web server (choose one):
python3 -m http.server 8000
# OR
npx serve src

# Open http://localhost:8000 in your browser
```

### Using the Application

1. **Setup:** Go to `index.html`, enter a game seed and player count (2-32)
2. **Host View:** Share the host link via screen sharing - shows all cards by suit
3. **Player Views:** Each player gets their own unique link with their dealt cards
4. **Play:** Players click cards to mark them as played

---

## ✨ Features

- ✅ **Seeded Card Distribution** - Same seed = same shuffle for all players
- ✅ **No Backend Required** - Pure client-side, works offline
- ✅ **Persistent Card State** - Cards remember played/unplayed status
- ✅ **Keyboard Navigation** - Use arrow keys, Space/Enter to play cards
- ✅ **Multi-language** - English/German with auto-detection
- ✅ **Mobile Friendly** - Responsive design with touch support
- ✅ **Help Modal** - Built-in game instructions (press H)
- ✅ **Card Counter** - Shows "X of Y played"

---

## 🎮 How to Play

### Setup

**Before you start:**

1. Draw a diagram of the system you want to threat model before dealing the cards
2. Deal the deck to 3–6 players
3. Play starts with the **3 of Tampering**

### Gameplay

**Taking Turns:**

- Play clockwise
- Each player in turn continues using the suit if they have a card in that suit
- If the player doesn't have a card from that suit, they can use another suit
- Each round is won by the **highest card** played in the suit that was led
- **Exception:** Elevation of Privilege (EoP) cards are **trumps** and win even with lower values

**Playing a Card:**

1. Read the card aloud
2. Announce your threat
3. Record the threat
4. If you can't link the threat to the system, play proceeds without recording

**Between Hands:**

- The winner of a hand selects the card (and suit) to lead the next hand
- Take a few minutes between hands to think about threats

### Scoring

**Points:**

- **+1 point** for identifying a threat on your card
- **+1 point** for taking the trick

**What Makes a Good Threat:**

- Threats should be **clearly articulated**, **testable**, and **addressable**
- In case of argument, ask: _"Would we take an actionable bug, feature request, or design change for that?"_
  - If **yes** → it's a real threat
  - This focuses discussion on actionable threats
- Questions starting with _"There's a way"_ should be read as _"There's a way…and here's how…"_
- Questions starting with _"Your code"_ should be read as _"The code we're collectively creating…and here's how"_

### Special Cards

**Trump Cards (EoP):**

- Elevation of Privilege cards take the trick even with lower values than the suit led

**Open Threat Cards (Aces):**

- The **ace of each suit** is an open threat card
- When played, identify a threat **not listed** on another card
- Use questions on threat cards to help with aces

### Winning

When all cards have been played, **whoever has the most points wins!**

**Remember to have fun!** 🎮

---

## 🎲 Optional Variants

Want to customize your game? Try these variants:

- **Card Passing:** Pass cards after the third trick if you can't tie them to the system
- **Bonus Points:** Double all points and give **+1 point** for identifying threats on other players' cards
- **Riffing:** Players can build on threats and earn **+1 point** per additional threat
- **Time Limit:** Limit riffing to **60 seconds max**
- **Visual Mapping:** Mark up the diagram where each threat occurs

---

## 🛠️ Technical Details

### Architecture

The game uses a **3-view system**:

1. **Setup (`index.html`)** - Generate unique game links using a seed and player count
2. **Host View (`host.html`)** - Shows all cards grouped by STRIDE threat categories
3. **Player View (`player.html`)** - Shows each player's individual hand

### Card Distribution Algorithm

- Uses a **seeded pseudorandom number generator (LCG)** for deterministic shuffling
- Same seed + player count = identical card distribution across all clients
- No server communication needed - all clients independently compute the same shuffle

### STRIDE+Privacy Threat Categories

The deck has 7 suits corresponding to security threat types:

| Suit  | Threat Type            | Cards       | Color  |
| ----- | ---------------------- | ----------- | ------ |
| **S** | Spoofing               | 13 (2-A)    | Red    |
| **T** | Tampering              | 12 (3-A)    | Green  |
| **R** | Repudiation            | 13 (2-A)    | Yellow |
| **I** | Information Disclosure | 13 (2-A)    | Cyan   |
| **D** | Denial of Service      | 13 (2-A)    | Gray   |
| **E** | Elevation of Privilege | 10 (5-A)    | Blue   |
| **P** | Privacy                | 0 (pending) | Purple |

**Total: 74 cards**

### Technology Stack

- **Pure HTML/CSS/JavaScript** - No build step required
- **ES6 Modules** - Modular, maintainable code
- **localStorage API** - Persistent card state
- **No dependencies** - Works completely offline

---

## 🧪 Development

### Running Tests

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
EoP/
├── src/
│   ├── index.html          # Setup page
│   ├── host.html           # Host view (all cards)
│   ├── player.html         # Player view (individual hand)
│   ├── style.css           # Styles
│   ├── script.js           # Main orchestration
│   ├── deck.js             # Card deck configuration
│   ├── utils.js            # Utility functions
│   ├── translations.js     # i18n system
│   ├── ui.js               # UI helpers
│   └── img/                # Card images (74 JPGs)
├── tests/
│   ├── utils.test.js       # Unit tests (29 tests)
│   └── e2e.test.js         # Integration tests (8 tests)
├── Dockerfile              # Docker container
└── package.json            # npm configuration
```

### Code Quality

- ✅ **ESLint** - Code linting and style consistency
- ✅ **JSDoc** - Comprehensive function documentation
- ✅ **Unit Tests** - 29 passing tests for core utilities
- ✅ **E2E Tests** - 8 integration tests for complete workflow
- ✅ **XSS Protection** - Input sanitization for security
- ✅ **CI/CD** - Automated testing, Docker builds, and GitHub Pages deployment

---

## 🚢 Deployment

### Automated CI/CD

This repository includes GitHub Actions workflows for:
- **CI Tests** (`ci.yml`) - Runs ESLint and tests on every push/PR
- **Docker Builds** (`docker-build.yml`) - Builds and publishes to GitHub Container Registry
- **GitHub Pages** (`jekyll-gh-pages.yml`) - Automatically deploys `src/` to GitHub Pages

### Docker

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/<username>/eop:latest
docker run -p 8080:80 ghcr.io/<username>/eop:latest

# OR build locally
docker build -t eop-game .
docker run -p 8080:80 eop-game

# Access at http://localhost:8080
```

### GitHub Pages

The `jekyll-gh-pages.yml` workflow automatically deploys to GitHub Pages on push to `main`.

**Setup:** Go to Settings → Pages → Source: "GitHub Actions"

### Static Hosting (Netlify, Vercel)

Simply deploy the `src/` directory as a static site:

**Netlify:**
- Connect your repo
- Set publish directory to `src`
- Deploy!

**Vercel:**
```bash
vercel --prod src
```

---

## 📝 API Documentation

### URL Parameters

**Setup Page** (`index.html`)

- No parameters required

**Host View** (`host.html`)

- `seed` (string, required) - Game seed for card shuffling
- `players` (integer, 2-32, required) - Total number of players

**Player View** (`player.html`)

- `seed` (string, required) - Game seed for card shuffling
- `players` (integer, 2-32, required) - Total number of players
- `player` (integer, 1-N, required) - This player's number

### localStorage Keys

- `eop_played_${seed}_${player}` - Comma-separated list of played card IDs
- `eop_language` - User's language preference ('en' or 'de')

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

- All tests pass (`npm test`)
- Code passes linting (`npm run lint`)
- New features include tests and documentation

---

## 📜 License

Creative Commons Attribution 3.0 License (CC-BY-3.0)

**Original Game:** ©2010 Microsoft Corporation  
**Translation:** ditis Systeme
**Digitalization:** LetsDrinkSomeTea

---

## 🙏 Acknowledgments

Original game created by **Microsoft**.
