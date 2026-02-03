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

// --- HELPER FUNKTIONEN ---

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function seededRandom(seed) {
    let state = seed;
    return function () {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
}

function shuffle(array, seed) {
    const seedNum = hashCode(seed);
    const rng = seededRandom(seedNum);

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        seed: urlParams.get('seed'),
        player: parseInt(urlParams.get('player')),
        players: parseInt(urlParams.get('players'))
    };
}

// --- HOST VIEW ---

function initHostView() {
    const { seed, players } = getUrlParams();

    if (!seed) {
        alert('Fehler: Kein Seed in URL gefunden');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('view-title').innerText = `HOST VIEW - Seed: ${seed} | ${players} Spieler`;

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

function initPlayerView() {
    const { seed, player, players } = getUrlParams();

    if (!seed || !player || !players) {
        alert('Fehler: Fehlende Parameter in URL');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('view-title').innerText = `Spieler ${player} von ${players} - Seed: ${seed}`;

    // Deck mischen
    let shuffledDeck = shuffle([...allCards], seed);

    // Karten fair austeilen
    const totalCards = shuffledDeck.length;
    const baseCards = Math.floor(totalCards / players);
    const extraCards = totalCards % players;

    // Spieler 1 bis extraCards bekommen baseCards + 1
    // Restliche Spieler bekommen baseCards
    let start = 0;
    for (let i = 1; i < player; i++) {
        start += (i <= extraCards) ? baseCards + 1 : baseCards;
    }
    const myCardCount = (player <= extraCards) ? baseCards + 1 : baseCards;
    const end = start + myCardCount;

    let myHand = shuffledDeck.slice(start, end);

    // Sortiere nach Suit und dann Wert
    const valueOrder = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'B': 11, 'D': 12, 'K': 13, 'A': 14 };
    myHand.sort((a, b) => {
        if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
        return valueOrder[a.value] - valueOrder[b.value];
    });

    const container = document.getElementById('cards-container');
    renderPlayerCards(myHand, container);
}

function renderPlayerCards(cards, container) {
    cards.forEach(card => {
        const div = document.createElement('div');
        div.className = `card card-player size-medium suit-${card.suit}`;
        div.onclick = () => playerCardClicked(div);

        div.innerHTML = `
            <img src="img/${card.filename}" onerror="this.style.display='none';">
            <div class="card-text">${card.displayName}</div>
        `;

        container.appendChild(div);
    });
}

function playerCardClicked(element) {
    element.classList.toggle('played');
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
