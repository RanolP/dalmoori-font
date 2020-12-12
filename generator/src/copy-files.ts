import { Paths } from './constants';
import { copyFile, join, mkdirs, rimraf } from './util/fs';

export async function copyFiles(): Promise<void> {
  await rimraf(Paths.artifacts);
  await mkdirs(Paths.artifacts);
  await copyFile(join(Paths.build, 'font', 'dalmoori.ttf'), join(Paths.artifacts, 'dalmoori.ttf'));
  await copyFile(join(Paths.build, 'font', 'dalmoori.woff'), join(Paths.artifacts, 'dalmoori.woff'));
  await copyFile(join(Paths.build, 'font', 'dalmoori.woff2'), join(Paths.artifacts, 'dalmoori.woff2'));
  await copyFile(join(Paths.root, 'LICENSE'), join(Paths.artifacts, 'LICENSE'));
}
