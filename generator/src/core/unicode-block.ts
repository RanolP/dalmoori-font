export const enum Language {
  Korean = 'ko',
  English = 'en',
}

export interface UnicodeBlock {
  name: Record<Language, string>;
  id: string;
  from: number;
  to: number;
  total?: number;
  comment?: Record<Language, string>;
}

export const BasicLatin: UnicodeBlock = {
  name: {
    [Language.English]: 'Basic Latin',
    [Language.Korean]: '기본 라틴 문자',
  },
  id: 'basic-latin',
  from: 0x0000,
  to: 0x007f,
  comment: {
    [Language.English]: 'Without Control Characters',
    [Language.Korean]: '제어 문자 제외',
  },
};
export const Latin1Supplement: UnicodeBlock = {
  name: {
    [Language.English]: 'Latin 1 Supplement',
    [Language.Korean]: '라틴 1 보충',
  },
  id: 'latin-1-supplement',
  from: 0x0080,
  to: 0x00ff,
  comment: {
    [Language.English]: 'Without Control/Whitespace Characters',
    [Language.Korean]: '제어·공백 문자 제외',
  },
};
export const HangulCompatiblityJamo: UnicodeBlock = {
  name: {
    [Language.English]: 'Hangul Compatibility Jamo',
    [Language.Korean]: '한글 호환 자모',
  },
  id: 'hangul-compatibility-jamo',
  from: 0x3130,
  to: 0x318f,
  comment: {
    [Language.English]: 'All of Modern Hangul Jamo',
    [Language.Korean]: '현대 한글 전체',
  },
};
export const HangulSyllable: UnicodeBlock = {
  name: {
    [Language.English]: 'Hangul Syllable',
    [Language.Korean]: '한글 음절',
  },
  id: 'hangul-syllable',
  from: 0xac00,
  to: 0xd7af,
  total: 11172,
};
export const CjkUnifiedIdeographs: UnicodeBlock = {
  name: {
    [Language.English]: 'CJK Unified Ideographs',
    [Language.Korean]: '한중일 통합 한자',
  },
  id: 'cjk-unified-ideographs',
  from: 0x4e00,
  to: 0x9fff,
  comment: {
    [Language.English]:
      'Toward 1800 Characters of Korean Middle/High School\'s Basic Hanja!',
    [Language.Korean]: '대한민국 중고등학교 기초한자 1800자 향해서!',
  },
};

export const AllUnicodeBlocks = [
  BasicLatin,
  Latin1Supplement,
  HangulCompatiblityJamo,
  HangulSyllable,
  CjkUnifiedIdeographs,
];
