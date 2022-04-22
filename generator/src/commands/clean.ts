import { Paths } from '../constants.js';
import { rimraf } from '../util/fs.js';

export async function clean(): Promise<void> {
  console.log(`Cleaning ${Paths.build}`);
  await rimraf(Paths.build);
}

clean();
