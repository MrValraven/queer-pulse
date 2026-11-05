import { personaWallCropOf } from "../../subprofiles/api/personaWall.api";
import {
  personaMonogram,
  toAccentKey,
} from "../../subprofiles/api/directoryCard.adapters";
import { PersonaPortraitArt } from "../../subprofiles/PersonaPortraitArt";
import type { LeadPersonaDTO } from "./api/leads.types";
import styles from "./LeadParts.module.css";

const SIZE_CLASS: Record<32 | 40 | 48, string | undefined> = {
  32: styles.thumbSize32,
  40: styles.thumbSize40,
  48: styles.thumbSize48,
};

/** Pixels requested from a resizable image host: twice the box, for sharp
 *  pictures on dense screens. */
const IMAGE_SRC_SIZE = 96;

/**
 * A linked persona's picture beside its name: the avatar with its crop, else
 * the monogram on the default accent tint (a lead's persona carries no
 * accent). Decorative, since the name always sits beside it.
 */
export function LeadPersonaThumb({
  persona,
  size = 40,
}: {
  persona: LeadPersonaDTO;
  size?: 32 | 40 | 48;
}) {
  return (
    <div
      aria-hidden="true"
      className={[styles.thumb, SIZE_CLASS[size]].filter(Boolean).join(" ")}
    >
      <PersonaPortraitArt
        imageUrl={persona.avatarUrl}
        imageFocus={personaWallCropOf(persona.avatarCrop)}
        accent={toAccentKey(null)}
        monogram={personaMonogram(persona.displayName)}
        imageSrcSize={IMAGE_SRC_SIZE}
        monogramPlacement="center"
      />
    </div>
  );
}
