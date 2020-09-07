import { PathLike, readFile, join } from '../util/fs';
import { Glyph } from './glyph';

interface VowelMeta {
  right: number;
  bottom: number;
  variant: Record<string, Partial<{ right: number, bottom: number }>>;
}

interface ConsonantMeta {
  codaMinHeight: number;
  nucleusVariant: Record<string, string>;
}

export class Syllable {
  private readonly basepath: string;
  constructor(
    basepath: PathLike,
    private readonly onset: string,
    private readonly nucleus: string,
    private readonly coda?: string) {
    this.basepath = basepath.toString();
  }

  get text(): string {
    const convertOnset = 'ᄀᄁ ᄂ  ᄃᄄᄅ       ᄆᄇᄈ ᄉᄊᄋᄌᄍᄎᄏᄐᄑᄒ';
    const standardNucleus = 'ᅡᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵ';
    const convertCoda = 'ᆨᆩᆪᆫᆬᆭᆮ ᆯᆰᆱᆲᆳᆴᆵᆶᆷᆸ ᆹᆺᆻᆼᆽ ᆾᆿᇀᇁᇂ';

    const compatConsonant = 'ㄱㄲㄳㄴㄵㄶㄷㄸㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅃㅄㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
    const compatVowel = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';

    return [
      convertOnset[compatConsonant.indexOf(this.onset)],
      standardNucleus[compatVowel.indexOf(this.nucleus)],
      this.coda && convertCoda[compatConsonant.indexOf(this.coda)]
    ].filter(Boolean).join('').normalize('NFC');
  }

  async renderGlyph(): Promise<Glyph> {
    try {
      return await Glyph.fromFile(join(this.basepath, 'overrides', `${this.text}.txt`));
    } catch { }
    let { right, bottom, variant } = Object.assign(
      {
        right: -1,
        bottom: -1,
      },
      JSON.parse(await readFile(join(this.basepath, 'base', 'vowel', this.nucleus, 'meta.json'), { encoding: 'utf8' })) as VowelMeta
    );

    const { nucleusVariant } =
      JSON.parse(await readFile(join(this.basepath, 'base', 'consonant', this.onset, 'meta.json'), { encoding: 'utf8' })) as ConsonantMeta;

    if (this.nucleus in nucleusVariant) {
      const { right: vRight, bottom: vBottom } = variant[nucleusVariant[this.nucleus]];
      right = vRight ?? right;
      bottom = vBottom ?? bottom;
    }

    let onsetPos: string;
    let nucleusPos: string;
    let codaPos: string | undefined;
    if (right === 0 && bottom === 0) {
      onsetPos = 'invalid';
      nucleusPos = 'invalid';
    } else if (right === 0) {
      onsetPos = 'top';
      nucleusPos = 'bottom';
    } else if (bottom === 0) {
      onsetPos = 'left';
      nucleusPos = 'right';
    } else {
      onsetPos = 'top-left';
      nucleusPos = 'bottom-right';
    }
    if (this.coda !== undefined) {
      const { codaMinHeight } =
        JSON.parse(await readFile(join(this.basepath, 'base', 'consonant', this.coda, 'meta.json'), { encoding: 'utf8' })) as ConsonantMeta;
      onsetPos += `-${8 - right}-${8 - bottom - codaMinHeight}`;
      nucleusPos += '-coda';
      codaPos = 'bottom';
    } else {
      onsetPos += `-${8 - right}-${8 - bottom}`;
      codaPos = undefined;
    }

    const onset = await Glyph.fromFile(join(this.basepath, 'base', 'consonant', this.onset, `${onsetPos}.txt`));
    let nucleus = await Glyph.fromFile(join(this.basepath, 'base', 'vowel', this.nucleus, `${nucleusPos}.txt`));
    try {
      nucleus = await Glyph.fromFile(join(this.basepath, 'base', 'vowel', this.nucleus, `${nucleusPos}-variant-${nucleusVariant[this.nucleus]}.txt`));
    } catch { }

    return onset.with(nucleus);
  }

  async renderAsciiFont(): Promise<string> {
    return (await this.renderGlyph()).renderAsciiFont();
  }

  async renderSvg(): Promise<string> {
    return (await this.renderGlyph()).renderSvg();
  }
}
