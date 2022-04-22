import { AsciiFont } from './ascii-font.js';
import { Coda, CodaPart, Nucleus, Onset } from './hangul-phoneme.js';

export function combine(onset: Onset, nucleus: Nucleus, coda?: Coda): AsciiFont {
  const WIDTH = 8;
  const HEIGHT = 8;

  const heightList: Array<[CodaPart | undefined, [number, number]]> = coda?.parts
    .flatMap(part =>
      part.marginTop
        .flat()
        .sort((a, b) => b - a)
        .map(marginTop => [part, [marginTop, part.height]] as [CodaPart | undefined, [number, number]])
    ) ?? [[undefined, [0, 0]]];

  for (const [codaPart, [marginTopCoda, codaHeight]] of heightList) {
    const realCodaHeight = marginTopCoda + codaHeight;
    for (const nucleusVariant of nucleus.variants) {
      if (HEIGHT < realCodaHeight + nucleusVariant.heightOccupying) {
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
        requirements.push(`coda-${realCodaHeight}`);
        if (requirements.some((requirement) => !nucleusVariant.variantsApplied[requirement])) {
          continue;
        }
      }
      for (const marginTopNucleus of nucleusVariant.marginTop) {
        if (HEIGHT < realCodaHeight + nucleusVariant.heightOccupying + marginTopNucleus) {
          continue;
        }
        for (const marginLeft of nucleusVariant.marginLeft) {
          for (const onsetPart of onset.find(
            WIDTH - nucleusVariant.widthOccupying - marginLeft,
            HEIGHT - nucleusVariant.heightOccupying - marginTopNucleus - realCodaHeight,
          )) {
            const onsetTests = [
              nucleus.name.compat + (marginTopNucleus + nucleusVariant.heightOccupying).toString(),
              nucleus.name.compat + marginTopNucleus + ' ' + nucleusVariant.heightOccupying,
            ].flatMap((n) =>
              (coda
                ? [
                  coda.name.compat + (marginTopCoda + codaHeight).toString(),
                  coda.name.compat + marginTopCoda + ' ' + codaHeight,
                ]
                : ['.0']
              ).map((c) =>  n + c)
            );
            if (onsetPart.targetFor) {
              const regexp = onsetPart.targetFor;
              if (!onsetTests.some((tc) => regexp.test(tc))) {
                continue;
              }
            }
            if (onsetPart.notTargetFor) {
              const regexp = onsetPart.notTargetFor;
              if (onsetTests.some((tc) => regexp.test(tc))) {
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
