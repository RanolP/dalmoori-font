import { generateSvg } from './generate-svg';
import { generatePreview } from './generate-preview';
import { generateFont } from './generate-font';
import { renderAsciiFont } from './render-ascii-font';

(async () => {
  const [map, status] = await renderAsciiFont();
  await generateSvg(map);
  await generateFont(map);
  await generatePreview(status.ok / status.whole);
})();
