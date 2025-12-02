import { describe, expect, it, vi } from 'vitest';
import { ObjectPool } from '@systems/poolManager.js';

describe('ObjectPool', () => {
  it('reuses released objects', () => {
    const factory = vi.fn(() => ({ value: 0 }));
    const pool = new ObjectPool(factory);

    const first = pool.acquire();
    expect(factory).toHaveBeenCalledTimes(1);

    pool.release(first);
    expect(pool.size()).toBe(1);

    const second = pool.acquire();
    expect(second).toBe(first);
    expect(pool.size()).toBe(0);
  });

  it('clears pooled instances', () => {
    const pool = new ObjectPool(() => ({ value: 1 }));
    const item = pool.acquire();
    pool.release(item);
    pool.release({ value: 2 });

    expect(pool.size()).toBe(2);
    pool.clear();
    expect(pool.size()).toBe(0);
  });
});
