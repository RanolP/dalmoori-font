import fetch, { Response } from 'node-fetch';
import { DateTime } from 'luxon';

const TOKEN = process.env['GITHUB_TOKEN'];
const BASE_URL = 'https://api.github.com';

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

export interface Artifact {
  id: number;
  name: string;
  sizeInBytes: number;
  expired: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
  expiresAt: DateTime;
}

export interface WorkflowRun {
  workflowId: number;
  status: string;
  conclusion: string;
  artifacts: () => Promise<Array<Artifact>>;
  checkSuiteId: number;
  headCommit: {
    sha: string;
    message: string;
  }
}

export async function* listWorkflowRuns(owner: string, repository: string): AsyncGenerator<WorkflowRun, void, unknown> {
  interface WorkflowRunRaw {
    head_sha: string;
    workflow_id: number;
    status: string;
    conclusion: string;
    artifacts_url: string;
    check_suite_id: number;
    head_commit: {
      message: string;
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
        head_sha: sha,
        workflow_id: workflowId,
        status,
        conclusion,
        artifacts_url: artifactsUrl,
        head_commit: { message },
        check_suite_id: checkSuiteId
      } = run;

      yield {
        workflowId,
        headCommit: {
          sha,
          message,
        },
        status,
        conclusion,
        checkSuiteId,
        artifacts: () => getArtifacts(artifactsUrl),
      };
    }
  }
}

export async function getArtifacts(url: string): Promise<Artifact[]> {
  interface ArtifactRaw {
    id: number;
    name: string;
    size_in_bytes: number;
    expired: boolean;
    created_at: string;
    updated_at: string;
    expires_at: string;
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
      id,
      name,
      size_in_bytes,
      expired,
      created_at,
      updated_at,
      expires_at,
    } = artifact;
    result.push({
      id,
      name,
      sizeInBytes: size_in_bytes,
      expired,
      createdAt: DateTime.fromISO(created_at),
      updatedAt: DateTime.fromISO(updated_at),
      expiresAt: DateTime.fromISO(expires_at),
    });
  }

  return result;
}

export interface Release {
  tagName: string;
  commitHash: string;
  publishedAt: DateTime;
  assets: Array<{
    name: string;
    downloadUrl: string;
  }>;
  body: string;
}

export async function* listReleases(owner: string, repository: string): AsyncGenerator<Release, void, unknown> {
  interface ReleaseRaw {
    tag_name: string;
    target_commitish: string;
    published_at: string;
    assets: Array<{
      name: string;
      browser_download_url: string;
    }>;
    body: string;
  }
  const url = `/repos/${owner}/${repository}/releases`;

  for (let page = 1; true; page += 1) {
    const response = await request<ReleaseRaw[]>(`${url}?per_page=100&page=${page}`);
    if (response === null) {
      return;
    }
    if (response.length === 0) {
      break;
    }
    for (const release of response) {
      const {
        tag_name: tagName,
        target_commitish: commitHash,
        published_at: publishedAt,
        assets,
        body,
      } = release;

      yield {
        tagName,
        commitHash,
        publishedAt: DateTime.fromISO(publishedAt),
        assets: assets.map(({ name, browser_download_url: downloadUrl }) => ({ name, downloadUrl })),
        body,
      };
    }
  }
}
