import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';
import { getLatestCommitHash, getLatestCommitUnixtime, getLatestTagCommitHash, shortenCommitHash } from '../vendors/git';
import { downloadArtifact, listWorkflowRuns, request, WorkflowRun } from '../vendors/github';
import { generateArtifacts } from '../generate-artifact';
import { generateAdvancementReport } from '../generate-advancement-report';
import { join } from '../util/fs';
import { Paths } from '../constants';

(async () => {
  console.log(await request('/app'));
  const asciiFontMap = await renderAsciiFont();
  let previousWorkflow: WorkflowRun | null = null;
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
      if (workflow.run_number !== curr && workflow.conclusion === 'success' && previousWorkflow === null) {
        previousWorkflow = workflow;
      }
    }
  } catch (e) {
    console.log(e);
    /* do nothing */
  }
  const latestCommitDate = getLatestCommitUnixtime();
  const versionExtraInfo = `b${curr - begin}`;

  await generateFont(asciiFontMap, versionExtraInfo, latestCommitDate);
  await generatePreview();
  await generateArtifacts();
  if (previousWorkflow !== null) {
    console.log(`Downloading previous artifact (#${previousWorkflow.run_number} ${(shortenCommitHash(previousWorkflow.head_sha))})...`);
    await downloadArtifact(previousWorkflow, '../previous');
    await generateAdvancementReport(
      {
        path: '../previous/dalmoori.ttf',
        commitHash: shortenCommitHash(previousWorkflow.head_sha),
      },
      {
        path: join(Paths.build, 'font', 'dalmoori.ttf'),
        commitHash: shortenCommitHash(getLatestCommitHash()),
      }
    );
  } else {
    console.log('There are no workflow found before');
  }
})();
