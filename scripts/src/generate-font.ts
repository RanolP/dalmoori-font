import svg2ttf from 'svg2ttf';
import SVGIcons2SVGFont, { Glyphs } from 'svgicons2svgfont';
import { Readable } from 'stream';
import { AsciiFont } from './core/asciiFont';
import { createWriteStream } from 'fs';
import { readFile, writeFile } from './util/fs';
import { OnePixel, Version } from './constants';
import ProgressBar from 'progress';
import chalk from 'chalk';
import { formatHex, LabelWidth, TotalBarWidth } from './util/format';

export async function generateFont(map: Record<string, AsciiFont>): Promise<void> {
  const entries = Object.entries(map);
  const bar = new ProgressBar(
    [
      'Render SVG'.padEnd(LabelWidth),
      ':bar',
      '·',
      chalk.green(':current/:total'),
      '·',
      chalk.magenta(':percent'),
      '·',
      chalk.yellow(':rate char/s'),
      '·',
      chalk.blue('ETA :etas'),
    ].join(' '),
    {
      total: entries.length,
      complete: chalk.green('━'),
      incomplete: chalk.gray('━'),
      width: TotalBarWidth,
    }
  );
  const svgFontStream = new SVGIcons2SVGFont({
    fontName: 'dalmoori',
    descent: OnePixel,
    log: ()=>{ /* do nothing */},
  });
  for (const [character, font] of Object.entries(map)) {
    const id = formatHex(character.charCodeAt(0), 4);
    const glyphs = Readable.from(await font.renderSvg()) as Glyphs;
    glyphs.metadata = {
      name: 'uni'+id,
      unicode: [...character],
    };
    bar.tick();
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
