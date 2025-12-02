export class ObjectPool<T> {
  private pool: T[] = [];

  constructor(private readonly factory: () => T) {}

  acquire(): T {
    const item = this.pool.length > 0 ? this.pool.pop() : undefined;
    return item !== undefined ? item : this.factory();
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  clear(): void {
    this.pool.length = 0;
  }

  size(): number {
    return this.pool.length;
  }
}
