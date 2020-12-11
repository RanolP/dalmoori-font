import unstableFonts from './unstable-font.data.json';

export interface UnstableFont {
  downloadUrl: string;
  expired: boolean;
  expiresAt: string;
  sizeInBytes: number;
  headCommit: {
    sha: string;
    message: string;
  }
}

export default unstableFonts as UnstableFont[];
