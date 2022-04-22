import { AsciiFont } from './ascii-font';
import { FullWidthSize } from '../constants';
import {
  createProject,
  PathItem,
  Shape,
  CompoundPath,
} from '../util/opentype-paper';
import endent from 'endent';

export class Path {
  private readonly actualWidth: number;
  private readonly actualHeight: number;
  private readonly handle: PathItem;
  constructor(param0: AsciiFont | PathItem, param1?: number, param2?: number) {
    if (param0 instanceof PathItem) {
      this.handle = param0;
      if (param1 === undefined || param2 === undefined) {
        throw new Error(
          'If using path item, actual width and actual height never be undefined',
        );
      }
      this.actualWidth = param1;
      this.actualHeight = param2;
      return;
    }
    const factor = FullWidthSize / param0.height;

    this.actualWidth = param0.width * factor;
    this.actualHeight = param0.height * factor;

    const project = createProject(this.actualWidth, this.actualHeight);
    this.handle = param0.data.reduce(
      (acc: PathItem, [x, y]: [number, number]) =>
        acc.unite(
          new Shape.Rectangle({
            point: [x * factor, y * factor],
            size: [1 * factor + 1e-5, 1 * factor + 1e-5],
            insert: false,
            project,
          }).toPath(false),
        ),
      new CompoundPath({
        insert: false,
        project,
      }),
    );
  }

  unite(other: Path): Path {
    if (this.actualWidth !== other.actualWidth) {
      throw new Error(
        `this have width ${this.actualWidth} but uniting with width ${other.actualWidth}`,
      );
    }
    if (this.actualHeight !== other.actualHeight) {
      throw new Error(
        `this have height ${this.actualHeight} but uniting with height ${other.actualHeight}`,
      );
    }
    return new Path(
      this.handle.unite(other.handle),
      this.actualWidth,
      this.actualHeight,
    );
  }

  renderToSvg(): string {
    return endent`
      <svg viewBox="0 0 ${this.actualWidth} ${
      this.actualHeight
    }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${this.handle.exportSVG({ asString: true })}
      </svg>
    `;
  }
}
