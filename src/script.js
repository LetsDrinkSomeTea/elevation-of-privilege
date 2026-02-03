// --- KONFIGURATION ---
const suits = [
    { code: 'S', name: 'Spoofing' },
    { code: 'T', name: 'Tampering' },
    { code: 'R', name: 'Repudiation' },
    { code: 'I', name: 'Information Disclosure' },
    { code: 'D', name: 'Denial of Service' },
    { code: 'E', name: 'Elevation of Privilege' },
    { code: 'P', name: 'Privacy' }
];

// Define which cards actually exist (based on PDF specs)
const availableCards = {
    'S': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'T': ['3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],  // No 2
    'R': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'I': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'D': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'E': ['5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],  // No 2,3,4
    'P': []  // Privacy not yet available
};

// Build deck from available cards
let allCards = [];
suits.forEach(s => {
    const values = availableCards[s.code] || [];
    values.forEach(v => {
        allCards.push({
            id: `${s.code}${v}`,
            filename: `${s.name}_${v}.jpg`,
            displayName: `${s.name} ${v}`,
            suit: s.code,
            suitName: s.name,
            value: v
        });
    });
});

// --- HELPER FUNCTIONS ---

/**
 * Converts a string to a numeric hash code
 * @param {string} str - The string to hash
 * @returns {number} Positive integer hash value
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Creates a seeded random number generator using Linear Congruential Generator
 * @param {number} seed - The seed value
 * @returns {function} Function that returns pseudorandom numbers between 0 and 1
 */
function seededRandom(seed) {
    let state = seed;
    return function () {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
}

/**
 * Shuffles an array deterministically based on a seed
 * @param {Array} array - The array to shuffle
 * @param {string} seed - The seed string for reproducible shuffling
 * @returns {Array} The shuffled array
 */
function shuffle(array, seed) {
    const seedNum = hashCode(seed);
    const rng = seededRandom(seedNum);

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Validates URL parameters and returns parsed values
 * @returns {Object} Object containing seed, player, and players values
 * @throws {Error} If required parameters are missing or invalid
 */
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        seed: urlParams.get('seed'),
        player: parseInt(urlParams.get('player')),
        players: parseInt(urlParams.get('players'))
    };
}

/**
 * Validates player count is within acceptable range
 * @param {number} count - The number of players
 * @returns {boolean} True if valid, false otherwise
 */
function validatePlayerCount(count) {
    return !isNaN(count) && count >= 2 && count <= 32;
}

/**
 * Validates seed is not empty
 * @param {string} seed - The seed string
 * @returns {boolean} True if valid, false otherwise
 */
function validateSeed(seed) {
    return seed && seed.trim().length > 0;
}

// --- HOST VIEW ---

/**
 * Initializes the host view with all cards grouped by suit
 */
function initHostView() {
    const { seed, players } = getUrlParams();

    if (!validateSeed(seed)) {
        alert('Error: No seed found in URL');
        window.location.href = 'index.html';
        return;
    }

    if (!validatePlayerCount(players)) {
        alert('Error: Invalid player count. Must be between 2-32 players.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('view-title').innerText = `HOST VIEW - Seed: ${seed} | ${players} Players`;

    const container = document.getElementById('cards-container');
    renderHostCards(allCards, container);
}

function renderHostCards(cards, container) {
    // Gruppiere nach Suits
    const grouped = {};
    suits.forEach(s => grouped[s.code] = []);

    cards.forEach(card => {
        grouped[card.suit].push(card);
    });

    // Rendere kompakte Liste pro Suit (nur wenn Karten vorhanden)
    suits.forEach(suit => {
        if (grouped[suit.code].length === 0) return; // Skip empty suits
        
        const suitDiv = document.createElement('div');
        suitDiv.className = 'suit-group';

        const header = document.createElement('h3');
        header.innerText = suit.name;
        header.className = `suit-header suit-${suit.code}`;
        suitDiv.appendChild(header);

        const cardsRow = document.createElement('div');
        cardsRow.className = 'cards-row';

        grouped[suit.code].forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = `card-compact suit-${card.suit}`;
            cardDiv.onclick = () => hostCardClicked(cardDiv, card);

            cardDiv.innerHTML = `
                <img src="img/${card.filename}" onerror="this.style.display='none';">
                <div class="card-value">${card.value}</div>
            `;

            cardsRow.appendChild(cardDiv);
        });

        suitDiv.appendChild(cardsRow);
        container.appendChild(suitDiv);
    });
}

function hostCardClicked(element, card) {
    const overlay = document.getElementById('host-overlay');
    const img = document.getElementById('overlay-img');
    const txt = document.getElementById('overlay-text');

    img.src = `img/${card.filename}`;
    img.alt = card.displayName;
    txt.innerText = card.displayName;

    overlay.style.display = 'flex';
    element.classList.add('played');
}

function closeOverlay() {
    document.getElementById('host-overlay').style.display = 'none';
}

// --- PLAYER VIEW ---

// Storage keys for persistence
const STORAGE_KEY_PREFIX = 'eop_played_';
const STORAGE_KEY_THEME = 'eop_theme';
let currentPlayerKey = '';
let selectedCardIndex = 0;
let playerCards = [];

/**
 * Initializes the player view with their hand of cards
 */
function initPlayerView() {
    const { seed, player, players } = getUrlParams();

    if (!validateSeed(seed) || !player || !validatePlayerCount(players)) {
        alert('Error: Missing or invalid parameters in URL');
        window.location.href = 'index.html';
        return;
    }

    currentPlayerKey = `${STORAGE_KEY_PREFIX}${seed}_${player}`;
    
    document.getElementById('view-title').innerText = `Player ${player} of ${players} - Seed: ${seed}`;

    // Shuffle deck
    let shuffledDeck = shuffle([...allCards], seed);

    // Distribute cards fairly
    const totalCards = shuffledDeck.length;
    const baseCards = Math.floor(totalCards / players);
    const extraCards = totalCards % players;

    // Players 1 through extraCards get baseCards + 1
    // Remaining players get baseCards
    let start = 0;
    for (let i = 1; i < player; i++) {
        start += (i <= extraCards) ? baseCards + 1 : baseCards;
    }
    const myCardCount = (player <= extraCards) ? baseCards + 1 : baseCards;
    const end = start + myCardCount;

    let myHand = shuffledDeck.slice(start, end);

    // Sort by suit and then value
    const valueOrder = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'B': 11, 'D': 12, 'K': 13, 'A': 14 };
    myHand.sort((a, b) => {
        if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
        return valueOrder[a.value] - valueOrder[b.value];
    });

    playerCards = myHand;
    const container = document.getElementById('cards-container');
    renderPlayerCards(myHand, container);
    updateCardCounter();
    restorePlayedCards();
    setupKeyboardNavigation();
}

function renderPlayerCards(cards, container) {
    cards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card card-player size-medium suit-${card.suit}`;
        div.setAttribute('data-card-id', card.id);
        div.setAttribute('data-card-index', index);
        div.setAttribute('tabindex', '0');
        div.onclick = () => playerCardClicked(div, card.id);
        div.onkeydown = (e) => handleCardKeyPress(e, div, card.id);

        div.innerHTML = `
            <img src="img/${card.filename}" 
                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22455%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2220%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E';"
                 alt="${card.displayName}">
            <div class="card-text">${card.displayName}</div>
        `;

        container.appendChild(div);
    });
}

/**
 * Handles card click - toggles played state and persists
 */
function playerCardClicked(element, cardId) {
    element.classList.toggle('played');
    savePlayedState();
    updateCardCounter();
    
    // Add visual feedback animation
    element.style.transition = 'all 0.3s ease';
}

/**
 * Handles keyboard press on cards
 */
function handleCardKeyPress(e, element, cardId) {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        playerCardClicked(element, cardId);
    }
}

/**
 * Sets up global keyboard navigation
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        const cards = document.querySelectorAll('.card-player');
        if (cards.length === 0) return;
        
        let handled = false;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            selectedCardIndex = (selectedCardIndex + 1) % cards.length;
            handled = true;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            selectedCardIndex = (selectedCardIndex - 1 + cards.length) % cards.length;
            handled = true;
        } else if (e.key === ' ' || e.key === 'Enter') {
            if (document.activeElement === document.body || 
                document.activeElement.classList.contains('card-player')) {
                e.preventDefault();
                const cardId = cards[selectedCardIndex].getAttribute('data-card-id');
                playerCardClicked(cards[selectedCardIndex], cardId);
                handled = true;
            }
        } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
            e.preventDefault();
            showHelpModal();
            handled = true;
        } else if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            toggleTheme();
            handled = true;
        }
        
        if (handled && (e.key.startsWith('Arrow') || e.key === ' ' || e.key === 'Enter')) {
            cards[selectedCardIndex].focus();
            cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

/**
 * Saves the played state to localStorage
 */
function savePlayedState() {
    const playedCards = [];
    document.querySelectorAll('.card-player.played').forEach(card => {
        playedCards.push(card.getAttribute('data-card-id'));
    });
    localStorage.setItem(currentPlayerKey, JSON.stringify(playedCards));
}

/**
 * Restores played state from localStorage
 */
function restorePlayedCards() {
    const saved = localStorage.getItem(currentPlayerKey);
    if (!saved) return;
    
    try {
        const playedCards = JSON.parse(saved);
        playedCards.forEach(cardId => {
            const card = document.querySelector(`[data-card-id="${cardId}"]`);
            if (card) {
                card.classList.add('played');
            }
        });
        updateCardCounter();
    } catch (e) {
        console.error('Error restoring played cards:', e);
    }
}

/**
 * Updates the card counter display
 */
function updateCardCounter() {
    let counter = document.getElementById('card-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'card-counter';
        counter.className = 'card-counter';
        document.querySelector('.header-bar').appendChild(counter);
    }
    
    const totalCards = document.querySelectorAll('.card-player').length;
    const playedCards = document.querySelectorAll('.card-player.played').length;
    counter.textContent = `${playedCards} of ${totalCards} played`;
}

function setCardSize(size) {
    // Update all cards
    const cards = document.querySelectorAll('.card-player');
    cards.forEach(card => {
        const wasPlayed = card.classList.contains('played');
        const suitClass = Array.from(card.classList).find(c => c.startsWith('suit-'));
        card.className = `card card-player size-${size} ${suitClass}`;
        if (wasPlayed) {
            card.classList.add('played');
        }
    });
    
    // Update button states
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`size-${size}`).classList.add('active');
    
    // Save preference
    localStorage.setItem('cardSize', size);
}

// Load saved size preference
window.addEventListener('DOMContentLoaded', () => {
    const savedSize = localStorage.getItem('cardSize') || 'medium';
    if (window.location.pathname.includes('player.html')) {
        // Wait for cards to be rendered, then apply size
        setTimeout(() => {
            if (savedSize !== 'medium') {
                setCardSize(savedSize);
            }
        }, 100);
    }
});
