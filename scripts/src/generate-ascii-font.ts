import { join, mkdirs, writeFile } from './util/fs';
import { AsciiFont } from './core/asciiFont';
import { Paths } from './constants';
import ProgressBar from 'progress';
import chalk from 'chalk';

export async function generateAsciiFont(map: Record<string, AsciiFont>): Promise<void> {
  const entries = Object.entries(map);
  const bar = new ProgressBar(
    [
      'Writing Ascii Font'.padEnd(25),
      ':bar',
      '·',
      chalk.green(':current/:total'),
      '·',
      chalk.magenta(':percent'),
      '·',
      chalk.yellow(':rate char/s'),
      '·',
      chalk.blue('ETA :etas')
    ].join(' '),
    {
      total: entries.length,
      complete: chalk.green('━'),
      incomplete: chalk.gray('━'),
      width: 150,
    }
  );
  for (const [character, font] of entries) {
    const page = (character.charCodeAt(0) >> 8).toString(16).toUpperCase().padStart(2, '0');
    const id = character.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
    const path = join(Paths.build, page);

    await mkdirs(path);
    await writeFile(join(path, `${id}.txt`), font.renderAsciiFont(), { encoding: 'utf8' });
    bar.tick();
  }
}
