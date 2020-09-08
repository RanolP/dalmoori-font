import { join, mkdirs, writeFile, rimraf } from './util/fs';
import Svgo from 'svgo';
import { Syllable } from './core/syllable';
export async function generateSvg(): Promise<number> {
  const svgo = new Svgo({});
  const paths = {
    glyphBase: './glyph',
    build: './build',
  };
  const whole = 11172;

  await rimraf(paths.build);

  let error = 0;
  let current = 0;
  for (const onset of 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.substring(0, 12)) {
    for (const nucleus of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') {
      for (const coda of [undefined, ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.substring(0, 16)]) {
        current += 1;
        const syllable = await Syllable.of(paths.glyphBase, onset, nucleus, coda);
        const svgPath = join(
          paths.build,
          'svg-glyph',
          (syllable.text.charCodeAt(0) >> 8).toString(16).toUpperCase(),
        );
        const asciiFontPath = join(
          paths.build,
          'ascii-font',
          (syllable.text.charCodeAt(0) >> 8).toString(16).toUpperCase(),
        );
        try {
          await mkdirs(svgPath);
          await mkdirs(asciiFontPath);
          const asciiFontRendered = await syllable.renderAsciiFont();
          await writeFile(join(asciiFontPath, `${syllable.text}.txt`), asciiFontRendered, { encoding: 'utf8' });
          const rendered = await syllable.renderSvg();
          const optimized = await svgo.optimize(rendered);
          await writeFile(join(svgPath, `${syllable.text}.svg`), optimized.data, { encoding: 'utf8' });

          console.log(`${syllable.text} (${(100 * current / whole).toFixed(2)}%)`);
        } catch (e) {
          console.log(`${syllable.text} (${(100 * current / whole).toFixed(2)}%)`, e);
          error += 1;
        }

      }
    }
  }

  console.log(`Processed ${current} (whole ${whole}) but error ${error}`);
  console.log(`${((current - error) * 100 / whole).toFixed(2)}% covered.`);
  return (current - error) * 100 / whole;
}
