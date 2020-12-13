import stableFonts from './stable-font.data.json';

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

export default stableFonts as ReleaseFont[];
