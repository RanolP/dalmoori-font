import dedent from 'dedent';
import { readdir, mkdirs, exists, writeFile, copyFile } from './util/fs';

export async function generatePreview(donePercentage: number): Promise<void> {
  const pageAvailable = await readdir('./build/svg-glyph');
  for (const page of pageAvailable) {
    const pageId = parseInt(page, 16);
    await mkdirs(`../docs/${page}/`);

    const characterRendered = [];

    console.log(`Generating page ${page}`);

    for (const id of Array.from({ length: 256 }).map((_, index) => index)) {
      const charCode = (pageId << 8) | id;
      const character = String.fromCharCode(charCode);
      const file = `./build/svg-glyph/${page}/${character}.svg`;
      let src = '/dalmoori-font/tofu.svg';
      if (await exists(file)) {
        src = `/dalmoori-font/${page}/${character}.svg`;
        await copyFile(file, `../docs/${page}/${character}.svg`);
      } 
      
      characterRendered.push(dedent`
        <img class="character" src="${src}" />
      `);
    }
    
    const previewData = dedent`
      <!DOCTYPE html>
      <html lang="ko">
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/dalmoori-font/style.css">
        <title>달무리 글꼴</title>
      </head>
      
      <body>
        <header>
          <a href="/dalmoori-font">
            달무리 v1.0.0
          </a>

          <a class="github" href="https://github.com/RanolP/dalmoori-font">
            <img class="icon" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
            GitHub에서 확인하기
          </a>
        </header>
        
        <main>
          ${characterRendered.join('\n')}
        </main>
      </body>
      
      </html>
    `;

    await writeFile(`../docs/${page}/index.html`, previewData);
  }
  
  console.log('Generating index');
  
  const previewData = dedent`
    <!DOCTYPE html>
    <html lang="ko">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/dalmoori-font/style.css">
      <title>달무리 글꼴</title>
    </head>
    
    <body>
      <header>
        <a href="/dalmoori-font/">
          달무리 v1.0.0
        </a>

        <a class="github" href="https://github.com/RanolP/dalmoori-font">
          <img class="icon" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
          GitHub에서 확인하기
        </a>
      </header>
      
      <main>
        8×8 한글 글꼴, 달무리.
        <br>
        <br>
        미리 보기 (현대 한글 ${donePercentage.toFixed(2)}% 지원)
        <ul>
          ${pageAvailable.map(page => dedent`
            <li>
              <a class="link" href="/dalmoori-font/${page}">U+${page}00 ~ U+${page}FF</a>
            </li>
          `).join('\n')}
        </ul>
      </main>
    </body>
    
    </html>
  `;

  await writeFile('../docs/index.html', previewData);
}
