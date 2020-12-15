import { listWorkflowRuns } from './github';
import { writeFile, join } from './fs';

interface UnstableFont {
  downloadUrl: string;
  expired: boolean;
  updatedAt: string;
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

    const artifacts = await workflow.artifacts();

    if (artifacts.length === 0) {
      continue;
    }

    const artifact = artifacts[0];

    if (artifact.expired) {
      break;
    }

    result.push({
      downloadUrl: `https://github.com/RanolP/dalmoori-font/suites/${workflow.checkSuiteId}/artifacts/${artifact.id}`,
      expired: artifact.expired,
      expiresAt: artifact.expiresAt.toISO(),
      updatedAt: artifact.updatedAt.toISO(),
      sizeInBytes: artifact.sizeInBytes,
      headCommit: workflow.headCommit,
    });
    console.log(workflow.headCommit.message + ' has been added to unstable font');
    if (result.length >= 20) {
      break;
    }
  }

  await writeFile(join(__dirname, '../../src/lib/data/unstable-font.data.json'), JSON.stringify(result));
}
