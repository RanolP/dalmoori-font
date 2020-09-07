import { join, mkdirs, writeFile } from './util/fs';
import Svgo from 'svgo';
import { Syllable } from './core/syllable';
(async () => {
  const svgo = new Svgo({});
  const paths = {
    glyphBase: './glyph',
    build: './build',
  }
  const whole = 11172;

  let current = 0;
  for (const onset of 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.substring(0, 12)) {
    for (const nucleus of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') {
      for (const coda of [undefined]/*[undefined, ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']*/) {
        current += 1;
        const syllable = new Syllable(paths.glyphBase, onset, nucleus, coda);
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
        }

      }
    }
  }
})();
