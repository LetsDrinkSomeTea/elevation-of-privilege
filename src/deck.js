/**
 * Deck configuration and card generation for Elevation of Privilege game
 */

export const suits = [
    { code: 'S', name: 'Spoofing' },
    { code: 'T', name: 'Tampering' },
    { code: 'R', name: 'Repudiation' },
    { code: 'I', name: 'Information Disclosure' },
    { code: 'D', name: 'Denial of Service' },
    { code: 'E', name: 'Elevation of Privilege' },
    { code: 'P', name: 'Privacy' }
];

// Define which cards actually exist (based on PDF specs)
export const availableCards = {
    'S': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'T': ['3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],  // No 2
    'R': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'I': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'D': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],
    'E': ['5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'],  // No 2,3,4
    'P': []  // Privacy not yet available
};

/**
 * Builds the complete deck from available cards
 * @returns {Array} Array of card objects
 */
export function buildDeck() {
    const deck = [];
    suits.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
        const values = availableCards[s.code] || [];
        values.forEach(v => {
            deck.push({
                id: `${s.code}${v}`,
                filename: `${s.name}_${v}.jpg`,
                displayName: `${s.name} ${v}`,
                suit: s.code,
                suitName: s.name,
                value: v
            });
        });
    });
    return deck;
}

/**
 * Card value order for sorting
 */
export const valueOrder = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'B': 11, 'D': 12, 'K': 13, 'A': 14
};
