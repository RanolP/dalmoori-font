import { generateFont } from '../generate-font.js';
import { renderAsciiFont } from '../render-ascii-font.js';
import {
  getLatestCommitHash,
  getLatestCommitUnixtime,
  getLatestTagCommitHash,
  shortenCommitHash,
} from '../vendors/git.js';
import {
  downloadArtifact,
  listWorkflowRuns,
  WorkflowRun,
  Artifact,
  downloadLatestRelease,
} from '../vendors/github.js';
import { copyFiles } from '../copy-files.js';
import { generateAdvancementReport } from '../generate-advancement-report.js';
import { join } from '../util/fs.js';
import { Paths } from '../constants.js';
import { generateArtifactZip } from '../generate-artifact-zip.js';
import { generateAsciiFont } from '../generate-ascii-font.js';
import { generateStatus } from '../generate-status.js';

(async () => {
  const asciiFontMap = await renderAsciiFont();
  let previousWorkflow: WorkflowRun | null = null;
  let previousArtifact: Artifact | null = null;
  let begin = 0;
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  const latestTag = getLatestTagCommitHash();
  const latestCommit = getLatestCommitHash();
  try {
    for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
      if (workflow.workflowId !== 2550121) {
        continue;
      }
      if (workflow.headSha === latestTag) {
        begin = workflow.runNumber;
      }

      if (
        previousArtifact === null &&
        workflow.runNumber !== curr &&
        workflow.conclusion === 'success'
      ) {
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
  const versionExtraInfo =
    latestTag === latestCommit ? '' : `beta_build${curr - begin}`;

  await generateFont(asciiFontMap, versionExtraInfo, latestCommitDate);
  await generateAsciiFont(asciiFontMap);
  await copyFiles();
  await generateStatus(asciiFontMap);
  if (previousWorkflow !== null && previousArtifact !== null) {
    console.log(
      `Downloading previous artifact (#${
        previousWorkflow.runNumber
      } ${shortenCommitHash(previousWorkflow.headSha)})...`
    );
    try {
      await downloadArtifact(previousArtifact, '../previous');
    } catch {
      console.log(
        'Failed to found previous artifact. Downloading latest release...'
      );
      await downloadLatestRelease(
        'RanolP',
        'dalmoori-font',
        'dalmoori-font.zip',
        '../previous'
      );
    }
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
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
