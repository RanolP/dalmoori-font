import dedent from 'dedent';
import { PathLike, readFile } from 'fs';

export type AsciiFontData = Array<[x: number, y: number]>;

export class AsciiFont {
  private static FileCache: Record<string, AsciiFont> = {};
  private constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly meta: any,
    public readonly width: number,
    public readonly height: number,
    private readonly data: AsciiFontData
  ) { }

  static async fromFile(file: PathLike): Promise<AsciiFont> {
    const key = file.toString();
    if (!(key in AsciiFont.FileCache)) {
      const result = await new Promise<AsciiFont>((resolve, reject) => {
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
        });
      });
      if (!(key in AsciiFont.FileCache)) {
        AsciiFont.FileCache[key] = result;
      }
    }
    return AsciiFont.FileCache[key];
  }

  private static parse(source: string): AsciiFont {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta: any = {};
    if (!source.startsWith('---')) {
      throw new Error(`Expect meta area, but starts with ${source.substring(0, 5)}...`);
    }
    const metaEnd = source.indexOf('---', 4);
    if (metaEnd === -1) {
      throw new Error('Expect meta to be end but never ends');
    }
    const metaSet = source
      .substring(3, metaEnd)
      .split('\n')
      .filter(Boolean)
      .map(s => s.trim().split('='));

    for (const metaItem of metaSet) {
      if (metaItem.length !== 2) {
        throw new Error(`Invalid meta item: ${metaItem.join('=')}`);
      }
      let target = meta;
      const keys = metaItem[0].split('.').map(s => s.trim());
      while (keys.length > 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const key = keys.shift()!;
        if (key in target) {
          target = target[key];
        }
      }

      const k = keys[0];
      const v = metaItem[1].trim();

      if (!isNaN(Number(v))) {
        target[k] = Number(v);
      } else if (v.includes(',')) {
        target[k] = v.split(',').map(s => !isNaN(Number(s)) ? Number(s) : s.trim());
      } else if (v === 'true' || v === 'false') {
        target[k] = Boolean(v);
      } else {
        throw new Error(`Invalid meta value: ${v}`);
      }
    }

    const width = meta.width as number ?? 8;
    const height = meta.height as number ?? 8;

    const data = [] as AsciiFontData;
    let index = 0;
    for (const c of source.substring(metaEnd + 3)) {
      switch (c) {
        case '\r':
        case '\n':
        case '\t':
        case ' ': {
          continue;
        }
        case '#': {
          data.push([index % width, Math.floor(index / width)]);
          index += 1;
          break;
        }
        case 'm':
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

    return new AsciiFont(meta, width, height, data);
  }
  with(other: AsciiFont | undefined): AsciiFont {

    if (other === undefined) {
      return this;
    } else if (this.width !== other.width || this.height !== other.height) {
      throw new Error(`Cannot combine tiles: this=${this.width}x${this.height}, other=${other.width}x${other.height}`);
    } else {
      return new AsciiFont({}, this.width, this.height, [...new Set([...this.data, ...other.data])]);
    }
  }

  renderAsciiFont(): string {
    return Array.from({ length: this.height }).map((_, y) =>
      Array.from({ length: this.width }).map((_, x) =>
        this.data.some(([ox, oy]) => ox === x && oy === y) ? '#' : '.'
      ).join(' ')
    ).join('\n');
  }

  renderSvg(): string {
    return dedent`
      <svg viewBox="0 0 ${this.width} ${this.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${this.data.map(([x, y]) => dedent`
          <rect x="${x}" y="${y}" width="1" height="1" />
        `).join('\n')}
      </svg>
    `;
  }
}
