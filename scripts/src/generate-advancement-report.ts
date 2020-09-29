import endent from 'endent';
import { load, Font } from 'opentype.js';
import { BLOCKS, BLOCKS_NAME_MAP, findCharacter, UnicodeBlock } from './util/unidata';
import { Paths } from './constants';
import { formatHex } from './util/format';
import { join, mkdirs, PathLike, writeFile } from './util/fs';
import { encodeHTML } from 'entities';

export interface FontInfo {
  path: PathLike;
  commitHash: string;
}

export async function generateAdvancementReport(old: FontInfo, current: FontInfo): Promise<void> {
  const oldFont = await load(old.path.toString());
  const currentFont = await load(current.path.toString());

  const oldAnalysisResult = analyze(oldFont);
  const currentAnalysisResult = analyze(currentFont);

  const report = endent`
    ## Advancement Report

    Comparison between ${old.commitHash} (${oldFont.names.version['en']}) and ${current.commitHash} (${currentFont.names.version['en']}).

    ### Summary

    ${renderSummary(oldAnalysisResult, currentAnalysisResult)}
  `;

  await mkdirs(Paths.artifacts);
  await writeFile(join(Paths.artifacts, 'advancement-report.md'), report, 'utf8');
}

type UnsupportedCodepointSet = Set<number>;

interface AnalysisResult {
  supportRanges: Record<string, UnsupportedCodepointSet>;
}

function analyze(font: Font): AnalysisResult {
  const unicodeSupport: Record<string, Set<number>> = {};

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    for (const block of BLOCKS) {
      if (block.startCode <= glyph.unicode && glyph.unicode <= block.endCode) {
        if (!(block.name in unicodeSupport)) {
          unicodeSupport[block.name] = new Set(
            function* () {
              for (let i = block.startCode; i <= block.endCode; i++) {
                yield i;
              }
            }()
          );
        }
        unicodeSupport[block.name].delete(glyph.unicode);
        break;
      }
    }
  }

  return {
    supportRanges: Object.fromEntries(
      Object.entries(unicodeSupport)
        .map(
          ([name, unsupportedCodepoints]) => [
            name,
            unsupportedCodepoints
          ]
        )
    ),
  };
}

function renderSummary(old: AnalysisResult, current: AnalysisResult): string {
  return Array.from(new Set([...Object.keys(old.supportRanges), ...Object.keys(current.supportRanges)]))
    .map(name => BLOCKS_NAME_MAP[name])
    .map(block => renderSupportRange(block, old.supportRanges[block.name], current.supportRanges[block.name]))
    .join('\n');
}

function renderSupportRange(block: UnicodeBlock, old: UnsupportedCodepointSet, current: UnsupportedCodepointSet): string {
  const minus = Array.from(current).filter(v => !old.has(v));
  const plus = Array.from(old).filter(v => !current.has(v));
  const differenceResult =
    minus.length === 0 && plus.length === 0
      ? 'no changes'
      : [minus.length && `-${minus.length}`, plus.length && `+${plus.length}`].filter(Boolean).join(', ')
    ;
  return endent`
    <details>
      <summary>
        ${block.name}: ${block.characterCount - current.size}/${block.characterCount} (${differenceResult})
      </summary>
      <p>Unsupported ${current.size} Characters:</p>
      <ul>
        ${Array.from(current)
    .sort((a, b) => a - b)
    .map(renderUnsupportedCharacter)
    .join('\n')
    }
      </ul>
    </details>
  `;
}

function renderUnsupportedCharacter(n: number): string {
  const unicodeInformation = findCharacter(n);
  const character = String.fromCharCode(n);

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

  return `<li>${name} (U+${formatHex(n, 4)})</li>`;
}
