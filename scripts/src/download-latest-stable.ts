import { requestRaw, listReleases } from './github';
import { mkdirs, dirname, writeFile, join } from './fs';
import JSZip from 'jszip';

main();

async function main(): Promise<void> {
  let downloadUrl: string | null = null;

  for await (const release of listReleases('RanolP', 'dalmoori-font')) {
    const asset = release.assets.find(asset => asset.name === 'dalmoori-font.zip');
    if (asset == null) {
      continue;
    }
    console.log(release.tagName + ' will be used.');
    downloadUrl = asset.downloadUrl;
    break;
  }

  if (downloadUrl === null) {
    console.log('Font not available.... what?!');
    process.exit(1);
  }

  const response = await requestRaw(downloadUrl);
  const zipFile = await JSZip.loadAsync(await response.buffer());

  const target = join(__dirname, '../../public/latest-stable/');

  for (const entry of zipFile.file(/.*/)) {
    const filename = target + entry.name;
    if (entry.dir) {
      await mkdirs(filename);
    } else {
      await mkdirs(dirname(filename));
      const buffer = await entry.async('nodebuffer');
      await writeFile(filename, buffer);
    }
  }
}
