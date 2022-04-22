import { generateAdvancementReport } from '../generate-advancement-report.js';
import { join } from '../util/fs.js';
import { Paths } from '../constants.js';

(async () => {
  await generateAdvancementReport(
    {
      path: '../previous/dalmoori.ttf',
      commitHash: 'unknown',
    },
    {
      path: join(Paths.build, 'font', 'dalmoori.ttf'),
      commitHash: 'unknown',
    }
  );
})().catch(e => {
  console.error(e);
  process.exit(1);
});
