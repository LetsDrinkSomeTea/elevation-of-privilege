/**
 * Main script for Elevation of Privilege card game
 * This file orchestrates the game flow and delegates to specialized modules
 */

import { suits, buildDeck, valueOrder } from './deck.js';
import { distributeBalanced, validatePlayerCount, validateSeed, getUrlParams as getParams, sanitizeInput } from './utils.js';
import { initLanguage, t, toggleLanguage, getCurrentLanguage } from './translations.js';
import { updateCardCounter, updateUILanguage, showHelpModal, closeHelpModal } from './ui.js';

// Build the deck once
const allCards = buildDeck();

// Storage keys for persistence
const STORAGE_KEY_PREFIX = 'eop_played_';
let currentPlayerKey = '';
let selectedCardIndex = 0;

// Make functions globally available for onclick handlers
window.toggleLanguage = toggleLanguage;
window.showHelpModal = showHelpModal;
window.closeHelpModal = closeHelpModal;
window.initHostView = initHostView;
window.initPlayerView = initPlayerView;
window.closeOverlay = closeOverlay;
window.setCardSize = setCardSize;

/**
 * Gets URL parameters specific to this page
 */
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return getParams(urlParams);
}

// ===== HOST VIEW =====

/**
 * Initializes the host view with all cards grouped by suit
 */
function initHostView() {
    initLanguage();
    const { seed, players } = getUrlParams();

    if (!validateSeed(seed)) {
        alert(t('errorNoSeed'));
        window.location.href = 'index.html';
        return;
    }

    if (!validatePlayerCount(players)) {
        alert(t('errorInvalidPlayers'));
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('view-title').innerText = `${t('hostView')} - ${t('seed')} ${sanitizeInput(seed)} | ${players} ${t('players')}`;

    const container = document.getElementById('cards-container');
    renderHostCards(allCards, container);
    
    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = getCurrentLanguage() === 'en' ? 'DE' : 'EN';
    }
    
    const backBtns = document.querySelectorAll('.small-btn');
    backBtns.forEach(btn => {
        if (btn.textContent.includes('Back') || btn.textContent.includes('Zurück')) {
            btn.textContent = t('back');
        }
    });
}

function renderHostCards(cards, container) {
    const grouped = {};
    suits.forEach(s => grouped[s.code] = []);

    cards.forEach(card => {
        grouped[card.suit].push(card);
    });

    suits.forEach(suit => {
        if (grouped[suit.code].length === 0) {
            return;
        }
        
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

// ===== PLAYER VIEW =====

/**
 * Initializes the player view with their hand of cards
 */
function initPlayerView() {
    initLanguage();
    const { seed, player, players } = getUrlParams();

    if (!validateSeed(seed) || !player || !validatePlayerCount(players)) {
        alert(t('errorMissingParams'));
        window.location.href = 'index.html';
        return;
    }

    currentPlayerKey = `${STORAGE_KEY_PREFIX}${seed}_${player}`;
    
    document.getElementById('view-title').innerText = `${t('player')} ${player} ${t('of')} ${players} - ${t('seed')} ${sanitizeInput(seed)}`;

    const playerHands = distributeBalanced([...allCards], seed, players);
    let myHand = playerHands[player - 1];

    myHand.sort((a, b) => {
        if (a.suit !== b.suit) {
            return a.suit.localeCompare(b.suit);
        }
        return valueOrder[a.value] - valueOrder[b.value];
    });

    const container = document.getElementById('cards-container');
    renderPlayerCards(myHand, container);
    updateCounter();
    restorePlayedCards();
    setupKeyboardNavigation();
    updateUILanguage();
}

function renderPlayerCards(cards, container) {
    cards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card card-player size-medium suit-${card.suit}`;
        div.setAttribute('data-card-id', card.id);
        div.setAttribute('data-card-index', index);
        div.setAttribute('tabindex', '0');
        div.onclick = () => playerCardClicked(div, card.id);

        div.innerHTML = `
            <img src="img/${card.filename}" 
                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22455%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2220%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E';"
                 alt="${card.displayName}">
            <div class="card-text">${card.displayName}</div>
        `;

        container.appendChild(div);
    });
}

function playerCardClicked(element) {
    element.classList.toggle('played');
    savePlayedState();
    updateCounter();
    element.style.transition = 'all 0.3s ease';
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        const cards = document.querySelectorAll('.card-player');
        if (cards.length === 0) {
            return;
        }
        
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            selectedCardIndex = (selectedCardIndex + 1) % cards.length;
            cards[selectedCardIndex].focus();
            cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            selectedCardIndex = (selectedCardIndex - 1 + cards.length) % cards.length;
            cards[selectedCardIndex].focus();
            cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            
            const focusedCard = document.activeElement;
            if (focusedCard && focusedCard.classList.contains('card-player')) {
                const cardId = focusedCard.getAttribute('data-card-id');
                playerCardClicked(focusedCard, cardId);
            } else {
                const cardId = cards[selectedCardIndex].getAttribute('data-card-id');
                playerCardClicked(cards[selectedCardIndex], cardId);
            }
        } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
            e.preventDefault();
            showHelpModal();
        }
    });
}

function savePlayedState() {
    const playedCards = [];
    document.querySelectorAll('.card-player.played').forEach(card => {
        playedCards.push(card.getAttribute('data-card-id'));
    });
    localStorage.setItem(currentPlayerKey, JSON.stringify(playedCards));
}

function restorePlayedCards() {
    const saved = localStorage.getItem(currentPlayerKey);
    if (!saved) {
        return;
    }
    
    try {
        const playedCards = JSON.parse(saved);
        playedCards.forEach(cardId => {
            const card = document.querySelector(`[data-card-id="${cardId}"]`);
            if (card) {
                card.classList.add('played');
            }
        });
        updateCounter();
    } catch (e) {
        console.error('Error restoring played cards:', e);
    }
}

function updateCounter() {
    const totalCards = document.querySelectorAll('.card-player').length;
    const playedCards = document.querySelectorAll('.card-player.played').length;
    updateCardCounter(playedCards, totalCards);
}

function setCardSize(size) {
    const cards = document.querySelectorAll('.card-player');
    cards.forEach(card => {
        const wasPlayed = card.classList.contains('played');
        const suitClass = Array.from(card.classList).find(c => c.startsWith('suit-'));
        card.className = `card card-player size-${size} ${suitClass}`;
        if (wasPlayed) {
            card.classList.add('played');
        }
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`size-${size}`).classList.add('active');
    
    localStorage.setItem('cardSize', size);
}

// Load saved size preference
window.addEventListener('DOMContentLoaded', () => {
    const savedSize = localStorage.getItem('cardSize') || 'medium';
    if (window.location.pathname.includes('player.html')) {
        setTimeout(() => {
            if (savedSize !== 'medium') {
                setCardSize(savedSize);
            }
        }, 100);
    }
});
