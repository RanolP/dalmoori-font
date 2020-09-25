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

  console.log('Generating index');

  const previewData = dedent`
  ---
  layout: home
  ---
  `;

  await writeFile('../docs/index.md', previewData);
}
