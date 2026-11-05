import {
  personaWallCropOf,
  type PersonaWallPersonaDTO,
} from "../../subprofiles/api/personaWall.api";
import {
  personaMonogram,
  toAccentKey,
} from "../../subprofiles/api/directoryCard.adapters";
import { PersonaPortraitArt } from "../../subprofiles/PersonaPortraitArt";
import styles from "./PersonaWallThumb.module.css";

const SIZE_CLASS: Record<40 | 48, string | undefined> = {
  40: styles.size40,
  48: styles.size48,
};

/**
 * A persona's picture on the wall curation page: the avatar, else the cover,
 * else the monogram on the persona's own accent tint (the default accent when
 * it has none). Decorative, because the name sits right beside it.
 */
export function PersonaWallThumb({
  persona,
  size = 48,
}: {
  persona: PersonaWallPersonaDTO;
  size?: 40 | 48;
}) {
  return (
    <div
      aria-hidden="true"
      className={[styles.thumb, SIZE_CLASS[size]].filter(Boolean).join(" ")}
    >
      <PersonaPortraitArt
        imageUrl={persona.imageUrl}
        imageFocus={personaWallCropOf(persona.imageCrop)}
        accent={toAccentKey(persona.accent)}
        monogram={personaMonogram(persona.displayName)}
        imageSrcSize={96}
        monogramPlacement="center"
      />
    </div>
  );
}
