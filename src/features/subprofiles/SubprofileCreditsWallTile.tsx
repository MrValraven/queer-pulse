import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WallTileView } from "./api/directoryCard.adapters";
import { PersonaPortraitArt } from "./PersonaPortraitArt";
import { accentStyle } from "./subprofilePresence.data";
import {
  WALL_SCRIM_ACCENTS,
  type WallTileSpan,
} from "./subprofileCreditsWall.data";
import styles from "./SubprofileCreditsWall.module.css";

interface SubprofileCreditsWallTileProps {
  tile: WallTileView;
  span: WallTileSpan;
}

/**
 * One face on the hero's wall: the persona's picture (or its accent tint with
 * a corner monogram) filling the tile, and the name with the craft over its
 * foot. The whole tile links to the persona.
 *
 * Over a photo the caption sits on a plum-deep band, so cream type reads at
 * the same contrast on every picture. Over the tints whose own on-colour
 * misses AA (`WALL_SCRIM_ACCENTS`) the band is the tile's own tint deepened
 * with plum-deep, so it reads as a shade of the tile and not as a grey bar.
 * The other tints carry their on-colour type straight on the tint, as in the
 * approved design; a plum tint is lifted with cream so it stays off the band.
 */
export function SubprofileCreditsWallTile({
  tile,
  span,
}: SubprofileCreditsWallTileProps) {
  const { t } = useTranslation();
  const hasPhoto = tile.image !== null;
  const scrimKind = hasPhoto
    ? "photo"
    : WALL_SCRIM_ACCENTS.has(tile.accent)
      ? "tint"
      : undefined;
  const isPlumTint = !hasPhoto && tile.accent === "plum";

  return (
    <Link
      to={tile.href}
      className={styles.tile}
      style={accentStyle(tile.accent)}
      data-scrim={scrimKind}
      data-plum-tint={isPlumTint ? "true" : undefined}
    >
      <div className={styles.artBox}>
        <PersonaPortraitArt
          imageUrl={tile.image?.src ?? null}
          imageFocus={tile.image?.crop}
          accent={tile.accent}
          monogram={tile.monogram}
          imageSrcSize={span.imageSrcSize}
          monogramPlacement="corner"
          className={styles.art}
        />
      </div>
      <span className={styles.caption}>
        <span className={styles.name}>{tile.titleName}</span>
        <span className={styles.kind}>{t(tile.kindLabelKey)}</span>
      </span>
    </Link>
  );
}
