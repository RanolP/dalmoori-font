import { listReleases } from './github';
import fs from 'fs';
import path from 'path';

interface ReleaseFont {
  tagName: string;
  commitHash: string;
  publishedAt: string;
  assets: Array<{
    name: string;
    downloadUrl: string;
  }>;
  body: string;
}

main();

async function main(): Promise<void> {

  const result: ReleaseFont[] = [];

  for await (const release of listReleases('RanolP', 'dalmoori-font')) {
    result.push({
      tagName: release.tagName,
      commitHash: release.commitHash,
      publishedAt: release.publishedAt.toISO(),
      assets: release.assets,
      body: release.body,
    });
    console.log(release.tagName + ' has been added to preview font');
  }

  fs.writeFileSync(path.join(__dirname, '../../src/lib/data/stable-font.data.json'), JSON.stringify(result));
}
