
/*
 * We're creating a font sized 8x8.
 * But Microsoft Windows require 64 <= emHeight...
 */
export const FullWidthSize = 64;
export const OnePixel = FullWidthSize / 8;
export const Version = '0.1';

export const Paths = {
  glyphBase: './glyph',
  build: './build',
};

export const IsCI = Boolean(process.env['CI']);
