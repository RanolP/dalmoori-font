import { execSync } from 'child_process';

export function getLatestTagCommitHash(): string {
  const commandResult = execSync('git describe --long').toString();
  const { length, [length - 1]: last } = commandResult.trim().split('-g');
  return last;
}

export function getLatestCommitUnixtime(): number {
  const commandResult = execSync('git show -s --format=%ci').toString();
  return Date.parse(commandResult.replace(/ \+/, '+'));
}
