import { Syllable } from './core/syllable';
import { AsciiFont } from './core/asciiFont';
import { Paths } from './constants';

export async function renderAsciiFont(): Promise<[asciiFontMap: Record<string, AsciiFont>, status: { ok: number, error: number, whole: number }]> {
  const result: Record<string, AsciiFont> = {};

  const whole = 11172;
  let error = 0;
  let current = 0;
  for (const onset of 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ') {
    for (const nucleus of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') {
      for (const coda of [undefined, ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']) {
        current += 1;
        const syllable = await Syllable.of(Paths.glyphBase, onset, nucleus, coda);
        try {
          result[syllable.text] = await syllable.renderGlyph();

          console.log(`${syllable.text} (${(100 * current / whole).toFixed(2)}%)`);
        } catch (e) {
          console.log(`${syllable.text} (${(100 * current / whole).toFixed(2)}%)`, e instanceof Error ? e.message : e);
          error += 1;
        }

      }
    }
  }

  return [result, { ok: current - error, error, whole }];
}
