import { Paths } from './constants';
import { copyFile, join, mkdirs } from './util/fs';

export async function generateArtifacts(): Promise<void> {
  await mkdirs('../artifacts');
  await copyFile(join(Paths.build, 'font', 'dalmoori.ttf'), join(Paths.artifacts, 'dalmoori.ttf'));
}
