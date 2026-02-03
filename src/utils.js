/**
 * Core utility functions for the Elevation of Privilege card game
 * These functions handle shuffling, hashing, and validation
 */

/**
 * Converts a string to a numeric hash code
 * @param {string} str - The string to hash
 * @returns {number} Positive integer hash value
 */
export function hashCode(str) {
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
export function seededRandom(seed) {
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
export function shuffle(array, seed) {
    const seedNum = hashCode(seed);
    const rng = seededRandom(seedNum);

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Validates player count is within acceptable range
 * @param {number} count - The number of players
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePlayerCount(count) {
    return !isNaN(count) && count >= 2 && count <= 32;
}

/**
 * Validates seed is not empty
 * @param {string} seed - The seed string
 * @returns {boolean} True if valid, false otherwise
 */
export function validateSeed(seed) {
    return !!(seed && seed.trim().length > 0);
}

/**
 * Validates URL parameters and returns parsed values
 * @param {URLSearchParams} urlParams - The URL search parameters
 * @returns {Object} Object containing seed, player, and players values
 */
export function getUrlParams(urlParams) {
    return {
        seed: urlParams.get('seed'),
        player: parseInt(urlParams.get('player')),
        players: parseInt(urlParams.get('players'))
    };
}
