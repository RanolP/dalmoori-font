import dedent from 'dedent';
import { load } from 'opentype.js';
import { getBlocks, getCharacters } from 'unidata';
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

  const unicodeBlocks = Object.fromEntries(getBlocks().map(block => [block.blockName, block]));

  type UnicodeSupport = Record<string, Set<number>>;
  const oldUnicodeSupports: UnicodeSupport = {};

  for (let i = 0; i < oldFont.glyphs.length; i++) {
    const glyph = oldFont.glyphs.get(i);
    for (const block of Object.values(unicodeBlocks)) {
      if (block.startCode <= glyph.unicode && glyph.unicode <= block.endCode) {
        if (!(block.blockName in oldUnicodeSupports)) {
          oldUnicodeSupports[block.blockName] = new Set(
            function* () {
              for (let i = block.startCode; i <= block.endCode; i++) {
                yield i;
              }
            }()
          );
        }
        oldUnicodeSupports[block.blockName].delete(glyph.unicode);
        break;
      }
    }
  }

  for (let i = '가'.charCodeAt(0); i <= '힣'.charCodeAt(0); i++) {
    const ch = String.fromCharCode(i);
    const glyph = oldFont.charToGlyph(ch);
    if (!glyph.path) {
      console.log(ch);
    }
  }

  const report = dedent`
    ## Advancement Report

    Comparison between ${old.commitHash} (${oldFont.names.version['en']}) and ${current.commitHash} (${currentFont.names.version['en']}).

    ### Support Ranges

    #### Old

    ${
      Object
        .entries(oldUnicodeSupports)
        .map(([blockName, unsupported]) => {
          const block = unicodeBlocks[blockName];
          const full = block.endCode - block.startCode + 1;
          const characters = getCharacters();
          const unsupportString = Array.from(unsupported).sort((a, b) => a - b).map(n => {
            let lo = -1, hi = characters.length;
            while (1 + lo < hi) {
              const mi = lo + ((hi - lo) >> 1);
              if (characters[mi].code >= n) {
                hi = mi;
              } else {
                lo = mi;
              }
            }
            const unicodeInformation = characters[hi];
            const character = String.fromCharCode(n);
            if (unicodeInformation === undefined || unicodeInformation.code !== n) {
              return `${character} (U+${formatHex(n, 4)})`;
            }
            let name: string;
            switch (unicodeInformation.cat) {
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
          }).join(', ');
          return dedent`
            <details>
              <summary>${blockName}: ${full - unsupported.size}/${full}</summary>
              <ul>
                ${unsupportString}
              </ul>
            </details>
          `;
        })
        .join('\n')
    }

    #### Current
    
    TODO
  `;

  await mkdirs(Paths.artifacts);
  await writeFile(join(Paths.artifacts, 'advancement-report.md'), report, 'utf8');
}
