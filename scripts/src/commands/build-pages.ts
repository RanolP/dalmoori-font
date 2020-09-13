import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';

(async () => {
  const {asciiFontMap, pageAvailable, status} = await renderAsciiFont();
  await generateFont(asciiFontMap);
  await generatePreview(new Set(Object.keys(asciiFontMap)), pageAvailable, 100 * (status.total - status.error) / status.total);
})();
