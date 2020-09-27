import fetch, { Response } from 'node-fetch';
import { dirname, mkdirs, PathLike, writeFile } from '../util/fs';

const TOKEN = process.env['GITHUB_TOKEN'];
const BASE_URL = 'https://api.github.com';

export interface WorkflowRun {
  head_sha: string;
  run_number: number;
  workflow_id: number;
  status: string;
  conclusion: string;
  artifacts_url: string;
}

export interface Artifacts {
  artifacts: Array<{
    archive_download_url: string;
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
  const response = await requestRaw(url);
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
  interface Response {
    total_count: number;
    workflow_runs: WorkflowRun[];
  }
  const url = `${BASE_URL}/repos/${owner}/${repository}/actions/runs`;

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
      const { head_sha, run_number, workflow_id, status, conclusion, artifacts_url } = run;
      yield { head_sha, run_number, workflow_id, status, conclusion, artifacts_url };
    }
  }
}

export async function downloadArtifact(workflowRun: WorkflowRun, target: PathLike): Promise<void> {
  const artifacts = await request<Artifacts>(workflowRun.artifacts_url);
  if (artifacts === null || artifacts.artifacts.length === 0) {
    throw new Error(`Failed to download artifact on ${workflowRun.workflow_id}`);
  }
  const response = await requestRaw(artifacts.artifacts[0].archive_download_url);
  const buffer = await response.buffer();
  await mkdirs(dirname(target.toString()));
  await writeFile(target, buffer);
}
