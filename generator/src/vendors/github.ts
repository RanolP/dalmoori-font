import fetch, { Response } from 'node-fetch';
import { dirname, join, mkdirs, PathLike, writeFile } from '../util/fs';
import JSZip from 'jszip';
import { Octokit } from '@octokit/rest';

const TOKEN = process.env['GITHUB_TOKEN'];
const BASE_URL = 'https://api.github.com';

const octokit = new Octokit();

export interface WorkflowRun {
  headSha: string;
  runNumber: number;
  workflowId: number;
  status: string | null;
  conclusion: string | null;
  artifacts: () => Promise<Array<Artifact>>;
}

export interface Artifact {
  expired: boolean;
  archiveDownloadUrl: string;
}

export async function requestRaw(
  url: string,
  token?: string
): Promise<Response> {
  token = token ?? TOKEN;
  const response = await fetch(url, {
    headers: token ? { Authorization: `token ${token}` } : {},
  });
  if (response.statusText === 'rate limit exceeded') {
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    const leftSeconds =
      rateLimitReset !== null ? Number(rateLimitReset) - Date.now() / 1000 : 0;
    throw new Error(`Rate Limit Exceeded: ${leftSeconds.toFixed(2)}s left`);
  }
  return response;
}
export async function request<T>(
  url: string,
  token?: string
): Promise<T | null> {
  const response = await requestRaw(
    url.startsWith('https://') ? url : BASE_URL + url,
    token
  );
  if (response.statusText === 'rate limit exceeded') {
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    const leftSeconds =
      rateLimitReset !== null ? Number(rateLimitReset) - Date.now() / 1000 : 0;
    throw new Error(`Rate Limit Exceeded: ${leftSeconds.toFixed(2)}s left`);
  }
  if (response.status !== 200) {
    return null;
  }
  return (await response.json()) as T;
}

export async function* listWorkflowRuns(
  owner: string,
  repo: string
): AsyncGenerator<WorkflowRun, void, unknown> {
  for (let page = 1; true; page += 1) {
    const {
      data: { workflow_runs },
    } = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
    });
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
        artifacts: () => getArtifacts(artifactsUrl),
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
    const { expired, archive_download_url: archiveDownloadUrl } = artifact;
    result.push({
      expired,
      archiveDownloadUrl,
    });
  }

  return result;
}

export async function downloadArtifact(
  artifact: Artifact,
  target: PathLike
): Promise<void> {
  const response = await requestRaw(
    artifact.archiveDownloadUrl,
    process.env['REPO_ACCESS_TOKEN']
  );
  const buffer = await response.buffer();
  await mkdirs(dirname(target.toString()));

  const zipFile = await JSZip.loadAsync(buffer);

  for (const entry of zipFile.file(/.*/)) {
    const filename = join(target.toString(), entry.name);
    if (entry.dir) {
      await mkdirs(filename);
    } else {
      await mkdirs(dirname(filename));
      const buffer = await entry.async('nodebuffer');
      await writeFile(filename, buffer);
    }
  }
}

export async function downloadLatestRelease(
  owner: string,
  repo: string,
  name: string,
  target: PathLike
): Promise<void> {
  const {
    data: {
      0: { assets },
    },
  } = await octokit.repos.listReleases({
    owner,
    repo,
  });
  const asset = assets.find((asset) => asset.name === name);
  if (!asset) {
    throw new Error(
      `Cannot found asset ${name} on the latest release from ${owner}/${repo}`
    );
  }
  const response = await requestRaw(
    asset.browser_download_url,
    process.env['REPO_ACCESS_TOKEN']
  );
  const buffer = await response.buffer();
  await mkdirs(dirname(target.toString()));

  const zipFile = await JSZip.loadAsync(buffer);

  for (const entry of zipFile.file(/.*/)) {
    const filename = join(target.toString(), entry.name);
    if (entry.dir) {
      await mkdirs(filename);
    } else {
      await mkdirs(dirname(filename));
      const buffer = await entry.async('nodebuffer');
      await writeFile(filename, buffer);
    }
  }
}
