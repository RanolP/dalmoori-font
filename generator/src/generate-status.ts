import { Paths } from './constants';
import { join, mkdirs, writeFile } from './util/fs';
import { AsciiFont } from './core/ascii-font';
import { AllUnicodeBlocks, Language } from './core/unicode-block';

export interface BlockStatus {
  currentlySupport: number;
  total: number;
  comment?: Record<Language, string>;
  name: Record<Language, string>;
}

export type FullStatus = Record<string, BlockStatus>;

export async function generateStatus(
  map: Record<string, AsciiFont>
): Promise<void> {
  console.log('Generating status...');

  const status: FullStatus = {};

  for (const block of AllUnicodeBlocks) {
    console.log(`Generating status for ${block.name[Language.English]}...`);
    const total = block.total ?? block.to - block.from + 1;
    const currentlySupport = Array.from({ length: total })
      .map((_, i) => String.fromCharCode(block.from + i))
      .reduce((acc, curr) => acc + (curr in map ? 1 : 0), 0);
    status[block.id] = {
      currentlySupport,
      total,
      comment: block.comment,
      name: block.name,
    };
  }

  await mkdirs(Paths.artifacts);
  await writeFile(
    join(Paths.artifacts, 'status.json'),
    JSON.stringify(status),
    'utf8'
  );
}
