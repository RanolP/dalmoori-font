import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';
import { getLatestCommitUnixtime, getLatestTagCommitHash } from '../vendors/git';
import { listWorkflowRuns } from '../vendors/github';
import { generateArtifacts } from '../generate-artifact';

(async () => {
  const { asciiFontMap, pageAvailable } = await renderAsciiFont();
  let begin = 0;
  try {
    const latestTag = getLatestTagCommitHash();
    for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
      if (workflow.head_sha.startsWith(latestTag)) {
        begin = workflow.run_number;
      }
    }
  } catch {
    /* do nothing */
  }
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  const latestCommitDate = getLatestCommitUnixtime();
  const versionExtraInfo = `b${curr - begin}`;

  await generateFont(asciiFontMap, versionExtraInfo, latestCommitDate);
  await generateArtifacts();
  await generatePreview(new Set(Object.keys(asciiFontMap)), pageAvailable);
})();
