import chalk from 'chalk';
import ProgressBar from 'progress';
import { IsCI } from '../constants';

export const LabelWidth = 35;
export const TotalBarWidth = 150;

export function formatHex(n: number, pad: number): string {
  return n.toString(16).toUpperCase().padStart(pad, '0');
}

export interface AbstractProgressIndicator {
  tick(): void;
}

export function createProgressIndicator(label: string, total: number): AbstractProgressIndicator {
  let tick: () => void;
  if (IsCI) {
    let current = 0;
    tick = () => {
      current += 1;
      if (total === current || current % 200 === 0) {
        console.log(`${label}: ${current} / ${total}, ${(100 * current / total).toFixed(2)}% done.`);
      }
    };
  } else {
    const bar = new ProgressBar(
      [
        label.padEnd(LabelWidth),
        ':bar',
        chalk.green(':current / :total'),
        chalk.magenta(':percent'),
        chalk.yellow(':rate char/s'),
        chalk.blue('ETA :etas'),
        ':elapseds used',
      ].join(' '),
      {
        total,
        complete: chalk.green('━'),
        incomplete: chalk.gray('━'),
        width: TotalBarWidth,
      }
    );
    tick = () => bar.tick();
  }

  return { tick };
}
