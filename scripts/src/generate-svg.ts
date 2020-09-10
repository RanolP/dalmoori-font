import { join, mkdirs, writeFile, rimraf } from './util/fs';
import { AsciiFont } from './core/asciiFont';

export async function generateSvg(map: Record<string, AsciiFont>): Promise<void> {
  const paths = {
    glyphBase: './glyph',
    build: './build',
  };

  console.log(`Cleaning ${paths.build}`);
  await rimraf(paths.build);

  for (const [syllable, font] of Object.entries(map)) {
    const page = (syllable.charCodeAt(0) >> 8).toString(16).toUpperCase();
    const svgPath = join(paths.build, 'svg-glyph', page);
    const asciiFontPath = join(paths.build, 'ascii-font', page);

    console.log(`Writing SVG: ${syllable}`);
    await mkdirs(svgPath);
    await mkdirs(asciiFontPath);
    await writeFile(join(asciiFontPath, `${syllable}.txt`), font.renderAsciiFont(), { encoding: 'utf8' });
    await writeFile(join(svgPath, `${syllable}.svg`), await font.renderSvg(), { encoding: 'utf8' });
  }
}
