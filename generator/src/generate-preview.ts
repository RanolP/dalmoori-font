import { Paths } from './constants';
import { copyFile, join } from './util/fs';

export async function generatePreview(): Promise<void> {
  await copyFile(join(Paths.artifacts, 'dalmoori.ttf'), '../docs/assets/dalmoori.ttf');
  await copyFile(join(Paths.artifacts, 'dalmoori.zip'), '../docs/assets/dalmoori.zip');
}
