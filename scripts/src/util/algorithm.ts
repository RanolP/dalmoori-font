export type IsGreaterOrEqual = boolean;

export function binarySearch(low: number, high: number, compare: (midIndex: number) => IsGreaterOrEqual): number {
  while (1 + low < high) {
    const mid = low + ((high - low) >> 1);
    if (compare(mid)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return high;
}

export function* range(startInclusive: number, endExclusive: number): Generator<number, void, unknown> {
  for (let i = startInclusive; i < endExclusive; i++) {
    yield i;
  }
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  return a * b / gcd(a, b);
}
