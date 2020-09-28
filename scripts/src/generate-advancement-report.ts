import dedent from 'dedent';
import { load, Font } from 'opentype.js';
import { Block, getBlocks, getCharacters } from 'unidata';
import { Paths } from './constants';
import { formatHex } from './util/format';
import { join, mkdirs, PathLike, writeFile } from './util/fs';
import { binarySearch } from './util/algorithm';
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

  const report = dedent`
    ## Advancement Report

    Comparison between ${old.commitHash} (${oldFont.names.version['en']}) and ${current.commitHash} (${currentFont.names.version['en']}).

    ### Support Ranges

    #### Old

    ${renderSupportRanges(oldAnalysisResult)}

    #### Current
    
    ${renderSupportRanges(currentAnalysisResult)}
  `;

  await mkdirs(Paths.artifacts);
  await writeFile(join(Paths.artifacts, 'advancement-report.md'), report, 'utf8');
}

interface AnalysisResult {
  blocks: Array<
    {
      block: Block,
      unsupportedCodepoints: Set<number>;
    }
  >;
}

function analyze(font: Font): AnalysisResult {
  const unicodeBlocks = Object.fromEntries(getBlocks().map(block => [block.blockName, block]));

  const unicodeSupport: Record<string, Set<number>> = {};

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    for (const block of Object.values(unicodeBlocks)) {
      if (block.startCode <= glyph.unicode && glyph.unicode <= block.endCode) {
        if (!(block.blockName in unicodeSupport)) {
          unicodeSupport[block.blockName] = new Set(
            function* () {
              for (let i = block.startCode; i <= block.endCode; i++) {
                yield i;
              }
            }()
          );
        }
        unicodeSupport[block.blockName].delete(glyph.unicode);
        break;
      }
    }
  }

  return {
    blocks: Object.entries(unicodeSupport)
      .map(([name, unsupportedCodepoints]) => ({
        block: unicodeBlocks[name],
        unsupportedCodepoints
      })),
  };
}

function renderSupportRanges(analysisResult: AnalysisResult): string {
  const characters = getCharacters();
  return Object
    .values(analysisResult.blocks)
    .map(({ block, unsupportedCodepoints }) => {
      const full = block.endCode - block.startCode + 1;
      const unsupportString = Array.from(unsupportedCodepoints).sort((a, b) => a - b).map(n => {
        const index = binarySearch(-1, characters.length, mid => characters[mid].code >= n);
        const unicodeInformation = characters[index];
        const character = String.fromCharCode(n);
        const category: string | null =
          unicodeInformation !== undefined && unicodeInformation.code === n
            ? unicodeInformation.cat
            : null;

        let name: string;
        switch (category) {
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
      }).join('\n');
      return dedent`
        <details>
          <summary>${block.blockName}: ${full - unsupportedCodepoints.size}/${full} (${unsupportedCodepoints.size} unsupported)</summary>
          <p>Unsupported Character List:</p>
          <ul>
            ${unsupportString}
          </ul>
        </details>
      `;
    })
    .join('\n');
}
