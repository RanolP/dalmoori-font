import { generateAdvancementReport } from '../generate-advancement-report';
import { join } from '../util/fs';
import { Paths } from '../constants';

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
})();
