import type { ReactNode, SyntheticEvent } from "react";
import { FiBookmark, FiCheck } from "react-icons/fi";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { DirectoryCardAccess } from "./DirectoryCardAccess";
import { DirectoryCardMeta } from "./DirectoryCardMeta";
import { DirectoryCardRating } from "./DirectoryCardRating";
import { DirectoryCardStatus } from "./DirectoryCardStatus";
import { DirectoryCardVisit } from "./DirectoryCardVisit";
import { SafeSpaceCardMark } from "./SafeSpaceCardMark";
import { listingTagLabel } from "./listBusiness/listingTags.data";
import { OWNED_BY_TAG_KEYS } from "./listBusiness/listingOwnedBy.data";
import {
  ownershipBadgeOf,
  OWNERSHIP_BADGE_KEYS,
  type DirectoryPlace,
} from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/**
 * The two things the photo's bottom-left corner says about a place: how it is
 * connected to the community (always), and what its safe-space badge is
 * currently saying (only when there is a badge to speak of).
 *
 * They sit side by side rather than one replacing the other: the safe-space
 * pill used to occupy the same slot and simply hide the ownership badge, so a
 * verified safe space never got to say it was queer-owned. Safe space is the
 * narrower, rarer claim, so it shrinks to an icon with its meaning on hover,
 * focus and via its accessible name, leaving the wordier badge the room.
 *
 * The safe-space half lives in `SafeSpaceCardMark`, which is the only place
 * that turns the card payload into a mark. This used to test
 * `safeSpaceStatus === "verified"` inline, which printed the verified shield
 * for a badge the platform had already suspended.
 */
function DirectoryCardBadges({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const ownership = ownershipBadgeOf(place);

  return (
    <span className={s.photoBadges}>
      <span className={s.photoBadgeDark} data-preview-region="badge">
        {ownership === "verified" && (
          <FiCheck className={s.photoBadgeCheck} aria-hidden />
        )}
        <span className={s.photoBadgeText}>
          {t(OWNERSHIP_BADGE_KEYS[ownership])}
        </span>
      </span>
      <SafeSpaceCardMark place={place} />
    </span>
  );
}

/**
 * The card's visuals only — photo, badges, name/rating, meta, description,
 * pills, and footer. Shared by `LocalBusinessCard` (the live, clickable card
 * in the directory grid) and the listing wizard's sticky preview, so the two
 * can never drift apart again.
 */
export function LocalBusinessCardBody({
  place,
  saveControl,
  photoOverlay,
  topRight,
  showRating = true,
  showHost = true,
  shouldShowSave = true,
  visitSlot,
  photoTag,
}: {
  place: DirectoryPlace;
  /** Present on the live card (wraps a real save toggle); absent on the
   *  wizard preview, where the bookmark renders as a static, unsaved icon. */
  saveControl?: { saved: boolean; onSave: (event: SyntheticEvent) => void };
  /** Rendered over the photo slot — the wizard preview uses this for its
   *  "add a cover photo" call to action when there's no photo yet. Suppresses
   *  the empty-slot caption (both are centered and would otherwise overlap). */
  photoOverlay?: ReactNode;
  /** Replaces the bookmark in the photo's top-right corner. The profile's
   *  "Places you run" grid puts its LIVE / IN REVIEW chip there — an owner
   *  can't meaningfully save their own listing. Overrides `saveControl`. */
  topRight?: ReactNode;
  /** Drop the star rating (default: shown). The profile's owner grid passes
   *  false for a submitted listing. A place with no reviews shows no rating
   *  either way (see `DirectoryCardRating`). */
  showRating?: boolean;
  /** Drop the "run by <first>" avatar in the footer (default: shown). Both
   *  profile views already sit under that member's own name. */
  showHost?: boolean;
  /** Drop the bookmark corner entirely, `saveControl`/static fallback alike
   *  (default: shown). A save toggle makes no sense on the card a shared
   *  place link renders as inside a chat bubble: there is nothing on that
   *  surface to save it FROM. */
  shouldShowSave?: boolean;
  /** Replaces the footer's "Visit →" call to action, so the owner grid can
   *  say "View listing →" (or "Awaiting review" while it's still pending). */
  visitSlot?: ReactNode;
  /** A small chip pinned to the photo's top-left corner. The "Within a short
   *  walk" strip puts the distance there: it sits clear of both the badge
   *  (bottom-left) and the bookmark (top-right), so the card is otherwise
   *  identical to the one in the directory grid. */
  photoTag?: ReactNode;
}) {
  const { t } = useTranslation();

  // The `data-preview-region` attributes exist for the listing editor's live
  // preview highlight (see listBusiness/preview/listingPreviewRegions.data.ts).
  // "chrome" marks the parts no field fills, so they dim with the rest.
  return (
    <>
      <div className={s.photoWrap} data-preview-region="photo">
        <ImageSlot
          src={place.photos?.wide ?? undefined}
          alt={place.alt?.wide ?? place.name}
          height={168}
          // The saved rect is a focal REGION here, never an exact frame: the
          // strip is a fixed 168px band and `crop` would distort an off-aspect
          // photo (see ImageSlot's `crop` vs `focus`).
          focus={place.photoFocus}
          style={{ borderRadius: "18px 18px 0 0" }}
          placeholder={
            photoOverlay ? "" : t("marketing:directory.card.photoComing")
          }
        />
        <DirectoryCardBadges place={place} />
        {shouldShowSave &&
          (topRight ??
            (saveControl ? (
              <span
                role="button"
                tabIndex={0}
                aria-pressed={saveControl.saved}
                aria-label={t(
                  saveControl.saved
                    ? "marketing:directory.card.unsaveAriaLabel"
                    : "marketing:directory.card.saveAriaLabel",
                  { name: place.name },
                )}
                className={`${s.saveBtn} ${saveControl.saved ? s.saveBtnOn : ""}`}
                data-preview-region="chrome"
                onClick={saveControl.onSave}
                onKeyDown={(event) =>
                  activateOnKey(event, () => saveControl.onSave(event))
                }
              >
                <FiBookmark
                  aria-hidden
                  fill={saveControl.saved ? "currentColor" : "none"}
                />
              </span>
            ) : (
              <span
                className={s.saveBtn}
                aria-hidden
                data-preview-region="chrome"
              >
                <FiBookmark aria-hidden fill="none" />
              </span>
            )))}
        {photoTag && <span className={s.photoTag}>{photoTag}</span>}
        {photoOverlay}
      </div>

      <div className={s.nameRow}>
        {/* Clamped to two lines in a narrow column; `title` keeps the full
            name one hover away. */}
        <div className={s.name} data-preview-region="name" title={place.name}>
          {place.name}
        </div>
        {showRating && <DirectoryCardRating place={place} />}
      </div>
      <DirectoryCardMeta place={place} />
      <div className={s.desc} data-preview-region="desc">
        {place.desc}
      </div>
      {/* One row at most: "Member-run" and the owner's own "who runs it" tags
          lead so they are the pills that survive a narrow column (someone
          filtering for a trans-owned place must be able to see why each card
          matched), and the listing's tags fill whatever room is left. */}
      <div className={s.pillsRow} data-preview-region="pills">
        {place.member && (
          <span className={`${s.pill} ${s.pillMember}`}>
            {t("marketing:directory.card.memberRun")}
          </span>
        )}
        {(place.ownedBy ?? []).map((value) => (
          <span key={value} className={`${s.pill} ${s.pillOwnedBy}`}>
            {t(OWNED_BY_TAG_KEYS[value])}
          </span>
        ))}
        {place.pills.slice(0, 3).map((pill) => (
          <span key={pill} className={s.pill}>
            {listingTagLabel(t, pill)}
          </span>
        ))}
      </div>
      <DirectoryCardAccess place={place} />
      <div className={`${s.foot} ${s.listFoot}`}>
        <DirectoryCardStatus place={place} />
        {/* No name means nobody to show: a listing submitted anonymously (or
            under a role alone) used to print a bare initials bubble with no
            one beside it, which read as a person the card was refusing to
            name. */}
        {showHost && place.owner.first !== "" && (
          <span
            className={s.host}
            data-preview-region="host"
            title={place.owner.first}
          >
            {/* The member's real photo when they have one and chose to show
                it (the server redacts it exactly as it redacts the name);
                initials over their tint otherwise. No `name`/`alt`: their
                first name is right there beside it, so the image is
                decorative rather than read twice. */}
            <Avatar
              initials={place.owner.initials}
              tint={place.owner.tint}
              src={place.owner.avatarUrl ?? undefined}
              size={20}
            />
            <span className={s.hostName}>{place.owner.first}</span>
          </span>
        )}
        {visitSlot ?? <DirectoryCardVisit place={place} />}
      </div>
    </>
  );
}
