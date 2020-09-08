import { generateSvg } from './generate-svg';
import { generatePreview } from './generate-preview';

(async () => {
  const donePercentage = await generateSvg();
  await generatePreview(donePercentage);
})();
