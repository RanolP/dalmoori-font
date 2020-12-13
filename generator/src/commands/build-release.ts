import { generatePreview } from '../generate-preview';
import { generateFont } from '../generate-font';
import { renderAsciiFont } from '../render-ascii-font';
import { getLatestCommitHash, getLatestCommitUnixtime, getLatestTagCommitHash, shortenCommitHash } from '../vendors/git';
import { downloadArtifact, listWorkflowRuns, WorkflowRun, Artifact } from '../vendors/github';
import { copyFiles } from '../copy-files';
import { generateAdvancementReport } from '../generate-advancement-report';
import { join } from '../util/fs';
import { Paths } from '../constants';
import { generateArtifactZip } from '../generate-artifact-zip';

(async () => {
  const asciiFontMap = await renderAsciiFont();
  let previousWorkflow: WorkflowRun | null = null;
  let previousArtifact: Artifact | null = null;
  let begin = 0;
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  const latestTag = getLatestTagCommitHash();
  const latestCommit = shortenCommitHash(getLatestCommitHash());
  try {
    for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
      if (workflow.workflowId !== 2550121) {
        continue;
      }
      if (workflow.headSha === latestTag) {
        begin = workflow.runNumber;
      }

      if (previousArtifact === null && workflow.runNumber !== curr && workflow.conclusion === 'success') {
        const artifacts = await workflow.artifacts();
        if (artifacts.length > 0) {
          previousArtifact = artifacts[0];
          previousWorkflow = workflow;
        }
      }
      if (begin !== 0 && previousWorkflow !== null) {
        break;
      }
    }
  } catch (e) {
    console.log(e);
    /* do nothing */
  }
  const latestCommitDate = getLatestCommitUnixtime();
  const versionExtraInfo = latestTag === latestCommit ? '' : `beta_build${curr - begin}`;

  await generateFont(asciiFontMap, versionExtraInfo, latestCommitDate);
  await copyFiles();
  if (previousWorkflow !== null && previousArtifact !== null) {
    console.log(`Downloading previous artifact (#${previousWorkflow.runNumber} ${(shortenCommitHash(previousWorkflow.headSha))})...`);
    await downloadArtifact(previousArtifact, '../previous');
    await generateAdvancementReport(
      {
        path: '../previous/dalmoori.ttf',
        commitHash: shortenCommitHash(previousWorkflow.headSha),
      },
      {
        path: join(Paths.build, 'font', 'dalmoori.ttf'),
        commitHash: shortenCommitHash(latestCommit),
      }
    );
  } else {
    console.log('There are no workflow found before');
  }
  await generateArtifactZip();
  await generatePreview();
})().catch(e => {
  console.error(e);
  process.exit(1);
});
