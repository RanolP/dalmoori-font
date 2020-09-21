import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';
import { getLatestTagCommitHash } from '../vendors/git';
import { listWorkflowRuns } from '../vendors/github';

(async () => {
  const { asciiFontMap, pageAvailable } = await renderAsciiFont();
  let begin = 0;
  const latestTag = getLatestTagCommitHash();
  for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
    if (workflow.head_sha.startsWith(latestTag)) {
      begin = workflow.run_number;
    }
  }
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  const versionExtraInfo = `b${curr - begin}`;

  await generateFont(asciiFontMap, versionExtraInfo);
  await generatePreview(new Set(Object.keys(asciiFontMap)), pageAvailable);
})();
