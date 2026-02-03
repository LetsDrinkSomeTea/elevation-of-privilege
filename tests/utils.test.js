import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashCode, seededRandom, shuffle, validatePlayerCount, validateSeed } from '../src/utils.js';

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
