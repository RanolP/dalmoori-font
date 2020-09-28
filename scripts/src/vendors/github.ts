import fetch, { Response } from 'node-fetch';
import { createWriteStream, dirname, join, mkdirs, PathLike } from '../util/fs';
import { fromBuffer } from 'yauzl-promise';

const TOKEN = process.env['GITHUB_TOKEN'];
const BASE_URL = 'https://api.github.com';

export interface WorkflowRun {
  headSha: string;
  runNumber: number;
  workflowId: number;
  status: string;
  conclusion: string;
  artifactsUrl: string;
  suiteId: number;
  repository: {
    fullName: string;
  }
}

export interface Artifacts {
  artifacts: Array<{
    id: number;
  }>;
}

export async function requestRaw(url: string): Promise<Response> {
  const response = await fetch(
    url,
    {
      headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
    }
  );
  if (response.statusText === 'rate limit exceeded') {
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    const leftSeconds = rateLimitReset !== null ? (Number(rateLimitReset) - Date.now() / 1000) : 0;
    throw new Error(`Rate Limit Exceeded: ${leftSeconds.toFixed(2)}s left`);
  }
  return response;
}
export async function request<T>(url: string): Promise<T | null> {
  const response = await requestRaw(url.startsWith('https://') ? url : BASE_URL + url);
  if (response.statusText === 'rate limit exceeded') {
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    const leftSeconds = rateLimitReset !== null ? (Number(rateLimitReset) - Date.now() / 1000) : 0;
    throw new Error(`Rate Limit Exceeded: ${leftSeconds.toFixed(2)}s left`);
  }
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}


export async function* listWorkflowRuns(owner: string, repository: string): AsyncGenerator<WorkflowRun, void, unknown> {
  interface WorkflowRunRaw {
    head_sha: string;
    run_number: number;
    workflow_id: number;
    status: string;
    conclusion: string;
    artifacts_url: string;
    check_suite_url: string;
    repository: { 
      full_name: string;
    }
  }
  interface Response {
    total_count: number;
    workflow_runs: WorkflowRunRaw[];
  }
  const url = `/repos/${owner}/${repository}/actions/runs`;

  for (let page = 1; true; page += 1) {
    const response = await request<Response>(`${url}?per_page=100&page=${page}`);
    if (response === null) {
      return;
    }
    const { workflow_runs }: Response = response;
    if (workflow_runs.length === 0) {
      break;
    }
    for (const run of workflow_runs) {
      const {
        head_sha: headSha,
        run_number: runNumber,
        workflow_id: workflowId,
        status,
        conclusion,
        artifacts_url: artifactsUrl,
        check_suite_url,
        repository: { full_name: fullName }
      } = run;
      const suiteId = Number(check_suite_url.split('/').slice(-1)[0]);
      yield {
        headSha,
        runNumber,
        workflowId,
        status,
        conclusion,
        artifactsUrl,
        suiteId,
        repository: {
          fullName,
        }
      };
    }
  }
}

export async function downloadArtifact(workflowRun: WorkflowRun, target: PathLike): Promise<void> {
  const artifacts = await request<Artifacts>(workflowRun.artifactsUrl);
  if (artifacts === null || artifacts.artifacts.length === 0) {
    throw new Error(`Failed to download artifact on ${workflowRun.workflowId}`);
  }
  const response = await fetch(`https://github.com/${workflowRun.repository.fullName}/suites/${workflowRun.suiteId}/artifacts/${artifacts.artifacts[0].id}`);
  const buffer = await response.buffer();
  console.log(buffer.toString());
  await mkdirs(dirname(target.toString()));

  const zipFile = await fromBuffer(buffer);

  await zipFile.walkEntries(async entry => {
    const filename = join(target.toString(), entry.fileName);
    if (/\/$/.test(filename)) {
      await mkdirs(filename);
    } else {
      await mkdirs(dirname(filename));
      const stream = await entry.openReadStream();
      const writeStream = createWriteStream(filename);
      stream.pipe(writeStream);
      await new Promise(resolve => writeStream.on('close', () => resolve()));
    }
  });
}
