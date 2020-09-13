import { generateFont } from '../generate-font';
import { generateAsciiFont } from '../generate-ascii-font';
import { renderAsciiFont } from '../render-ascii-font';

(async () => {
  const [map] = await renderAsciiFont();
  await generateAsciiFont(map);
  await generateFont(map);
})();
