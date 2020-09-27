import svg2ttf from 'svg2ttf';
import SVGIcons2SVGFont, { Glyphs } from 'svgicons2svgfont';
import { Readable } from 'stream';
import { AsciiFont } from './core/ascii-font';
import { createWriteStream } from 'fs';
import { join, mkdirs, readFile, writeFile } from './util/fs';
import { OnePixel, Paths, Version } from './constants';
import { createProgressIndicator, formatHex } from './util/format';
import { execute } from './util/executor';

export async function generateFont(map: Record<string, AsciiFont>, versionExtraInfo: string, ts?: number): Promise<void> {
  const entries = Object.entries(map);
  const { tick } = createProgressIndicator('Render SVG', entries.length,);
  const svgFontStream = new SVGIcons2SVGFont({
    fontName: 'dalmoori',
    descent: OnePixel,
    log: () => { /* do nothing */ },
  });

  const glyphList: Glyphs[] = await execute(
    function* () {
      for (const [character, font] of Object.entries(map)) {
        yield async () => {
          const id = formatHex(character.charCodeAt(0), 4);
          const glyphs = Readable.from(await font.renderSvg()) as Glyphs;
          glyphs.metadata = {
            name: 'uni' + id,
            unicode: [...character],
          };

          return glyphs;
        };
      }
    },
    64,
    tick,
  );

  glyphList.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));

  console.log('Writing svg font...');
  for (const glyph of glyphList) {
    svgFontStream.write(glyph);
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

  console.log('Writing ttf font...');
  const ttf = svg2ttf(await readFile(svgFontPath, { encoding: 'utf8' }), {
    description: 'dalmoori: 8x8 dot graphic hangul font',
    copyright: 'Copyright (c) 2020 RanolP and contributors',
    url: 'https://github.com/RanolP/dalmoori-font/',
    version: [Version, versionExtraInfo].filter(Boolean).join(' '),
    ts,
  });
  const ttfBuffer = Buffer.from(ttf.buffer);
  await writeFile(join(fontPath, 'dalmoori.ttf'), ttfBuffer);
}
