import { generateSvg } from './generate-svg';
import { generatePreview } from './generate-preview';

(async () => {
  await generateSvg();
  await generatePreview();
})();
