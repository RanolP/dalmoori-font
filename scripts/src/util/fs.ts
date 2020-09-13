import { promises } from 'fs';
import { PathLike, constants } from 'fs';
import { dirname, resolve, join } from 'path';

const { readFile, writeFile, readdir, copyFile, access, mkdir, stat, unlink, rmdir } = promises;

export {
  readFile,
  writeFile,
  readdir,
  copyFile
};
export { PathLike } from 'fs';
export { join, basename } from 'path';

export const exists = async (path: PathLike): Promise<boolean> => {
  try {
    await access(resolve(path.toString()), constants.F_OK);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    } else {
      throw error;
    }
  }
};

export const notExists = async (path: PathLike): Promise<boolean> => !(await exists(path));

export const mkdirs = async (path: PathLike): Promise<void> => {
  const parent = dirname(resolve(path.toString()));
  if (await notExists(parent)) {
    await mkdirs(parent);
  }
  if (await notExists(path)) {
    await mkdir(path);
  }
};

export const rimraf = async (path: PathLike): Promise<void> => {
  if (await notExists(path)) {
    return;
  }
  if ((await stat(path)).isFile()) {
    await unlink(path);
    return;
  }

  for (const file of await readdir(path)) {
    await rimraf(join(path.toString(), file));
  }

  await rmdir(path);
};
