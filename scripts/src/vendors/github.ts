import fetch from 'node-fetch';

const TOKEN = process.env['GITHUB_TOKEN'];
const BASE_URL = 'https://api.github.com';

export interface WorkflowRun {
  head_sha: string;
  run_number: number;
  workflow_id: number;
  status: string;
  conclusion: string;
}

export async function* listWorkflowRuns(owner: string, repository: string): AsyncGenerator<WorkflowRun, void, unknown> {
  interface Response {
    total_count: number;
    workflow_runs: WorkflowRun[];
  }
  const url = `${BASE_URL}/repos/${owner}/${repository}/actions/runs`;

  for (let page = 1; true; page += 1) {
    const response = await fetch(
      `${url}?per_page=100&page=${page}`,
      {
        headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
      }
    );
    if (response.statusText === 'rate limit exceeded') {
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      const leftSeconds = rateLimitReset !== null ? (Number(rateLimitReset) - Date.now() / 1000) : 0;
      throw new Error(`Rate Limit Exceeded: ${leftSeconds.toFixed(2)}s left`);
    }
    if (response.status !== 200) {
      return;
    }
    const { workflow_runs }: Response = await response.json();
    if (workflow_runs.length === 0) {
      break;
    }
    for (const run of workflow_runs) {
      const { head_sha, run_number, workflow_id, status, conclusion } = run;
      yield { head_sha, run_number, workflow_id, status, conclusion };
    }
  }
}
