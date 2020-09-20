import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';

(async () => {
  const { asciiFontMap, pageAvailable } = await renderAsciiFont();
  await generateFont(asciiFontMap);
  await generatePreview(new Set(Object.keys(asciiFontMap)), pageAvailable);
})();
