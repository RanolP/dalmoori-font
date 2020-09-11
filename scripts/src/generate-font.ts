import svg2ttf from 'svg2ttf';
import SVGIcons2SVGFont, { Glyphs } from 'svgicons2svgfont';
import { Readable } from 'stream';
import { AsciiFont } from './core/asciiFont';
import { createWriteStream } from 'fs';
import { readFile, writeFile } from './util/fs';
import { Version } from './constants';
import ProgressBar from 'progress';
import chalk from 'chalk';

export async function generateFont(map: Record<string, AsciiFont>): Promise<void> {
  const entries = Object.entries(map);
  const bar = new ProgressBar(
    [
      chalk.green('Rendering SVG'.padEnd(30)),
      ':bar',
      '·',
      chalk.green(':current/:total'),
      '·',
      chalk.magenta(':percent'),
      '·',
      chalk.yellow(':rate char/s'),
      '·',
      chalk.blue(':etas'),
      '·',
      ':text',
    ].join(' '),
    {
      total: entries.length,
      complete: chalk.green('━'),
      incomplete: chalk.gray('━'),
    }
  );
  const svgFontStream = new SVGIcons2SVGFont({
    fontName: 'dalmoori',
    descent: 8,
    log: undefined,
  });
  for (const [character, font] of Object.entries(map)) {
    const id = character.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
    const glyphs = Readable.from(await font.renderSvg()) as Glyphs;
    glyphs.metadata = {
      name: 'uni'+id,
      unicode: [...character],
    };
    bar.tick({ text: `${character} (U+${id})` });
    svgFontStream.write(glyphs);
  }

  svgFontStream.end();

  await new Promise((resolve, reject) => {
    svgFontStream.pipe(createWriteStream('../font/dalmoori.svg'))
      .on('finish', () => {
        resolve();
      })
      .on('error', (err) => {
        if (err) {
          reject(err);
        }
      });
  });

  const ttf = svg2ttf(await readFile('../font/dalmoori.svg', { encoding: 'utf8' }), {
    description: 'dalmoori: 8x8 dot graphic hangul font',
    copyright: 'Copyright (c) 2020 RanolP and contributors',
    url: 'https://github.com/RanolP/dalmoori-font/',
    version: Version,
  });
  const ttfBuffer = Buffer.from(ttf.buffer);
  await writeFile('../font/dalmoori.ttf', ttfBuffer);
}
