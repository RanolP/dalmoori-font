import { listWorkflowRuns } from './github';
import fs from 'fs';
import path from 'path';

interface UnstableFont {
  downloadUrl: string;
  expired: boolean;
  expiresAt: string;
  sizeInBytes: number;
  headCommit: {
    sha: string;
    message: string;
  }
}

main();

async function main(): Promise<void> {

  const result: UnstableFont[] = [];

  for await (const workflow of listWorkflowRuns('RanolP', 'dalmoori-font')) {
    if (workflow.workflowId !== 2550121) {
      continue;
    }

    if (workflow.artifacts.length === 0) {
      continue;
    }

    const artifact = workflow.artifacts[0];

    if (artifact.expired) {
      break;
    }

    result.push({
      downloadUrl: `https://github.com/RanolP/dalmoori-font/suites/${workflow.checkSuiteId}/artifacts/${artifact.id}`,
      expired: artifact.expired,
      expiresAt: artifact.expiresAt.toISO(),
      sizeInBytes: artifact.sizeInBytes,
      headCommit: workflow.headCommit,
    });
    console.log(workflow.headCommit.message + ' has been added to preview font');
    if (result.length >= 20) {
      break;
    }
  }

  fs.writeFileSync(path.join(__dirname, '../../src/lib/data/unstable-font.data.json'), JSON.stringify(result));
}
