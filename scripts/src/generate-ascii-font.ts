import { join, mkdirs, writeFile } from './util/fs';
import { AsciiFont } from './core/asciiFont';
import { Paths } from './constants';
import { formatHex, createProgressIndicator } from './util/format';

export async function generateAsciiFont(map: Record<string, AsciiFont>): Promise<void> {
  const entries = Object.entries(map);
  const { tick } = createProgressIndicator('Write Ascii Font', entries.length);
  for (const [character, font] of entries) {
    const page = formatHex(character.charCodeAt(0) >> 8, 2);
    const id = formatHex(character.charCodeAt(0), 4);
    const path = join(Paths.build, page);

    await mkdirs(path);
    await writeFile(join(path, `${id}.txt`), font.renderAsciiFont(), { encoding: 'utf8' });
    tick();
  }
}
