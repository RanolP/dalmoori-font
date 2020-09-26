import { Paths } from './constants';
import { copyFile, join } from './util/fs';

export async function generatePreview(): Promise<void> {
  await copyFile(join(Paths.build, 'font', 'dalmoori.ttf'), '../docs/assets/dalmoori.ttf');
}
