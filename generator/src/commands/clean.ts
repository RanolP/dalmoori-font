import { Paths } from '../constants';
import { rimraf } from '../util/fs';

export async function clean(): Promise<void> {
  console.log(`Cleaning ${Paths.build}`);
  await rimraf(Paths.build);
}

clean();
