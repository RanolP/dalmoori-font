import dedent from 'dedent';
import { readdir, writeFile, copyFile } from './util/fs';
import { Version } from './constants';

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
      let tag = '<img class="character" src="/dalmoori-font/tofu.svg" />';
      if (availableCharacters.has(character)) {
        tag = `<span class="character">${character}</span>`;
      } 
      
      characterRendered.push(tag);
    }
    
    const previewData = dedent`
      <!DOCTYPE html>
      <html lang="ko">
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/dalmoori-font/style.css">
        <link rel="icon" href="/dalmoori-font/logo.png">
        <title>달무리 글꼴</title>
      </head>
      
      <body>
        <header>
          <a href="/dalmoori-font">
            <img class="icon" src="/dalmoori-font/logo.png" />
            달무리 ${Version}
          </a>

          <a class="github" href="https://github.com/RanolP/dalmoori-font">
            <img class="icon" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
            GitHub에서 보기
          </a>
        </header>
        
        <main class="codepage">
          ${characterRendered.join('\n')}
        </main>
      </body>
      
      </html>
    `;

    await writeFile(`../docs/codepage/${page}.html`, previewData);
  }
  
  console.log('Generating index');
  
  const previewData = dedent`
    <!DOCTYPE html>
    <html lang="ko">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/dalmoori-font/style.css">
      <link rel="icon" href="/dalmoori-font/logo.png">
      <title>달무리 글꼴</title>
    </head>
    
    <body>
      <header>
        <a href="/dalmoori-font/">
          <img class="icon" src="/dalmoori-font/logo.png" />
          달무리 ${Version}
        </a>

        <a class="github" href="https://github.com/RanolP/dalmoori-font">
          <img class="icon" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
          GitHub에서 보기
        </a>
      </header>
      
      <main>
        <h1>8×8 한글 글꼴, 달무리.</h1>
        <h3>써보기</h3>
        <textarea id="test" placeholder="다람쥐 헌 쳇바퀴에 타고파\nThe quick brown fox jumped over the lazy dog"></textarea>

        <h3>코드페이지 열람 (현대 한글 ${donePercentage.toFixed(2)}% 지원)</h3>
        <ul>
          ${pageAvailable.map(page => dedent`
            <li>
              <a class="link" href="/dalmoori-font/codepage/${page}">U+${page}00 ~ U+${page}FF</a>
            </li>
          `).join('\n')}
        </ul>
      </main>
    </body>
    
    </html>
  `;

  await writeFile('../docs/index.html', previewData);
}
