import endent from 'endent';
import { load, Font } from 'opentype.js';
import {
  BLOCKS,
  BLOCKS_NAME_MAP,
  findCharacter,
  fullCodepointsOf,
  UnicodeBlock,
} from './util/unidata';
import { Paths } from './constants';
import { createProgressIndicator, formatHex } from './util/format';
import { join, mkdirs, PathLike, writeFile } from './util/fs';
import { encodeHTML } from 'entities';
import { pathItemEquals, makePathsForComparison } from './util/opentype-paper';
import { execute } from './util/executor';

export interface FontInfo {
  path: PathLike;
  commitHash: string;
}

export async function generateAdvancementReport(
  old: FontInfo,
  current: FontInfo
): Promise<void> {
  const oldFont = await load(old.path.toString());
  const currentFont = await load(current.path.toString());

  const analysisResult = await analyze(oldFont, currentFont);

  const report = endent`
    ## Advancement Report

    Comparison between ${old.commitHash} (${oldFont.names.version['en']}) and ${
    current.commitHash
  } (${currentFont.names.version['en']}).

    ### Summary

    ${renderSummary(analysisResult)}

    ### Details

    ${Object.values(analysisResult.blocks).map(renderBlockDetail).join('\n').trim()}
  `;

  await mkdirs(Paths.artifacts);
  await writeFile(
    join(Paths.artifacts, 'advancement-report.md'),
    report,
    'utf8'
  );
}

type Codepoint = number;
type UnsupportedCodepointSet = Set<number>;

interface BlockAnalysis {
  block: UnicodeBlock;
  old: UnsupportedCodepointSet;
  current: UnsupportedCodepointSet;
  removed: Set<Codepoint>;
  added: Set<Codepoint>;
  changed: Set<Codepoint>;
}

interface AnalysisResult {
  old: FontAnalysisResult;
  current: FontAnalysisResult;
  blocks: Record<string, BlockAnalysis>;
}

interface FontAnalysisResult {
  supportRanges: Record<string, UnsupportedCodepointSet>;
}

async function analyze(
  oldFont: Font,
  currentFont: Font
): Promise<AnalysisResult> {
  const oldFontResult = analyzeFont(oldFont);
  const currentFontResult = analyzeFont(currentFont);

  const supportRangeUnion = Array.from(
    new Set([
      ...Object.keys(oldFontResult.supportRanges),
      ...Object.keys(currentFontResult.supportRanges),
    ])
  )
    .map((name) => BLOCKS_NAME_MAP[name])
    .sort((a, b) => a.startCode - b.startCode);

  const blocks: Array<[string, BlockAnalysis]> = [];

  for (const block of supportRangeUnion) {
    const old =
      oldFontResult.supportRanges[block.name] ??
      new Set(fullCodepointsOf(block));
    const current =
      currentFontResult.supportRanges[block.name] ??
      new Set(fullCodepointsOf(block));
    const { tick } = createProgressIndicator(
      `Create Report for ${block.name}`,
      block.characterCount
    );
    const changed: Array<Codepoint | null> = await execute(
      function* () {
        for (const codepoint of fullCodepointsOf(block)) {
          if (old.has(codepoint) || current.has(codepoint)) {
            continue;
          }
          const ch = String.fromCharCode(codepoint);
          const oldGlyph = oldFont.charToGlyph(ch);
          const currentGlyph = currentFont.charToGlyph(ch);
          yield async () => {
            const [oldGlyphPath, currentGlyphPath] = makePathsForComparison(
              oldGlyph,
              currentGlyph
            );
            if (pathItemEquals(oldGlyphPath, currentGlyphPath)) {
              return null;
            }
            return codepoint;
          };
        }
      },
      64,
      tick
    );
    const blockAnalysis: BlockAnalysis = {
      block,
      old,
      current,
      removed: new Set(Array.from(current).filter((v) => !old.has(v))),
      added: new Set(Array.from(old).filter((v) => !current.has(v))),
      changed: new Set(changed.filter(Boolean) as Codepoint[]),
    };
    blocks.push([block.name, blockAnalysis]);
  }

  return {
    old: oldFontResult,
    current: currentFontResult,
    blocks: Object.fromEntries(blocks),
  };
}

function analyzeFont(font: Font): FontAnalysisResult {
  const unicodeSupport: Record<string, Set<number>> = {};

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    for (const block of BLOCKS) {
      if (block.startCode <= glyph.unicode && glyph.unicode <= block.endCode) {
        if (!(block.name in unicodeSupport)) {
          unicodeSupport[block.name] = new Set(fullCodepointsOf(block));
        }
        unicodeSupport[block.name].delete(glyph.unicode);
        break;
      }
    }
  }

  return {
    supportRanges: Object.fromEntries(
      Object.entries(unicodeSupport).map(([name, unsupportedCodepoints]) => [
        name,
        unsupportedCodepoints,
      ])
    ),
  };
}

function renderSummary(analysisResult: AnalysisResult): string {
  return Object.values(analysisResult.blocks)
    .map(renderSupportRange)
    .join('\n');
}

function renderSupportRange({
  block,
  current,
  removed,
  added,
  changed,
}: BlockAnalysis): string {
  const differenceResult =
    removed.size === 0 && added.size === 0 && changed.size === 0
      ? 'no changes'
      : [
        removed.size && `-${removed.size}`,
        added.size && `+${added.size}`,
        changed.size && `*${changed.size}`,
      ]
        .filter(Boolean)
        .join(', ');
  return endent`
    - ${block.name}: ${block.characterCount - current.size}/${
    block.characterCount
  } (${differenceResult})
  `;
}

function renderBlockDetail(block: BlockAnalysis): string {
  const entries = [
    block.removed.size &&
      `**Removed**: ${Array.from(block.removed)
        .map(renderCharacter)
        .join(', ')}`,
    block.added.size &&
      `**Added**: ${Array.from(block.added).map(renderCharacter).join(', ')}`,
    block.changed.size &&
      `**Changed**: ${Array.from(block.changed)
        .map(renderCharacter)
        .join(', ')}`,
  ].filter(Boolean);
  if (entries.length > 0) {
    return endent`
      #### ${block.block.name}

      ${entries.join('\n')}
    `;
  } else {
    return '';
  }
}

function renderCharacter(codepoint: number): string {
  const unicodeInformation = findCharacter(codepoint);
  const character = String.fromCharCode(codepoint);

  let name: string;
  switch (unicodeInformation?.cat) {
    case 'Cc': // Control
    case 'Cf': // Format
    case 'Zl': // Line Separator
    case 'Zp': // Paragraph Separator
    case 'Zs': // Space Separator
      name = `<code>${encodeHTML(unicodeInformation.name)}</code>`;
      break;
    default:
      name = character;
  }

  return `${name} (U+${formatHex(codepoint, 4)})`;
}
