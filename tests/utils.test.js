import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashCode, seededRandom, shuffle, distributeBalanced, validatePlayerCount, validateSeed, sanitizeInput } from '../src/utils.js';

describe('hashCode', () => {
    it('should return the same hash for the same input', () => {
        const hash1 = hashCode('test');
        const hash2 = hashCode('test');
        assert.strictEqual(hash1, hash2);
    });

    it('should return different hashes for different inputs', () => {
        const hash1 = hashCode('test1');
        const hash2 = hashCode('test2');
        assert.notStrictEqual(hash1, hash2);
    });

    it('should return a positive number', () => {
        const hash = hashCode('test');
        assert.ok(hash >= 0);
    });

    it('should handle empty string', () => {
        const hash = hashCode('');
        assert.strictEqual(hash, 0);
    });
});

describe('seededRandom', () => {
    it('should generate reproducible random sequences', () => {
        const rng1 = seededRandom(12345);
        const rng2 = seededRandom(12345);
        
        const seq1 = [rng1(), rng1(), rng1()];
        const seq2 = [rng2(), rng2(), rng2()];
        
        assert.deepStrictEqual(seq1, seq2);
    });

    it('should generate numbers between 0 and 1', () => {
        const rng = seededRandom(12345);
        for (let i = 0; i < 100; i++) {
            const num = rng();
            assert.ok(num >= 0 && num < 1);
        }
    });

    it('should generate different sequences for different seeds', () => {
        const rng1 = seededRandom(12345);
        const rng2 = seededRandom(54321);
        
        assert.notStrictEqual(rng1(), rng2());
    });
});

describe('shuffle', () => {
    it('should shuffle array deterministically based on seed', () => {
        const arr1 = [1, 2, 3, 4, 5];
        const arr2 = [1, 2, 3, 4, 5];
        
        const shuffled1 = shuffle([...arr1], 'test');
        const shuffled2 = shuffle([...arr2], 'test');
        
        assert.deepStrictEqual(shuffled1, shuffled2);
    });

    it('should produce different shuffles for different seeds', () => {
        const arr = [1, 2, 3, 4, 5];
        
        const shuffled1 = shuffle([...arr], 'seed1');
        const shuffled2 = shuffle([...arr], 'seed2');
        
        assert.notDeepStrictEqual(shuffled1, shuffled2);
    });

    it('should contain all original elements', () => {
        const arr = [1, 2, 3, 4, 5];
        const shuffled = shuffle([...arr], 'test');
        
        assert.strictEqual(shuffled.length, arr.length);
        arr.forEach(item => {
            assert.ok(shuffled.includes(item));
        });
    });

    it('should handle empty array', () => {
        const arr = [];
        const shuffled = shuffle([...arr], 'test');
        assert.deepStrictEqual(shuffled, []);
    });

    it('should handle single element array', () => {
        const arr = [1];
        const shuffled = shuffle([...arr], 'test');
        assert.deepStrictEqual(shuffled, [1]);
    });
});

describe('validatePlayerCount', () => {
    it('should return true for valid player counts', () => {
        assert.strictEqual(validatePlayerCount(2), true);
        assert.strictEqual(validatePlayerCount(5), true);
        assert.strictEqual(validatePlayerCount(32), true);
    });

    it('should return false for invalid player counts', () => {
        assert.strictEqual(validatePlayerCount(1), false);
        assert.strictEqual(validatePlayerCount(33), false);
        assert.strictEqual(validatePlayerCount(0), false);
        assert.strictEqual(validatePlayerCount(-5), false);
    });

    it('should return false for NaN', () => {
        assert.strictEqual(validatePlayerCount(NaN), false);
        assert.strictEqual(validatePlayerCount('abc'), false);
    });
});

describe('validateSeed', () => {
    it('should return true for valid seeds', () => {
        assert.strictEqual(validateSeed('test'), true);
        assert.strictEqual(validateSeed('Workshop2026'), true);
        assert.strictEqual(validateSeed('a'), true);
    });

    it('should return false for invalid seeds', () => {
        assert.strictEqual(validateSeed(''), false);
        assert.strictEqual(validateSeed('   '), false);
        // null and undefined will be falsy, but validateSeed expects a string
        // so we check the function handles them gracefully
        assert.strictEqual(validateSeed(null), false);
        assert.strictEqual(validateSeed(undefined), false);
    });
});

describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
        assert.strictEqual(sanitizeInput('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        assert.strictEqual(sanitizeInput('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
    });

    it('should handle quotes and ampersands', () => {
        assert.strictEqual(sanitizeInput('"test"'), '&quot;test&quot;');
        assert.strictEqual(sanitizeInput("'test'"), '&#x27;test&#x27;');
        assert.strictEqual(sanitizeInput('A&B'), 'A&amp;B');
    });

    it('should handle normal text', () => {
        assert.strictEqual(sanitizeInput('Workshop2026'), 'Workshop2026');
        assert.strictEqual(sanitizeInput('test-123_abc'), 'test-123_abc');
    });

    it('should handle empty or null input', () => {
        assert.strictEqual(sanitizeInput(''), '');
        assert.strictEqual(sanitizeInput(null), '');
        assert.strictEqual(sanitizeInput(undefined), '');
    });
});

describe('distributeBalanced', () => {
    // Helper function to create a test deck
    function createTestDeck() {
        const suits = ['S', 'T', 'R', 'I', 'D', 'E'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'];
        const deck = [];
        
        suits.forEach(suit => {
            // E suit only has values from 5 onwards (10 cards)
            const suitValues = suit === 'E' ? values.slice(3) : 
                               // T suit missing 2 (12 cards)
                               suit === 'T' ? values.slice(1) : 
                               // All others have 13 cards
                               values;
            
            suitValues.forEach(value => {
                deck.push({
                    id: `${suit}${value}`,
                    suit: suit,
                    value: value,
                    filename: `${suit}_${value}.jpg`,
                    displayName: `${suit} ${value}`
                });
            });
        });
        
        return deck;
    }

    it('should distribute cards deterministically based on seed', () => {
        const deck = createTestDeck();
        const hands1 = distributeBalanced([...deck], 'test123', 4);
        const hands2 = distributeBalanced([...deck], 'test123', 4);
        
        assert.strictEqual(hands1.length, 4);
        assert.strictEqual(hands2.length, 4);
        assert.deepStrictEqual(hands1, hands2);
        
        // Test with different player counts to ensure determinism holds
        const hands3 = distributeBalanced([...deck], 'workshop2026', 6);
        const hands4 = distributeBalanced([...deck], 'workshop2026', 6);
        assert.deepStrictEqual(hands3, hands4);
        
        // Test with edge case player counts
        const hands5 = distributeBalanced([...deck], 'edge', 2);
        const hands6 = distributeBalanced([...deck], 'edge', 2);
        assert.deepStrictEqual(hands5, hands6);
    });

    it('should produce different distributions for different seeds', () => {
        const deck = createTestDeck();
        const hands1 = distributeBalanced([...deck], 'seed1', 4);
        const hands2 = distributeBalanced([...deck], 'seed2', 4);
        
        assert.notDeepStrictEqual(hands1, hands2);
    });

    it('should distribute all cards exactly once', () => {
        const deck = createTestDeck();
        const playerCount = 6;
        const hands = distributeBalanced([...deck], 'test', playerCount);
        
        // Collect all distributed cards
        const distributedCards = [];
        hands.forEach(hand => {
            hand.forEach(card => distributedCards.push(card.id));
        });
        
        // Verify count matches
        assert.strictEqual(distributedCards.length, deck.length);
        
        // Verify no duplicates
        const uniqueCards = new Set(distributedCards);
        assert.strictEqual(uniqueCards.size, deck.length);
        
        // Verify all original cards are present
        deck.forEach(card => {
            assert.ok(distributedCards.includes(card.id), `Card ${card.id} should be distributed`);
        });
    });

    it('should ensure balanced suit distribution', () => {
        const deck = createTestDeck();
        const playerCount = 6;
        const hands = distributeBalanced([...deck], 'test', playerCount);
        
        // Check each player has cards from multiple suits
        hands.forEach((hand, playerIndex) => {
            const suitsInHand = new Set(hand.map(card => card.suit));
            assert.ok(suitsInHand.size >= 4, `Player ${playerIndex + 1} should have at least 4 different suits`);
        });
    });

    it('should handle 2 players', () => {
        const deck = createTestDeck();
        const hands = distributeBalanced([...deck], 'test', 2);
        
        assert.strictEqual(hands.length, 2);
        
        // Each player should get roughly half the cards
        const totalCards = deck.length;
        assert.ok(Math.abs(hands[0].length - hands[1].length) <= 1);
        assert.strictEqual(hands[0].length + hands[1].length, totalCards);
    });

    it('should handle many players (32)', () => {
        const deck = createTestDeck();
        const playerCount = 32;
        const hands = distributeBalanced([...deck], 'test', playerCount);
        
        assert.strictEqual(hands.length, playerCount);
        
        // Verify all cards distributed
        const totalDistributed = hands.reduce((sum, hand) => sum + hand.length, 0);
        assert.strictEqual(totalDistributed, deck.length);
        
        // Each player should have at least 1 card
        hands.forEach(hand => {
            assert.ok(hand.length >= 1);
        });
    });

    it('should distribute suits evenly in round-robin fashion', () => {
        const deck = createTestDeck();
        const playerCount = 6;
        const hands = distributeBalanced([...deck], 'test', playerCount);
        
        // Count cards per suit for each player
        const suitCounts = hands.map(hand => {
            const counts = {};
            hand.forEach(card => {
                counts[card.suit] = (counts[card.suit] || 0) + 1;
            });
            return counts;
        });
        
        // For each suit, verify distribution is relatively even
        const suits = ['S', 'T', 'R', 'I', 'D', 'E'];
        suits.forEach(suit => {
            const countsForSuit = suitCounts.map(sc => sc[suit] || 0);
            const max = Math.max(...countsForSuit);
            const min = Math.min(...countsForSuit);
            
            // Difference should be at most 1 (or 2 for very uneven distributions)
            assert.ok(max - min <= 2, `Suit ${suit} should be distributed evenly (max: ${max}, min: ${min})`);
        });
    });

    it('should handle empty deck', () => {
        const hands = distributeBalanced([], 'test', 4);
        
        assert.strictEqual(hands.length, 4);
        hands.forEach(hand => {
            assert.strictEqual(hand.length, 0);
        });
    });

    it('should maintain card object integrity', () => {
        const deck = createTestDeck();
        const hands = distributeBalanced([...deck], 'test', 4);
        
        // Verify cards still have all their properties
        hands.forEach(hand => {
            hand.forEach(card => {
                assert.ok(card.id);
                assert.ok(card.suit);
                assert.ok(card.value);
                assert.ok(card.filename);
                assert.ok(card.displayName);
            });
        });
    });
});
