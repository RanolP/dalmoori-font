import { execSync } from 'child_process';

export function getLatestTagCommitHash(): string {
  const commandResult = execSync('git describe --tags --long').toString();
  const { length, [length - 1]: last } = commandResult.trim().split('-g');
  return last;
}
