import { describe, expect, it } from 'vitest';
import { TtlCache } from './cache.js';

describe('TtlCache', () => {
    it('reports fresh entries within the TTL', () => {
        let nowMs = 1_000;
        const cache = new TtlCache<string>(500, () => nowMs);

        cache.set('value');
        nowMs += 400;

        expect(cache.get()).toMatchObject({ value: 'value', ageMs: 400, fresh: true });
    });

    it('keeps expired entries readable but not fresh', () => {
        let nowMs = 1_000;
        const cache = new TtlCache<string>(500, () => nowMs);

        cache.set('value');
        nowMs += 700;

        expect(cache.get()).toMatchObject({ value: 'value', ageMs: 700, fresh: false });
    });

    it('returns null when empty and after clear', () => {
        const cache = new TtlCache<string>(500);

        expect(cache.get()).toBeNull();

        cache.set('value');
        cache.clear();

        expect(cache.get()).toBeNull();
    });
});
