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
  to: 0x00FF,
  partial: true,
};

export const AllUnicodeBlocks = [
  BasicLatin,
];
