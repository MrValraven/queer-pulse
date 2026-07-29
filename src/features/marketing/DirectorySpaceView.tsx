import { type DirectoryPlace, type Tint } from "./directoryPlaces";
import { DirectorySpaceMain } from "./DirectorySpaceMain";
import { DirectorySpaceAside } from "./DirectorySpaceAside";
import s from "./DirectorySpacePage.module.css";

const GCELL: Record<Tint, string> = {
  coral: "",
  jade: s.gCellJade!,
  plum: s.gCellPlum!,
};

/**
 * The public directory detail body: cover gallery + two-column grid. Shared by
 * the real page (`DirectorySpacePage`) and the admin moderation preview
 * (`ListingPreviewDrawer`), so both show the identical live view. `preview`
 * makes it read-only: no review form, inert contact/back CTAs.
 */
export function DirectorySpaceView({
  place,
  preview = false,
}: {
  place: DirectoryPlace;
  preview?: boolean;
}) {
  return (
    <>
      <div className={s.cover}>
        <div className={s.coverInner}>
          <div className={s.gallery}>
            {place.gallery.map((caption, index) => (
              <div
                key={index}
                className={[s.gCell, GCELL[place.tint]].join(" ")}
              >
                <span className={s.gCap}>{caption}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={s.page}>
        <div className={s.grid}>
          <DirectorySpaceMain place={place} preview={preview} />
          <DirectorySpaceAside place={place} preview={preview} />
        </div>
      </div>
    </>
  );
}
