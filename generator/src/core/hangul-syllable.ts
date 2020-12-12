import { PathLike, join } from '../util/fs';
import { AsciiFont } from './ascii-font';
import { combine } from './combine';
import { Coda, Consonant, Nucleus, Onset } from './hangul-phoneme';

export class Syllable {
  private constructor(
    private readonly basepath: PathLike,
    private readonly onset: Onset,
    private readonly nucleus: Nucleus,
    private readonly coda?: Coda) {
  }

  public static async of(basepath: PathLike, onset: string, nucleus: string, coda?: string): Promise<Syllable> {
    return new Syllable(
      basepath,
      (await Consonant.from(join(basepath.toString(), 'hangul-phoneme', 'consonant'), onset)).onset,
      await Nucleus.from(join(basepath.toString(), 'hangul-phoneme', 'vowel'), nucleus),
      coda ? (await Consonant.from(join(basepath.toString(), 'hangul-phoneme', 'consonant'), coda)).coda : undefined,
    );
  }

  get text(): string {
    return (
      this.onset.name.std +
      this.nucleus.name.std +
      (this.coda?.name?.std ?? '')
    ).normalize('NFC');
  }

  async renderGlyph(): Promise<AsciiFont> {
    try {
      return await AsciiFont.fromFile(join(this.basepath.toString(), 'overrides', `${this.text}.txt`));
    } catch { /* do nothing */ }
    return combine(this.onset, this.nucleus, this.coda);
  }

  async renderAsciiFont(): Promise<string> {
    return (await this.renderGlyph()).renderAsciiFont();
  }
}
