import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';
import { getLatestCommitHash, getLatestCommitUnixtime, getLatestTagCommitHash, shortenCommitHash } from '../vendors/git';
import { listWorkflowRuns } from '../vendors/github';
import { generateArtifacts } from '../generate-artifact';
import { generateAdvancementReport } from '../generate-advancement-report';
import { join } from '../util/fs';
import { Paths } from '../constants';

(async () => {
  const asciiFontMap = await renderAsciiFont();
  let previousCommitHash: string | undefined = undefined;
  let begin = 0;
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  try {
    const latestTag = getLatestTagCommitHash();
    for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
      if (workflow.workflow_id !== 2550121) {
        continue;
      }
      if (workflow.head_sha.startsWith(latestTag)) {
        begin = workflow.run_number;
      }
      if (workflow.run_number !== curr && workflow.conclusion === 'success' && previousCommitHash === undefined) {
        previousCommitHash = shortenCommitHash(workflow.head_sha);
      }
    }
  } catch {
    /* do nothing */
  }
  const latestCommitDate = getLatestCommitUnixtime();
  const versionExtraInfo = `b${curr - begin}`;

  await generateFont(asciiFontMap, versionExtraInfo, latestCommitDate);
  await generatePreview();
  await generateArtifacts();
  await generateAdvancementReport(
    {
      path: '../previous/dalmoori.ttf',
      commitHash: previousCommitHash || 'unknown',
    },
    {
      path: join(Paths.build, 'font', 'dalmoori.ttf'),
      commitHash: shortenCommitHash(getLatestCommitHash()),
    }
  );
})();
