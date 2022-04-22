import { Character, getBlocks, getCharacters } from 'unidata';
import { binarySearch, range } from './algorithm.js';

export interface UnicodeBlock {
  name: string;
  id: number;
  startCode: number;
  endCode: number;
  characterCount: number;
}

const rawBlocks = getBlocks();
const rawCharacters = getCharacters();

export const BLOCKS: UnicodeBlock[] = rawBlocks.map((rawBlock, id) => ({
  name: rawBlock.blockName,
  id,
  startCode: rawBlock.startCode,
  endCode: rawBlock.endCode,
  characterCount: rawBlock.endCode - rawBlock.startCode + 1,
}));
export const BLOCKS_NAME_MAP: Record<string, UnicodeBlock> = Object.fromEntries(BLOCKS.map(block => [block.name, block]));

export function fullCodepointsOf(block: UnicodeBlock): Array<number> { 
  return Array.from(range(block.startCode, block.endCode + 1));
}

export function findCharacter(codepoint: number): Character | null { 
  const index = binarySearch(-1, rawCharacters.length, mid => rawCharacters[mid].code >= codepoint);
  const character = rawCharacters[index];
  return character.code === codepoint ? character : null;
}
