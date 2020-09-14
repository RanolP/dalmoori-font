import { basename, join, PathLike, readdir } from '../util/fs';
import { AsciiFont } from './asciiFont';

const ONSET_REGEX = /onset-(\d+)-(\d+)(?:-([a-z]+))?/;
const CODA_REGEX = /coda-(\d+)/;

export class Consonant {
  private static Cache: Record<string, Consonant> = {};
  private constructor(
    public readonly onset: Onset,
    public readonly coda: Coda,
  ) { }

  public static async from(basepath: PathLike, compatPhoneme: string): Promise<Consonant> {
    const path = join(basepath.toString(), compatPhoneme);
    if (!(path in Consonant.Cache)) {
      const onsetParts: Record<number, Record<number, OnsetPart[]>> = {};
      const codaheightFontMap: Record<number, AsciiFont> = {};
      for (const file of await readdir(path)) {
        const name = basename(file, '.txt');
        const onset = ONSET_REGEX.exec(name);
        if (onset !== null) {
          const [width, height] = onset.slice(1).map(Number);
          const asciiFont = await AsciiFont.fromFile(join(path, file));
          const variantsRequirementsMap: Record<string, string[]> = {};
          const targetFor = asciiFont.meta['for'] ? new RegExp('^' + asciiFont.meta['for'] + '$') : undefined;
          const notTargetFor = asciiFont.meta['not-for'] ? new RegExp('^' + asciiFont.meta['not-for'] + '$') : undefined;
          for (const target of Object.keys(asciiFont.meta['variant'] ?? {})) {
            variantsRequirementsMap[target] = [asciiFont.meta['variant'][target] ?? []].flat();
          }
          if (!(width in onsetParts)) {
            onsetParts[width] = {};
          }
          if (!(height in onsetParts[width])) {
            onsetParts[width][height] = [];
          }
          onsetParts[width][height].push(new OnsetPart(asciiFont, variantsRequirementsMap, targetFor, notTargetFor));
          continue;
        }
        const coda = CODA_REGEX.exec(name);
        if (coda !== null) {
          const asciiFont = await AsciiFont.fromFile(join(path, file));
          const [height] = coda.slice(1).map(Number);
          codaheightFontMap[height] = asciiFont;
        }
      }

      const convertOnset = 'ᄀᄁ ᄂ  ᄃᄄᄅ       ᄆᄇᄈ ᄉᄊᄋᄌᄍᄎᄏᄐᄑᄒ';
      const convertCoda = 'ᆨᆩᆪᆫᆬᆭᆮ ᆯᆰᆱᆲᆳᆴᆵᆶᆷᆸ ᆹᆺᆻᆼᆽ ᆾᆿᇀᇁᇂ';

      const compatConsonant = 'ㄱㄲㄳㄴㄵㄶㄷㄸㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅃㅄㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

      if (!(path in Consonant.Cache)) {
        Consonant.Cache[path] = new Consonant(
          new Onset(new PhonemeName(convertOnset[compatConsonant.indexOf(compatPhoneme)], compatPhoneme), onsetParts),
          new Coda(new PhonemeName(convertCoda[compatConsonant.indexOf(compatPhoneme)], compatPhoneme), codaheightFontMap)
        );
      }
    }
    return Consonant.Cache[path];
  }
}

export class PhonemeName {
  constructor(
    public readonly std: string,
    public readonly compat: string
  ) { }
}

export class OnsetPart {
  constructor(
    public readonly font: AsciiFont,
    public readonly variantRequirementsMap: Record<string, string[]>,
    public readonly targetFor: RegExp | undefined,
    public readonly notTargetFor: RegExp | undefined,
  ) { }
}
export class Onset {
  constructor(
    public readonly name: PhonemeName,
    public readonly onsetParts: Record<number, Record<number, OnsetPart[]>>,
  ) { }

  public find(width: number, height: number): OnsetPart[] {
    return this.onsetParts[width]?.[height] ?? [];
  }
}

export class NucleusVariant {
  constructor(
    public readonly font: AsciiFont,
    public readonly variantsApplied: Record<string, boolean>,
    public readonly widthOccupying: number,
    public readonly marginLeft: number[],
    public readonly heightOccupying: number,
    public readonly marginTop: number[],
  ) { }
}
export class Nucleus {
  private static Cache: Record<string, Nucleus> = {};
  constructor(
    public readonly name: PhonemeName,
    public readonly variants: NucleusVariant[]
  ) { }

  public static async from(basepath: PathLike, compatPhoneme: string): Promise<Nucleus> {
    const path = join(basepath.toString(), compatPhoneme);
    if (!(path in Nucleus.Cache)) {
      const variants: NucleusVariant[] = [];

      for (const file of await readdir(path)) {
        const font = await AsciiFont.fromFile(join(path, file));

        const marginLeft = font.meta['margin-left'] ? [font.meta['margin-left']].flat().sort((a, b) => b - a) : [0];
        const marginTop = font.meta['margin-top'] ? [font.meta['margin-top']].flat().sort((a, b) => b - a) : [0];

        variants.push(new NucleusVariant(
          font,
          basename(file, '.txt').split(',').reduce((acc, curr) => ({ ...acc, [curr]: true }), {}),
          font.meta['width-occupying'] ?? 0,
          marginLeft,
          font.meta['height-occupying'] ?? 0,
          marginTop,
        ));
      }

      if (!(path in Nucleus.Cache)) {
        const standardNucleus = 'ᅡᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵ';
        const compatVowel = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
        Nucleus.Cache[path] = new Nucleus(
          new PhonemeName(standardNucleus[compatVowel.indexOf(compatPhoneme)], compatPhoneme),
          variants.sort((a, b) => {
            if (a.variantsApplied['default']) {
              return -1;
            } else if (b.variantsApplied['default']) {
              return 1;
            }
            if (a.variantsApplied['coda'] !== b.variantsApplied['coda']) {
              if (a.variantsApplied['coda']) {
                return 1;
              } else if (b.variantsApplied['coda']) {
                return -1;
              }
            }
            return Object.keys(a.variantsApplied).length - Object.keys(b.variantsApplied).length;
          })
        );
      }
    }
    return Nucleus.Cache[path];
  }
}

export class Coda {
  public readonly heightList: number[];
  constructor(
    public readonly name: PhonemeName,
    private readonly heightFontMap: Record<number, AsciiFont>
  ) {
    this.heightList = Object.keys(this.heightFontMap).map(Number).sort((a, b) => b - a);
  }

  public fontForHeight(height: number): AsciiFont {
    return this.heightFontMap[height];
  }
}
