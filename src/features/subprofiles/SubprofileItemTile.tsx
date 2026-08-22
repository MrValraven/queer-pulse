import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ItemStateChip } from "./ItemStateChip";
import { workMeta } from "./personaSkinRender";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * One `.pp-tile` in a `.pp-tiles` grid (visual sections — portfolio, looks,
 * discography, projects, menus…). The plate number (`Pl. 01`) is studio-skin
 * decoration, CSS-hidden (`.plate{display:none}`) everywhere else — rendered
 * unconditionally so the same markup works for every skin. A gig/work-state
 * chip appears when the item carries one (e.g. a `projects` tile's
 * `workState`), reusing the row chip's `.gigstate` styling and class map.
 *
 * `onOpenWork`, when passed (studio skin only — see `SubprofileSections`),
 * turns the tile into a button that opens the studio lightbox on this exact
 * item; CSS alone gives it `cursor:zoom-in` on that skin
 * (`.pp[data-skin="studio"] .pp-tile{cursor:zoom-in}`). Every other skin
 * keeps the plain, non-interactive `<div>`.
 */
export function SubprofileItemTile({
  item,
  index,
  onOpenWork,
}: {
  item: SubprofileItemView;
  index: number;
  /** Opens the studio lightbox on this item — passed only for studio-skin
   *  visual tiles; the caller resolves the flattened lightbox index via
   *  `getStudioWorks(...).indexOf(item)` (see `skins/studioWorks.ts`). */
  onOpenWork?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const plateNumber = String(index + 1).padStart(2, "0");
  const studioMeta = workMeta(item);

  const content = (
    <>
      <div className="art">
        <ImageSlot
          src={item.imageUrl || undefined}
          alt={item.title}
          tint="plum"
          radius={0}
          height="100%"
          // `.ph` is the skin-specific placeholder pattern class (a hatched
          // texture per skin, e.g. stage's diagonal dashes) from the ported
          // design stylesheet — merges alongside ImageSlot's own tint styling.
          className="ph"
        />
      </div>
      <div>
        <span className="plate">
          {t("subprofiles:tile.plate", { number: plateNumber })}
        </span>
        <ItemStateChip item={item} />
        <b>{item.title}</b>
        {studioMeta && <small className="tile-meta">{studioMeta}</small>}
      </div>
    </>
  );

  if (onOpenWork) {
    return (
      <button
        type="button"
        className="pp-tile pp-tile-btn"
        onClick={() => onOpenWork(item)}
      >
        {content}
      </button>
    );
  }

  return <div className="pp-tile">{content}</div>;
}
