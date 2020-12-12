import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';
import { getLatestCommitHash, getLatestCommitUnixtime, getLatestTagCommitHash, shortenCommitHash } from '../vendors/git';
import { downloadArtifact, listWorkflowRuns, WorkflowRun } from '../vendors/github';
import { copyFiles } from '../copy-files';
import { generateAdvancementReport } from '../generate-advancement-report';
import { join } from '../util/fs';
import { Paths } from '../constants';
import { generateArtifactZip } from '../generate-artifact-zip';

(async () => {
  const asciiFontMap = await renderAsciiFont();
  let previousWorkflow: WorkflowRun | null = null;
  let begin = 0;
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  try {
    const latestTag = getLatestTagCommitHash();
    for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
      if (workflow.workflowId !== 2550121) {
        continue;
      }
      if (workflow.headSha === latestTag) {
        begin = workflow.runNumber;
      }
      if (workflow.runNumber !== curr && workflow.conclusion === 'success' && previousWorkflow === null) {
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
  await copyFiles();
  if (previousWorkflow !== null) {
    console.log(`Downloading previous artifact (#${previousWorkflow.runNumber} ${(shortenCommitHash(previousWorkflow.headSha))})...`);
    await downloadArtifact(previousWorkflow, '../previous');
    await generateAdvancementReport(
      {
        path: '../previous/dalmoori.ttf',
        commitHash: shortenCommitHash(previousWorkflow.headSha),
      },
      {
        path: join(Paths.build, 'font', 'dalmoori.ttf'),
        commitHash: shortenCommitHash(getLatestCommitHash()),
      }
    );
  } else {
    console.log('There are no workflow found before');
  }
  await generateArtifactZip();
})();
