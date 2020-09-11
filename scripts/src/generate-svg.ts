import { join, mkdirs, writeFile } from './util/fs';
import { AsciiFont } from './core/asciiFont';
import { Paths } from './constants';

export async function generateSvg(map: Record<string, AsciiFont>): Promise<void> {
  for (const [syllable, font] of Object.entries(map)) {
    const page = (syllable.charCodeAt(0) >> 8).toString(16).toUpperCase();
    const svgPath = join(Paths.build, 'svg-glyph', page);
    const asciiFontPath = join(Paths.build, 'ascii-font', page);

    console.log(`Writing SVG: ${syllable}`);
    await mkdirs(svgPath);
    await mkdirs(asciiFontPath);
    await writeFile(join(asciiFontPath, `${syllable}.txt`), font.renderAsciiFont(), { encoding: 'utf8' });
    await writeFile(join(svgPath, `${syllable}.svg`), await font.renderSvg(), { encoding: 'utf8' });
  }
}
