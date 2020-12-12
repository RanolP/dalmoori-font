import paper from 'paper';
import opentype from 'opentype.js';
import Svgo from 'svgo';
import endent from 'endent';

export type PathItem = paper.PathItem;
export const PathItem = paper.PathItem;

export type Shape = paper.Shape;
export const Shape = paper.Shape;

export type CompoundPath = paper.CompoundPath;
export const CompoundPath = paper.CompoundPath;

export type Color = paper.Color;
export const Color = paper.Color;

export type Group = paper.Group;
export const Group = paper.Group;

export const NoInsert = {
  insert: false,
};

export function createProject(width: number, height: number): paper.Project {
  return new paper.Project(new paper.Size(width, height));
}

export function glyphToPath(glyph: opentype.Glyph): opentype.Path {
  return glyph.path instanceof Function ? glyph.path() : glyph.path;
}

export function getSize(bb: opentype.BoundingBox): [width: number, height: number] {
  return [bb.x2 - bb.x1, bb.y2 - bb.y1];
}

function chooseProperSize(a: opentype.BoundingBox, b: opentype.BoundingBox): [width: number, height: number] {
  const aSize = getSize(a);
  const bSize = getSize(b);

  return [Math.max(aSize[0], bSize[0]), Math.max(aSize[1], bSize[1])];
}

export function makePathsForComparison(a: opentype.Glyph, b: opentype.Glyph): [paper.Path, paper.Path, paper.Project, [width: number, height: number]] {
  const size = chooseProperSize(a.getBoundingBox(), b.getBoundingBox());
  const project = createProject(size[0], size[1]);
  const aPaperPath = toPaperPath(a, project);
  const bPaperPath = toPaperPath(b, project);
  return [aPaperPath, bPaperPath, project, size];
}

export function toPaperPath(input: opentype.Glyph, project: paper.Project = createProject(...getSize(input.getBoundingBox()))): paper.Path {
  if (project === undefined) {
    const bb = input.getBoundingBox();
    project = createProject(bb.x2 - bb.x1, bb.y2 - bb.y1);
  }
  const output = new paper.Path({
    pathData: glyphToPath(input).toSVG(0),
    project,
    ...NoInsert,
  });
  return output;
}

export function scale(path: paper.Path, scale: number): void {
  const bb = path.bounds.topLeft;
  path.scale(scale, new paper.Point(scale * bb.x, scale * bb.y));
}


export function pathItemEquals(a: paper.PathItem, b: paper.PathItem): boolean {
  return a.compare(b);
}

type RenderSvgOption = Partial<{
  // default false
  keepColor: boolean;
  // default false
  svgSize: [width: number, height: number];
  svgParams: string;
}>;

export async function renderSvg(path: paper.Item, { keepColor, svgSize, svgParams }: RenderSvgOption): Promise<string> {
  const rendered = path.exportSVG({ asString: true });
  const svgoToUse = new Svgo({
    plugins: [
      {
        removeAttrs: {
          attrs: [
            !keepColor && 'fill',
            'font-family',
            'font-weight',
            'font-size',
            'text-anchor',
            'style',
            'stroke-miterlimit',
          ].filter(Boolean)
        }
      }
    ]
  });
  return (
    await svgoToUse.optimize(
      svgSize
        ? endent`
            <svg viewBox="0 0 ${svgSize[0]} ${svgSize[1]}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${svgParams ?? ''}>
              ${rendered}
            </svg>
          `
        : rendered
    )
  ).data;
}
