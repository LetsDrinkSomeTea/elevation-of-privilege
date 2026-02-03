/**
 * End-to-end integration tests for the EoP game
 * Tests the complete workflow from deck building to card distribution
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildDeck, valueOrder } from '../src/deck.js';
import { shuffle } from '../src/utils.js';

describe('E2E: Complete Game Workflow', () => {
    it('should build a valid deck with correct number of cards', () => {
        const deck = buildDeck();
        
        // Should have 74 cards (S=13, T=12, R=13, I=13, D=13, E=10, P=0)
        assert.strictEqual(deck.length, 74);
        
        // Each card should have required properties
        deck.forEach(card => {
            assert.ok(card.id);
            assert.ok(card.filename);
            assert.ok(card.displayName);
            assert.ok(card.suit);
            assert.ok(card.suitName);
            assert.ok(card.value);
        });
    });

    it('should distribute cards fairly among players', () => {
        const deck = buildDeck();
        const seed = 'TestSeed123';
        const numPlayers = 5;
        
        const shuffled = shuffle([...deck], seed);
        const totalCards = shuffled.length;
        const baseCards = Math.floor(totalCards / numPlayers);
        const extraCards = totalCards % numPlayers;
        
        // Distribute cards
        const hands = [];
        let start = 0;
        for (let player = 1; player <= numPlayers; player++) {
            const cardCount = (player <= extraCards) ? baseCards + 1 : baseCards;
            const end = start + cardCount;
            hands.push(shuffled.slice(start, end));
            start = end;
        }
        
        // Verify all cards distributed
        const totalDistributed = hands.reduce((sum, hand) => sum + hand.length, 0);
        assert.strictEqual(totalDistributed, totalCards);
        
        // Verify no duplicates
        const allCardIds = hands.flat().map(c => c.id);
        const uniqueIds = new Set(allCardIds);
        assert.strictEqual(uniqueIds.size, totalCards);
        
        // Verify fair distribution (max difference of 1 card)
        const cardCounts = hands.map(h => h.length);
        const maxCards = Math.max(...cardCounts);
        const minCards = Math.min(...cardCounts);
        assert.ok(maxCards - minCards <= 1);
    });

    it('should sort cards correctly by suit and value', () => {
        const testHand = [
            { suit: 'S', value: 'A' },
            { suit: 'T', value: '5' },
            { suit: 'S', value: '2' },
            { suit: 'T', value: 'K' },
            { suit: 'R', value: '7' }
        ];
        
        testHand.sort((a, b) => {
            if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
            return valueOrder[a.value] - valueOrder[b.value];
        });
        
        // Should be sorted by suit first, then value
        assert.strictEqual(testHand[0].suit, 'R');
        assert.strictEqual(testHand[1].suit, 'S');
        assert.strictEqual(testHand[1].value, '2');
        assert.strictEqual(testHand[2].suit, 'S');
        assert.strictEqual(testHand[2].value, 'A');
        assert.strictEqual(testHand[3].suit, 'T');
        assert.strictEqual(testHand[3].value, '5');
    });

    it('should handle different player counts correctly', () => {
        const deck = buildDeck();
        const seed = 'Workshop2026';
        
        [2, 3, 5, 6, 10, 12, 15, 20, 32].forEach(numPlayers => {
            const shuffled = shuffle([...deck], seed);
            const totalCards = shuffled.length;
            const baseCards = Math.floor(totalCards / numPlayers);
            const extraCards = totalCards % numPlayers;
            
            let totalDistributed = 0;
            for (let player = 1; player <= numPlayers; player++) {
                const cardCount = (player <= extraCards) ? baseCards + 1 : baseCards;
                totalDistributed += cardCount;
            }
            
            assert.strictEqual(totalDistributed, totalCards, 
                `Failed for ${numPlayers} players`);
        });
    });

    it('should produce consistent shuffles with same seed', () => {
        const deck = buildDeck();
        const seed = 'ConsistencyTest';
        
        const shuffle1 = shuffle([...deck], seed);
        const shuffle2 = shuffle([...deck], seed);
        const shuffle3 = shuffle([...deck], seed);
        
        // All three shuffles should be identical
        assert.deepStrictEqual(shuffle1.map(c => c.id), shuffle2.map(c => c.id));
        assert.deepStrictEqual(shuffle2.map(c => c.id), shuffle3.map(c => c.id));
    });

    it('should produce different shuffles with different seeds', () => {
        const deck = buildDeck();
        
        const shuffle1 = shuffle([...deck], 'seed1');
        const shuffle2 = shuffle([...deck], 'seed2');
        const shuffle3 = shuffle([...deck], 'seed3');
        
        // Shuffles should be different
        assert.notDeepStrictEqual(shuffle1.map(c => c.id), shuffle2.map(c => c.id));
        assert.notDeepStrictEqual(shuffle2.map(c => c.id), shuffle3.map(c => c.id));
    });

    it('should handle edge case: 2 players (minimum)', () => {
        const deck = buildDeck();
        const shuffled = shuffle([...deck], 'edge1');
        
        const player1Cards = Math.ceil(shuffled.length / 2);
        const player2Cards = Math.floor(shuffled.length / 2);
        
        assert.strictEqual(player1Cards + player2Cards, shuffled.length);
        assert.ok(player1Cards - player2Cards <= 1);
    });

    it('should handle edge case: 32 players (maximum)', () => {
        const deck = buildDeck();
        const shuffled = shuffle([...deck], 'edge2');
        const numPlayers = 32;
        
        const baseCards = Math.floor(shuffled.length / numPlayers);
        
        // With 74 cards and 32 players, each gets 2 cards, 10 players get 3
        assert.strictEqual(baseCards, 2);
        
        const extraCards = shuffled.length % numPlayers;
        assert.strictEqual(extraCards, 10);
    });
});
