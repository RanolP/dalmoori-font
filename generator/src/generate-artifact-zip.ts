import JSZip from 'jszip';
import { Paths } from './constants';
import { exists, join, readFile, writeFile } from './util/fs';

export async function generateArtifactZip(): Promise<void> {
  const zip = new JSZip();
  zip.file('dalmoori.ttf', await readFile(join(Paths.artifacts, 'dalmoori.ttf')));
  zip.file('dalmoori.woff', await readFile(join(Paths.artifacts, 'dalmoori.woff')));
  zip.file('dalmoori.woff2', await readFile(join(Paths.artifacts, 'dalmoori.woff2')));
  zip.file('LICENSE', await readFile(join(Paths.artifacts, 'LICENSE')));
  if (await exists(join(Paths.artifacts, 'advancement-report.md'))) {
    zip.file('advancement-report.md', await readFile(join(Paths.artifacts, 'advancement-report.md')));
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
  });

  await writeFile(join(Paths.root, 'dalmoori.zip'), buffer);
}
