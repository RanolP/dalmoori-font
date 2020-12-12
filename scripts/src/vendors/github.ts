import fetch, { Response } from 'node-fetch';
import { createWriteStream, dirname, join, mkdirs, PathLike } from '../util/fs';
import JSZip from 'jszip';

const TOKEN = process.env['GITHUB_TOKEN'];
const BASE_URL = 'https://api.github.com';

export interface WorkflowRun {
  headSha: string;
  runNumber: number;
  workflowId: number;
  status: string;
  conclusion: string;
  artifacts: Array<Artifact>;
}

export interface Artifact {
  expired: boolean;
  archiveDownloadUrl: string;
}

export async function requestRaw(url: string, token?: string): Promise<Response> {
  token = token ?? TOKEN;
  const response = await fetch(
    url,
    {
      headers: token ? { Authorization: `token ${token}` } : {}
    }
  );
  if (response.statusText === 'rate limit exceeded') {
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    const leftSeconds = rateLimitReset !== null ? (Number(rateLimitReset) - Date.now() / 1000) : 0;
    throw new Error(`Rate Limit Exceeded: ${leftSeconds.toFixed(2)}s left`);
  }
  return response;
}
export async function request<T>(url: string, token?: string): Promise<T | null> {
  const response = await requestRaw(url.startsWith('https://') ? url : BASE_URL + url, token);
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
      } = run;
      yield {
        headSha,
        runNumber,
        workflowId,
        status,
        conclusion,
        artifacts: await getArtifacts(artifactsUrl),
      };
    }
  }
}

export async function getArtifacts(url: string): Promise<Artifact[]> {
  interface ArtifactRaw {
    expired: boolean;
    archive_download_url: string;
  }
  interface Response {
    total_count: number;
    artifacts: ArtifactRaw[];
  }

  const response = await request<Response>(url);

  if (response === null) {
    return [];
  }
  const { artifacts }: Response = response;

  const result = [] as Artifact[];

  for (const artifact of artifacts) {
    const {
      expired,
      archive_download_url: archiveDownloadUrl,
    } = artifact;
    result.push({
      expired,
      archiveDownloadUrl,
    });
  }

  return result;
}

export async function downloadArtifact(workflowRun: WorkflowRun, target: PathLike): Promise<void> {
  const response = await requestRaw(workflowRun.artifacts[0].archiveDownloadUrl, process.env['ARTIFACT_DOWNLOAD_TOKEN']);
  const buffer = await response.buffer();
  await mkdirs(dirname(target.toString()));

  const zipFile = await JSZip.loadAsync(buffer);

  await Promise.all(zipFile.file(/.*/).map(async entry => {
    const filename = join(target.toString(), entry.name);
    if (entry.dir) {
      await mkdirs(filename);
    } else {
      await mkdirs(dirname(filename));
      const stream = entry.nodeStream();
      const writeStream = createWriteStream(filename);
      stream.pipe(writeStream);
      await new Promise<void>(resolve => writeStream.on('close', () => resolve()));
    }
  }));
}
