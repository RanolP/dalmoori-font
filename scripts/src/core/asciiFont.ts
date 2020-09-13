import { PathLike, readFile } from 'fs';
import Svgo from 'svgo';
import { CompoundPath, PathItem, Shape, Project, Size } from 'paper';
import dedent from 'dedent';
import { FullWidthSize } from '../constants';

type PathItemT = Parameters<ReturnType<typeof PathItem['create']>['unite']>[0];

export type AsciiFontData = Array<[x: number, y: number]>;

const svgo = new Svgo({
  plugins: [
    {
      removeAttrs: {
        attrs: [
          'fill',
          'font-family',
          'font-weight',
          'font-size',
          'text-anchor',
          'style'
        ]
      }
    }
  ]
});

export class AsciiFont {
  private static FileCache: Record<string, AsciiFont> = {};
  private svgRenderCache: string | undefined = undefined;
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

  public static parse(source: string): AsciiFont {
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
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.split('='));

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

  async renderSvg(): Promise<string> {
    if (this.svgRenderCache === undefined) {
      const factor = FullWidthSize / this.height;

      const actualWidth = this.width * factor;
      const actualHeight = this.height * factor;

      const project = new Project(new Size(actualWidth, actualHeight));
      const path = this.data.reduce<PathItemT>((acc, [x, y]) => acc.unite(new Shape.Rectangle({
        point: [x * factor, y * factor],
        size: [1 * factor + 1e-5, 1 * factor + 1e-5],
        insert: false,
        project,
      }).toPath(false)), new CompoundPath({
        insert: false,
        project,
      }));
      const pathRendered = path.exportSVG({
        asString: true
      });
      const optimized = await svgo.optimize(dedent`
        <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          ${pathRendered}
        </svg>
      `);
      if (this.svgRenderCache === undefined) {
        this.svgRenderCache = optimized.data;
      }
    }
    return this.svgRenderCache;
  }
}
