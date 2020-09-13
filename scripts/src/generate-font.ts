import svg2ttf from 'svg2ttf';
import SVGIcons2SVGFont, { Glyphs } from 'svgicons2svgfont';
import { Readable } from 'stream';
import { AsciiFont } from './core/asciiFont';
import { createWriteStream } from 'fs';
import { join, mkdirs, readFile, writeFile } from './util/fs';
import { OnePixel, Paths, Version } from './constants';
import { createProgressIndicator, formatHex } from './util/format';

export async function generateFont(map: Record<string, AsciiFont>): Promise<void> {
  const entries = Object.entries(map);
  const { tick } = createProgressIndicator('Render SVG', entries.length,);
  const svgFontStream = new SVGIcons2SVGFont({
    fontName: 'dalmoori',
    descent: OnePixel,
    log: () => { /* do nothing */ },
  });
  for (const [character, font] of Object.entries(map)) {
    const id = formatHex(character.charCodeAt(0), 4);
    const glyphs = Readable.from(await font.renderSvg()) as Glyphs;
    glyphs.metadata = {
      name: 'uni' + id,
      unicode: [...character],
    };
    tick();
    svgFontStream.write(glyphs);
  }

  svgFontStream.end();

  const fontPath = join(Paths.build, 'font');
  await mkdirs(fontPath);

  const svgFontPath = join(fontPath, 'dalmoori.svg');

  await new Promise((resolve, reject) => {
    svgFontStream.pipe(createWriteStream(svgFontPath))
      .on('finish', () => {
        resolve();
      })
      .on('error', (err) => {
        if (err) {
          reject(err);
        }
      });
  });

  const ttf = svg2ttf(await readFile(svgFontPath, { encoding: 'utf8' }), {
    description: 'dalmoori: 8x8 dot graphic hangul font',
    copyright: 'Copyright (c) 2020 RanolP and contributors',
    url: 'https://github.com/RanolP/dalmoori-font/',
    version: Version,
  });
  const ttfBuffer = Buffer.from(ttf.buffer);
  await writeFile(join(fontPath, 'dalmoori.ttf'), ttfBuffer);
}
