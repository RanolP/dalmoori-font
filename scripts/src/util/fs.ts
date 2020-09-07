import { mkdir, access } from 'fs/promises';
import { PathLike, constants } from 'fs';
import { dirname, resolve } from 'path';

export { readFile, writeFile } from 'fs/promises';
export { PathLike } from 'fs';
export { join } from 'path';

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
}

export const notExists = async (path: PathLike): Promise<boolean> => !(await exists(path));

export const mkdirs = async (path: PathLike): Promise<void> => {
  const parent = dirname(resolve(path.toString()));
  if (await notExists(parent)) {
    await mkdirs(parent);
  }
  if (await notExists(path)) {
    await mkdir(path);
  }
}