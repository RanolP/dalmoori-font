import { getLatestCommitHash, shortenCommitHash } from '../vendors/git';
import { downloadArtifact, listWorkflowRuns, WorkflowRun } from '../vendors/github';
import { generateAdvancementReport } from '../generate-advancement-report';
import { join } from '../util/fs';
import { Paths } from '../constants';

(async () => {
  let previousWorkflow: WorkflowRun | null = null;
  const curr = Number(process.env['GITHUB_RUN_NUMBER']);
  try {
    for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
      if (workflow.workflowId !== 2550121) {
        continue;
      }
      if (workflow.runNumber !== curr && workflow.conclusion === 'success' && previousWorkflow === null) {
        previousWorkflow = workflow;
        break;
      }
    }
  } catch (e) {
    console.log(e);
    /* do nothing */
  }

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
})();
