export function range(start: number, end: number): Array<number> {
  return Array.from({ length: end - start }).map((_, index) => start + index);
}
