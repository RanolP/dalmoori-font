import { generatePreview } from './generate-preview';
import { generateFont } from './generate-font';
import { generateAsciiFont } from './generate-ascii-font';
import { renderAsciiFont } from './render-ascii-font';

(async () => {
  const [map, status] = await renderAsciiFont();
  await generateAsciiFont(map);
  await generateFont(map);
  await generatePreview(new Set(Object.keys(map)), 100 * (status.total - status.error) / status.total);
})();
