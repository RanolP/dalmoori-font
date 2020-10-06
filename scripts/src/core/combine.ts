import { AsciiFont } from './ascii-font';
import { Coda, CodaPart, Nucleus, Onset } from './hangul-phoneme';

export function combine(onset: Onset, nucleus: Nucleus, coda?: Coda): AsciiFont {
  const WIDTH = 8;
  const HEIGHT = 8;

  const heightList: Array<[CodaPart | undefined, number]> = coda?.parts
    .flatMap(part =>
      part.marginTop
        .flat()
        .sort((a, b) => b - a)
        .map(marginTop => [part, marginTop + part.height] as [CodaPart | undefined, number])
    ) ?? [[undefined, 0]];

  for (const [codaPart, codaHeight] of heightList) {
    for (const nucleusVariant of nucleus.variants) {
      if (HEIGHT < codaHeight + nucleusVariant.heightOccupying) {
        continue;
      }
      if (codaPart !== undefined) {
        if (codaPart.targetFor) {
          if (!codaPart.targetFor.test(`${onset.name.compat}${nucleus.name.compat}`)) {
            continue;
          }
        }
        if (codaPart.notTargetFor) {
          if (codaPart.notTargetFor.test(`${onset.name.compat}${nucleus.name.compat}`)) {
            continue;
          }
        }
        const requirements = codaPart.variantRequirementsMap[nucleus.name.compat] ?? [];
        requirements.push(`coda-${codaHeight}`);
        if (requirements.some(requirement => !nucleusVariant.variantsApplied[requirement])) {
          continue;
        }
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
              if (!onsetPart.targetFor.test(`${nucleus.name.compat}${nucleusVariant.heightOccupying + marginTop}${coda ? coda.name.compat + codaHeight : '.0'}`)) {
                continue;
              }
            }
            if (onsetPart.notTargetFor) {
              if (onsetPart.notTargetFor.test(`${nucleus.name.compat}${nucleusVariant.heightOccupying + marginTop}${coda ? coda.name.compat + codaHeight : '.0'}`)) {
                continue;
              }
            }
            const requirements = onsetPart.variantRequirementsMap[nucleus.name.compat] ?? [];
            if (requirements.some(requirement => !nucleusVariant.variantsApplied[requirement])) {
              continue;
            }

            try {
              return onsetPart.font.with(nucleusVariant.font).with(codaPart?.font);
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
