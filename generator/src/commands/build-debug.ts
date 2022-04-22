import { generateFont } from '../generate-font.js';
import { generateAsciiFont } from '../generate-ascii-font.js';
import { renderAsciiFont } from '../render-ascii-font.js';

(async () => {
  const asciiFontMap = await renderAsciiFont();
  await generateFont(asciiFontMap, 'debug');
  await generateAsciiFont(asciiFontMap);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
