export interface CacheResult<T> {
    value: T;
    storedAt: number;
    ageMs: number;
    fresh: boolean;
}

/**
 * Single-entry in-memory TTL cache. Entries stay readable after the TTL expires
 * so callers can serve stale data on upstream failures (D-004).
 */
export class TtlCache<T> {
    private entry: { value: T; storedAt: number } | null = null;

    constructor(
        private readonly ttlMs: number,
        private readonly now: () => number = Date.now,
    ) {}

    set(value: T): void {
        this.entry = { value, storedAt: this.now() };
    }

    get(): CacheResult<T> | null {
        if (!this.entry) {
            return null;
        }

        const ageMs = this.now() - this.entry.storedAt;
        return {
            value: this.entry.value,
            storedAt: this.entry.storedAt,
            ageMs,
            fresh: ageMs <= this.ttlMs,
        };
    }

    clear(): void {
        this.entry = null;
    }
}
