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
