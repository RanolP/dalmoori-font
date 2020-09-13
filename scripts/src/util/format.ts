export const LabelWidth = 35;
export const TotalBarWidth = 150;

export function formatHex(n: number, pad: number): string {
  return n.toString(16).toUpperCase().padStart(pad, '0');
}
