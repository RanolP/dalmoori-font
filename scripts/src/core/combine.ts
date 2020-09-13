import { AsciiFont } from './asciiFont';
import { Coda, Nucleus, Onset } from './hangul-phoneme';

export function combine(onset: Onset, nucleus: Nucleus, coda?: Coda): AsciiFont {
  const WIDTH = 8;
  const HEIGHT = 8;
  for (const codaHeight of coda?.heightList ?? [0]) {
    for (const nucleusVariant of nucleus.variants) {
      if (HEIGHT < codaHeight + nucleusVariant.heightOccupying) {
        continue;
      }
      for (const marginTop of nucleusVariant.marginTop) {
        if (HEIGHT < codaHeight + nucleusVariant.heightOccupying + marginTop) {
          continue;
        }
        for (const marginLeft of nucleusVariant.marginLeft) {
          const onsetPart = onset.find(
            WIDTH - nucleusVariant.widthOccupying - marginLeft,
            HEIGHT - nucleusVariant.heightOccupying - marginTop - codaHeight
          );
          if (onsetPart === undefined) {
            continue;
          }

          const requirements = onsetPart.variantRequirementsMap[nucleus.name.compat] ?? [];
          if (coda !== undefined) {
            requirements.push(`coda-${codaHeight}`);
          }
          if (requirements.some(requirement => !nucleusVariant.variantsApplied[requirement])) {
            continue;
          }

          return onsetPart.font.with(nucleusVariant.font).with(coda?.fontForHeight(codaHeight));
        }
      }
    }
  }

  throw Error(`Cannot combine ${(onset.name.std + nucleus.name.std + (coda?.name.std ?? '')).normalize('NFC')}`);
}
