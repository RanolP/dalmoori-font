import svg2ttf from 'svg2ttf';
import SVGIcons2SVGFont, { Glyphs } from 'svgicons2svgfont';
import { Readable } from 'stream';
import { AsciiFont } from './core/asciiFont';
import { createWriteStream } from 'fs';
import { readFile, writeFile } from './util/fs';
import { Version } from './constants';

export async function generateFont(map: Record<string, AsciiFont>): Promise<void> {
  const svgFontStream = new SVGIcons2SVGFont({
    fontName: 'dalmoori',
    descent: 8
  });
  for (const [syllable, font] of Object.entries(map)) {
    const glyphs = Readable.from(await font.renderSvg()) as Glyphs;
    glyphs.metadata = {
      name: 'uni'+syllable.charCodeAt(0).toString(16).toUpperCase(),
      unicode: [...syllable],
    };
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
