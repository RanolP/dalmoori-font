import { generateFont } from '../generate-font';
import { generateAsciiFont } from '../generate-ascii-font';
import { renderAsciiFont } from '../render-ascii-font';

(async () => {
  const asciiFontMap = await renderAsciiFont();
  await generateAsciiFont(asciiFontMap);
  await generateFont(asciiFontMap, 'debug');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
