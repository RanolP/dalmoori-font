import { Syllable } from './core/hangul-syllable';
import { AsciiFont } from './core/ascii-font';
import { Paths } from './constants';
import { AllUnicodeBlocks } from './core/unicode-block';
import { join } from './util/fs';
import { createProgressIndicator, formatHex } from './util/format';
import { execute } from './util/executor';

function* hangulPhonemeCombination(): Generator<[onset: string, nucleus: string, coda: string | undefined]> {
  for (const onset of 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ') {
    for (const nucleus of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') {
      for (const coda of [undefined, ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']) {
        yield [onset, nucleus, coda];
      }
    }
  }
}

export type AsciiFontMap = Record<string, AsciiFont>;

export async function renderAsciiFont(): Promise<AsciiFontMap> {
  const asciiFontMap: AsciiFontMap = {};

  for (const block of AllUnicodeBlocks) {
    const length = block.to - block.from + 1;
    const { tick } = createProgressIndicator(`Render ${block.name}`, length);

    await execute(
      function* () {
        for (let charCode = block.from; charCode <= block.to; charCode++) {
          yield async () => {
            const char = String.fromCharCode(charCode);
            const id = formatHex(charCode, 4);
            let font: AsciiFont | undefined = undefined;
            try {
              font = await AsciiFont.fromFile(join(Paths.glyphBase, block.id, `${char}.txt`));
            } catch {
              try {
                font = await AsciiFont.fromFile(join(Paths.glyphBase, block.id, `U+${id}.txt`));
              } catch {
                try {
                  font = await AsciiFont.fromFile(join(Paths.glyphBase, block.id, id.substring(0, 2), `${char}.txt`));
                } catch {
                  try {
                    font = await AsciiFont.fromFile(join(Paths.glyphBase, block.id, id.substring(0, 2), `U+${id}.txt`));
                  } catch {
                    /* do nothing */
                  }
                }
              }
            }
            if (font !== undefined) {
              asciiFontMap[char] = font;
            }
          };
        }
      },
      64,
      tick,
    );
  }

  const { tick } = createProgressIndicator('Render Hangul Syllable', 11172);

  await execute(
    function* () {
      for (const [onset, nucleus, coda] of hangulPhonemeCombination()) {
        yield async () => {
          const syllable = await Syllable.of(Paths.glyphBase, onset, nucleus, coda);
          try {
            asciiFontMap[syllable.text] = await syllable.renderGlyph();
          } catch (e) {
            /* do nothing */
          }
        };
      }
    },
    64,
    tick,
  );

  return asciiFontMap;
}
