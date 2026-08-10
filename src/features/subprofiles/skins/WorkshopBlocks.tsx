import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

/** A fixed set of alternating tick marks for the drafting-sheet scale bar —
 *  decorative only (the whole `.sheetmarks` overlay is `aria-hidden`), not
 *  derived from any persona data. */
const SCALE_TICK_COUNT = 6;

/** Workshop `top` slot: the drafting-sheet corner marks + scale bar. Purely
 *  decorative chrome (`aria-hidden`) — always renders for the workshop skin,
 *  independent of persona data. */
export function WorkshopSheetMarks() {
  const { t } = useTranslation();
  return (
    <div className="sheetmarks" aria-hidden="true">
      <span className="sm tl" />
      <span className="sm tr" />
      <span className="sm bl" />
      <span className="sm br" />
      <span className="scalebar">
        {Array.from({ length: SCALE_TICK_COUNT }, (_, index) => (
          <i key={index} />
        ))}
        <em>{t("subprofiles:skinExtras.workshop.scaleLabel")}</em>
      </span>
    </div>
  );
}

/** The workshop skin's code/snippet block, rendered inside the generic
 *  Spotlight (Task 3) when the featured item has `structured.snippet` — not
 *  part of the `SubprofileSkinExtras` slot switch, exported here so
 *  `SubprofileSpotlight.tsx` can reuse it directly. `null` when the item has
 *  no snippet lines. */
export function WorkshopSnippet({ item }: { item: SubprofileItemView }) {
  if (!item.structured?.snippet || item.structured.snippet.length === 0) {
    return null;
  }
  return <pre className="snippet">{item.structured.snippet.join("\n")}</pre>;
}
