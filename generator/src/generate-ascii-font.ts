import { join, mkdirs, writeFile } from './util/fs.js';
import { AsciiFont } from './core/ascii-font.js';
import { Paths } from './constants.js';
import { formatHex, createProgressIndicator } from './util/format.js';
import { execute } from './util/executor.js';

export async function generateAsciiFont(map: Record<string, AsciiFont>): Promise<void> {
  const entries = Object.entries(map);
  const { tick } = createProgressIndicator('Write Ascii Font', entries.length);

  await execute(
    function* () {
      for (const [character, font] of entries) {
        yield async () => {
          const page = formatHex(character.charCodeAt(0) >> 8, 2);
          const id = formatHex(character.charCodeAt(0), 4);
          const path = join(Paths.build, 'ascii-font', page);
      
          await mkdirs(path);
          await writeFile(join(path, `${id}.txt`), font.renderAsciiFont(), { encoding: 'utf8' });
        };
      }
    },
    64,
    tick,
  );
}
