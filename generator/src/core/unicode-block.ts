export interface UnicodeBlock {
  name: string;
  id: string;
  from: number;
  to: number;
}

export const BasicLatin: UnicodeBlock = {
  name: 'Basic Latin',
  id: 'basic-latin',
  from: 0x0000,
  to: 0x007f,
};
export const Latin1Supplement: UnicodeBlock = {
  name: 'Latin 1 Supplement',
  id: 'latin-1-supplement',
  from: 0x0080,
  to: 0x00ff,
};
export const HangulCompatiblityJamo: UnicodeBlock = {
  name: 'Hangul Compatibility Jamo',
  id: 'hangul-compatibility-jamo',
  from: 0x3130,
  to: 0x318f,
};
export const CjkUnifiedIdeographs: UnicodeBlock = {
  name: 'CJK Unified Ideographs',
  id: 'cjk-unified-ideographs',
  from: 0x4e00,
  to: 0x9fff,
};

export const AllUnicodeBlocks = [
  BasicLatin,
  Latin1Supplement,
  HangulCompatiblityJamo,
  CjkUnifiedIdeographs,
];
