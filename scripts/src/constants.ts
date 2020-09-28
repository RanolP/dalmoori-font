
/*
 * Microsoft Windows requires emHeight bigger than 8
 */
export const FullWidthSize = 64;
export const OnePixel = FullWidthSize / 8;
export const Version = '0.100';

export const Paths = {
  glyphBase: './glyph',
  build: './build',
  artifacts: '../artifacts',
  font: '../font',
};

export const IsCI = Boolean(process.env['CI']);
