import dedent from 'dedent';
import { readdir, writeFile, copyFile } from './util/fs';
import { encodeHTML } from 'entities';

export async function generatePreview(availableCharacters: Set<string>, donePercentage: number): Promise<void> {
  await copyFile('../font/dalmoori.ttf', '../docs/dalmoori.ttf');

  const pageAvailable = await readdir('./build');
  for (const page of pageAvailable) {
    const pageId = parseInt(page, 16);

    const characterRendered = [];

    console.log(`Generating page ${page}`);

    for (const id of Array.from({ length: 256 }).map((_, index) => index)) {
      const charCode = (pageId << 8) | id;
      const character = String.fromCharCode(charCode);
      let tag = '<div class="code tofu"></div>';
      if (availableCharacters.has(character)) {
        tag = `<span class="character">${encodeHTML(character)}</span>`;
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
  
  const previewData = dedent`
  ---
  layout: home
  ---
  현대 한글 ${donePercentage.toFixed(2)}% 지원  

  ${pageAvailable.map(page => dedent`
    - [U+${page}00 ~ U+${page}FF]({{ site.baseurl }}/code/${page})  
  `).join('\n')}
  `;

  await writeFile('../docs/index.md', previewData);
}
