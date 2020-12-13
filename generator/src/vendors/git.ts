import { execSync } from 'child_process';

export type CommitHashLong = string;
export type CommitHashShort = string;

export function getLatestTagCommitHash(): CommitHashLong {
  const commandResult = execSync('git rev-list --tags --max-count=1').toString();
  return commandResult.trim();
}

export function getLatestCommitUnixtime(): number {
  const commandResult = execSync('git show -s --format=%cI').toString();
  return Math.floor(Date.parse(commandResult.replace(/ \+/, '+')) / 1000);
}

export function getLatestCommitHash(): CommitHashLong {
  const commandResult = execSync('git show -s --format=%H').toString();
  return commandResult.trim();
}

export function shortenCommitHash(hash: CommitHashLong): CommitHashShort {
  const commandResult = execSync(`git rev-parse --short ${hash}`).toString();
  return commandResult.trim();
}
