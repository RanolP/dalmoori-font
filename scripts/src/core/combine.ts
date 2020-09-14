import { AsciiFont } from './asciiFont';
import { Coda, Nucleus, Onset } from './hangul-phoneme';

export function combine(onset: Onset, nucleus: Nucleus, coda?: Coda): AsciiFont {
  const WIDTH = 8;
  const HEIGHT = 8;

  const heightList: Array<[AsciiFont | undefined, number]> = coda?.heightList
    .flatMap(height => {
      const font = coda.fontForHeight(height);
      return [font.meta['margin-top'] as number | number[] ?? 0]
        .flat()
        .sort((a, b) => b - a)
        .map(marginTop => [font, marginTop + height] as [AsciiFont | undefined, number]);
    }) ?? [[undefined, 0]];

  for (const [codaFont, codaHeight] of heightList) {
    for (const nucleusVariant of nucleus.variants) {
      if (HEIGHT < codaHeight + nucleusVariant.heightOccupying) {
        continue;
      }
      for (const marginTop of nucleusVariant.marginTop) {
        if (HEIGHT < codaHeight + nucleusVariant.heightOccupying + marginTop) {
          continue;
        }
        for (const marginLeft of nucleusVariant.marginLeft) {
          for (const onsetPart of onset.find(
            WIDTH - nucleusVariant.widthOccupying - marginLeft,
            HEIGHT - nucleusVariant.heightOccupying - marginTop - codaHeight
          )) {
            if (onsetPart.targetFor) {
              if (!onsetPart.targetFor.test(`${nucleus.name.compat}${coda?.name.compat ?? ''}`)) {
                continue;
              }
            }
            if (onsetPart.notTargetFor) {
              if (onsetPart.notTargetFor.test(`${nucleus.name.compat}${coda?.name.compat ?? ''}`)) {
                continue;
              }
            }
            const requirements = onsetPart.variantRequirementsMap[nucleus.name.compat] ?? [];
            if (coda !== undefined) {
              requirements.push(`coda-${codaHeight}`);
            }
            if (requirements.some(requirement => !nucleusVariant.variantsApplied[requirement])) {
              continue;
            }

            try {
              return onsetPart.font.with(nucleusVariant.font).with(codaFont);
            } catch {
              /* do nothing */
            }
          }
        }
      }
    }
  }

  throw Error(`Cannot combine ${(onset.name.std + nucleus.name.std + (coda?.name.std ?? '')).normalize('NFC')}`);
}
