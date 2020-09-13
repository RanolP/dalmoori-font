export interface UnicodeBlock {
  name: string;
  id: string;
  from: number;
  to: number;
  partial?: boolean;
}

export const BasicLatin: UnicodeBlock = {
  name: 'Basic Latin',
  id: 'basic-latin',
  from: 0x0000,
  to: 0x007F,
  partial: true,
};
export const HangulCompatiblityJamo: UnicodeBlock = {
  name: 'Hangul Compatibility Jamo',
  id: 'hangul-compatibility-jamo',
  from: 0x3130,
  to: 0x318F,
  partial: true,
};

export const AllUnicodeBlocks = [
  BasicLatin,
  HangulCompatiblityJamo
];
