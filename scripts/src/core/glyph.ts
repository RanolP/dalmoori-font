import dedent from 'dedent';
import { PathLike, readFile } from 'fs';

export type GlyphData = Array<[x: number, y: number]>;

export class Glyph {
  private static FileCache: Record<string, Glyph> = {};
  private constructor(private readonly data: GlyphData) { }

  static async fromFile(file: PathLike): Promise<Glyph> {
    const key = file.toString();
    if (!(key in Glyph.FileCache)) {
      const result = await new Promise<Glyph>((resolve, reject) => {
        readFile(file, { encoding: 'utf8' }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            resolve(this.parse(data));
          } catch (e) {
            reject(file + ', ' + e);
          }
        })
      });
      if (!(key in Glyph.FileCache)) {
        Glyph.FileCache[key] = result;
      }
    }
    return Glyph.FileCache[key];
  }

  private static parse(source: string): Glyph {
    const data = [] as GlyphData;
    let index = 0;
    for (const c of source) {
      switch (c) {
        case '\r':
        case '\n':
        case '\t':
        case ' ': {
          continue;
        }
        case '#': {
          data.push([Math.floor(index / 8), index % 8]);
          index += 1;
          break;
        }
        case 'x':
        case '.': {
          index += 1;
          break;
        }
        default: {
          throw new Error(`Invalid character: ${c}`);
        }
      }
      if (index > 64) {
        throw new Error('Too many characters');
      }
    }

    return new Glyph(data);
  }
  with(other: Glyph | undefined): Glyph {
    if (other === undefined) {
      return this;
    } else {
      return new Glyph([...new Set([...this.data, ...other.data])]);
    }
  }

  renderAsciiFont(): string {
    return Array.from({ length: 8 }).map((_, x) =>
      Array.from({ length: 8 }).map((_, y) =>
        this.data.some(([ox, oy]) => ox === x && oy === y) ? '#' : '.'
      ).join(' ')
    ).join('\n');
  }

  renderSvg(): string {
    return dedent`
      <svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${this.data.map(([x, y]) => dedent`
          <rect x="${y}" y="${x}" width="1" height="1" />
        `).join('\n')}
      </svg>
    `;
  }
}
