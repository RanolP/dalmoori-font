import { Syllable } from './core/hangul-syllable';
import { AsciiFont } from './core/asciiFont';
import { Paths } from './constants';
import { AllUnicodeBlocks } from './core/unicode-block';
import { join } from './util/fs';
import { createProgressIndicator, formatHex } from './util/format';

function* hangulPhonemeCombination(): Generator<[onset: string, nucleus: string, coda: string | undefined]> {
  for (const onset of 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ') {
    for (const nucleus of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') {
      for (const coda of [undefined, ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']) {
        yield [onset, nucleus, coda];
      }
    }
  }
}

export interface RenderResult {
  asciiFontMap: Record<string, AsciiFont>
  pageAvailable: Set<string>,
  status: { error: number, total: number }
}

export async function renderAsciiFont(): Promise<RenderResult> {
  const pageAvailable = new Set<string>();
  const asciiFontMap: Record<string, AsciiFont> = {};

  for (const block of AllUnicodeBlocks) {
    const length = block.to - block.from + 1;
    const { tick } = createProgressIndicator(`Render ${block.name}`, length);
    for (let charCode = block.from; charCode <= block.to; charCode++) {
      pageAvailable.add(formatHex(charCode >> 8, 2));
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
      asciiFontMap[char] = font;
    }
  }
  const total = 11172;
  let error = 0;

  const { tick } = createProgressIndicator('Render Hangul Syllable', total);

  for (const [onset, nucleus, coda] of hangulPhonemeCombination()) {
    const syllable = await Syllable.of(Paths.glyphBase, onset, nucleus, coda);
    try {
      asciiFontMap[syllable.text] = await syllable.renderGlyph();
      pageAvailable.add(formatHex(syllable.text.charCodeAt(0) >> 8, 2));
    } catch (e) {
      error += 1;
    }
    tick();
  }

  return { asciiFontMap, pageAvailable, status: { error, total } };
}
