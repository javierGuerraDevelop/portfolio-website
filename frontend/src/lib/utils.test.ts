import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
    it('joins class names', () => {
        expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
    });

    it('keeps the last conflicting tailwind class', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('ignores falsy values', () => {
        expect(cn('text-sm', undefined, null, false)).toBe('text-sm');
    });
});
