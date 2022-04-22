import svg2ttf from 'svg2ttf';
import SVGIcons2SVGFont, { Glyphs } from 'svgicons2svgfont';
import { Readable } from 'stream';
import { AsciiFont } from './core/ascii-font.js';
import { createWriteStream } from 'fs';
import { exists, join, mkdirs, readFile, writeFile } from './util/fs.js';
import { OnePixel, Paths, Version } from './constants.js';
import { createProgressIndicator, formatHex } from './util/format.js';
import { execute } from './util/executor.js';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import { createHash } from 'crypto';

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

export async function generateFont(
  map: Record<string, AsciiFont>,
  versionExtraInfo: string,
  ts?: number
): Promise<void> {
  const entries = Object.entries(map);
  const { tick } = createProgressIndicator('Render SVG', entries.length);
  const svgFontStream = new SVGIcons2SVGFont({
    fontName: 'dalmoori',
    descent: OnePixel,
    log: () => {
      /* do nothing */
    },
  });

  const glyphList: Glyphs[] = await execute(
    function* () {
      for (const [character, font] of Object.entries(map)) {
        yield async () => {
          const page = formatHex(character.charCodeAt(0) >> 8, 2);
          const id = formatHex(character.charCodeAt(0), 4);

          const path = join(Paths.build, 'svg', page);
          await mkdirs(path);

          const file = join(path, `${id}.txt`);

          const newHash = hash(font.renderAsciiFont());

          let svgCache: string | null = null;

          if (await exists(file)) {
            const content = await readFile(file, { encoding: 'utf-8' });
            const firstLinefeed = content.indexOf('\n');
            const oldHash = content.substring(0, firstLinefeed);

            if (oldHash === newHash) {
              svgCache = content.substring(firstLinefeed);
            }
          }

          const svg = svgCache ?? (await font.renderSvg());

          if (svgCache === null) {
            await writeFile(join(path, `${id}.txt`), newHash + '\n' + svg, {
              encoding: 'utf8',
            });
          }

          const glyphs = Readable.from(svg) as Glyphs;
          glyphs.metadata = {
            name: 'uni' + id,
            unicode: [...character],
          };

          return glyphs;
        };
      }
    },
    64,
    tick
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

  await new Promise<void>((resolve, reject) => {
    svgFontStream
      .pipe(createWriteStream(svgFontPath))
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

  console.log('Writing woff font...');
  const { buffer: woffBuffer } = ttf2woff(ttfBuffer);
  await writeFile(join(fontPath, 'dalmoori.woff'), Buffer.from(woffBuffer));

  console.log('Writing woff2 font...');
  const woff2Buffer = ttf2woff2(ttfBuffer);
  await writeFile(join(fontPath, 'dalmoori.woff2'), woff2Buffer);
}
