import { Syllable } from './core/hangul-syllable';
import { AsciiFont } from './core/asciiFont';
import { Paths } from './constants';
import { AllUnicodeBlocks } from './core/unicode-block';
import { join } from './util/fs';
import ProgressBar from 'progress';
import chalk from 'chalk';
import { createProgressIndicator, formatHex, LabelWidth, TotalBarWidth } from './util/format';

function* hangulPhonemeCombination(): Generator<[onset: string, nucleus: string, coda: string | undefined]> {
  for (const onset of 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ') {
    for (const nucleus of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') {
      for (const coda of [undefined, ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']) {
        yield [onset, nucleus, coda];
      }
    }
  }
}

export async function renderAsciiFont(): Promise<[asciiFontMap: Record<string, AsciiFont>, status: { error: number, total: number }]> {
  const result: Record<string, AsciiFont> = {};

  for (const block of AllUnicodeBlocks) {
    const length = block.to - block.from + 1;
    const { tick } = createProgressIndicator(`Render ${block.name}`, length);
    for (let charCode = block.from; charCode <= block.to; charCode++) {
      const char = String.fromCharCode(charCode);
      const id = formatHex(charCode, 4);
      let font: AsciiFont | undefined = undefined;
      try {
        font = await AsciiFont.fromFile(join(Paths.glyphBase, block.id, `${char}.txt`));
      } catch {
        try {
          font = await AsciiFont.fromFile(join(Paths.glyphBase, block.id, `U+${id}.txt`));
        } catch {
          /* do nothing */
        }
      }
      tick();
      if (font === undefined) {
        continue;
      }
      result[char] = font;
    }
  }
  const total = 11172;
  let error = 0;

  const { tick } = createProgressIndicator('Render Hangul Syllable', total);

  for (const [onset, nucleus, coda] of hangulPhonemeCombination()) {
    const syllable = await Syllable.of(Paths.glyphBase, onset, nucleus, coda);
    try {
      result[syllable.text] = await syllable.renderGlyph();
    } catch (e) {
      error += 1;
    }
    tick();
  }

  return [result, { error, total }];
}
