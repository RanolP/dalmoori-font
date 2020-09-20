import dedent from 'dedent';
import { Paths } from './constants';
import { writeFile, copyFile, join } from './util/fs';

function escapeMarkdown(char: string): string {
  switch (char) {
    // HTML Tag 구성 요소이므로 변환해야 함
    case '<':
      return '&lt;';
    case '>':
      return '&gt;';
    // Typographer 기능 때문에 변환해야 함
    case '\'':
      return '&apos;';
    case '"':
      return '&quot;';
    // 마크다운에서 문법적인 기능을 하므로 역슬래시 이스케이프
    case '\\':
    case '`':
    case '*':
    case '{':
    case '}':
    case '[':
    case ']':
    case '(':
    case ')':
    case '#':
    case '+':
    case '-':
    case '.':
    case '!':
    case '_':
    case '~':
    case '|':
      return '\\' + char;
    // 그 외의 경우는 그냥 반환함
    default:
      return char;
  }
}

export async function generatePreview(availableCharacters: Set<string>, pageAvailable: Set<string>): Promise<void> {
  await copyFile(join(Paths.build, 'font', 'dalmoori.ttf'), '../docs/assets/dalmoori.ttf');

  for (const page of pageAvailable) {
    const pageId = parseInt(page, 16);

    const characterRendered = [];

    console.log(`Generating page ${page}`);

    for (const id of Array.from({ length: 256 }).map((_, index) => index)) {
      const charCode = (pageId << 8) | id;
      const character = String.fromCharCode(charCode);
      let tag = '<span class="code tofu"></span>';
      if (availableCharacters.has(character)) {
        tag = `<span class="character">${escapeMarkdown(character)}</span>`;
      }

      characterRendered.push(tag);
    }

    const previewData = dedent`
    ---
    title: "코드페이지 Example"
    layout: codepage
    permalink: "/code/${page}"
    description: "코드 페이지 - 코드 범위: U+${page}00 ~ U+${page}FF"
    ---
    
    ${characterRendered.join('\n')}
    `;

    await writeFile(`../docs/_pages/code-${page}.md`, previewData);
  }

  console.log('Generating index');

  const supported = [];
  const unsupported = [];

  for (let id = '가'.charCodeAt(0); id <= '힣'.charCodeAt(0); id++) {
    const c = String.fromCharCode(id);
    if (availableCharacters.has(c)) {
      supported.push(c);
    } else {
      unsupported.push(c);
    }
  }

  const previewData = dedent`
  ---
  layout: home
  ---
  현대 한글 ${(100 * supported.length / 11172).toFixed(2)}% 지원

  미지원 문자 목록:
  ${unsupported.join(', ')}

  ${[...pageAvailable].map(page => dedent`
    - [U+${page}00 ~ U+${page}FF]({{ site.baseurl }}/code/${page})  
  `).join('\n')}
  `;

  await writeFile('../docs/index.md', previewData);
}
