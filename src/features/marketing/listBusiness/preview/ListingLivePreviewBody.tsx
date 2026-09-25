import type { ReactNode } from "react";
import { FiCamera } from "react-icons/fi";
import { useProfileData } from "../../../../app/providers/useProfile";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { submittedToPlace } from "../../api/directory.adapters";
import { LocalBusinessCardBody } from "../../LocalBusinessCardBody";
import {
  PHOTO_KEYS,
  slugify,
  type ListingDraft,
  type PendingListing,
  type PhotoKey,
} from "../listBusiness.data";
import { ListingLivePreviewExcerpt } from "./ListingLivePreviewExcerpt";
import { ListingPreviewFieldCaption } from "./ListingPreviewFieldCaption";
import {
  highlightedRegionsFor,
  placementForAnchor,
} from "./listingPreviewRegions.data";
import previewStyles from "./ListingLivePreview.module.css";
import styles from "../ListBusinessPage.module.css";
import dirStyles from "../../DirectoryPage.module.css";

/**
 * The live preview's content: which spot the current field fills, the real
 * directory card (or a placeholder until there is a name), and the "on your
 * page" excerpt. Shared by the create wizard's preview column and the owner
 * editor's, so the two cannot drift. The caller owns the column around it.
 */
export function ListingLivePreviewBody({
  draft,
  photoPreviews,
  activeAnchor,
  onAddPhoto,
  header,
  isHeaderSticky = false,
}: {
  draft: ListingDraft;
  photoPreviews: Record<PhotoKey, string>;
  /** The field the member is on (useFocusedListingField's `activeAnchor`);
   *  null shows the idle caption. */
  activeAnchor: string | null;
  /** Wired to the empty-photo "Add cover photo" button; omitted = no button. */
  onAddPhoto?: () => void;
  /** Rendered above the caption inside one wrapper, so a scrolling column can
   *  keep both in view. */
  header?: ReactNode;
  /** The editor column scrolls on its own: pin the header + caption to its top. */
  isHeaderSticky?: boolean;
}) {
  const { profile } = useProfileData();
  // The member's photo as the directory serves it: withheld when they turned
  // their photo off (the server applies the same `photoVisible` filter). The
  // card and excerpt then show it only for a public, profile-linked owner.
  const ownerPhotoUrl =
    profile.photoVisible !== false ? (profile.photo ?? null) : null;
  const placement = placementForAnchor(activeAnchor, draft);
  // Only a field whose spot is drawn right now outlines anything. A private
  // or full-page field, or one whose spot is not on screen yet, leaves the
  // preview undimmed and lets the caption speak.
  const highlightedRegions = highlightedRegionsFor(placement, draft);
  const highlight =
    highlightedRegions.length > 0 ? highlightedRegions.join(" ") : undefined;

  return (
    <div className={previewStyles.body} data-highlight={highlight}>
      <div
        className={previewStyles.captionBar}
        data-preview-caption-bar=""
        data-sticky={isHeaderSticky ? "" : undefined}
      >
        {header}
        <ListingPreviewFieldCaption
          placement={placement}
          isDrawn={highlightedRegions.length > 0}
        />
      </div>
      <ListingPreviewCard
        draft={draft}
        photoPreviews={photoPreviews}
        ownerPhotoUrl={ownerPhotoUrl}
        onAddPhoto={onAddPhoto}
      />
      <ListingLivePreviewExcerpt
        draft={draft}
        ownerPhotoUrl={ownerPhotoUrl}
        highlightedRegions={highlightedRegions}
      />
    </div>
  );
}

/** The directory card exactly as the grid renders it, or the dashed
 *  placeholder while the listing still has no name. */
function ListingPreviewCard({
  draft,
  photoPreviews,
  ownerPhotoUrl,
  onAddPhoto,
}: {
  draft: ListingDraft;
  photoPreviews: Record<PhotoKey, string>;
  ownerPhotoUrl: string | null;
  onAddPhoto?: () => void;
}) {
  const { t } = useTranslation();

  if (draft.name.trim().length === 0) {
    return (
      <div className={`${styles.dirCard} ${styles.dirCardEmpty}`}>
        <div className={styles.dirTop}>
          <span
            className={`${styles.dirAv} ${styles.dirAvEmpty}`}
            data-preview-region="chrome"
          >
            +
          </span>
          <div>
            <div className={styles.dirName} data-preview-region="name">
              <span className={styles.dirNamePh}>
                {t("marketing:listBusiness.preview.placeholderName")}
              </span>
            </div>
            <div className={styles.dirMeta} data-preview-region="meta">
              {t("marketing:listBusiness.preview.placeholderMeta")}
            </div>
          </div>
        </div>

        <div
          className={`${styles.dirBlurb} ${styles.dirBlurbPh}`}
          data-preview-region="desc"
        >
          {t("marketing:listBusiness.preview.placeholderBlurb")}
        </div>
      </div>
    );
  }

  // Same shape the real directory card renders from, so the preview can
  // never drift from the live card again. `photoPreviews` (the just-uploaded
  // blob URL) wins over the persisted `draft.photos` value, mirroring the
  // wizard's own display convention (see ListingPhotoGallery).
  const submittedPlace = submittedToPlace(
    {
      ...draft,
      ref: "",
      slug: slugify(draft.name),
      status: "review",
      submittedBy: "",
      photos: PHOTO_KEYS.reduce(
        (photos, key) => {
          photos[key] = photoPreviews[key] || draft.photos[key];
          return photos;
        },
        {} as Record<PhotoKey, string>,
      ),
    } satisfies PendingListing,
    ownerPhotoUrl,
  );
  // The real card says "run by <first>" only for a profile-linked listing
  // (the backend's `memberFirst`), so the preview hides it the same way.
  const place = draft.linkToProfile
    ? submittedPlace
    : { ...submittedPlace, owner: { ...submittedPlace.owner, first: "" } };

  return (
    <div className={dirStyles.card}>
      <LocalBusinessCardBody
        place={place}
        photoOverlay={
          !place.photos?.wide &&
          onAddPhoto && (
            // A static wrapper, so the button keeps its own transitions and
            // still centres on the photo slot.
            <span data-preview-region="chrome">
              <Button
                variant="ghost-dark"
                size="sm"
                className={styles.previewAddPhotoBtn}
                onClick={onAddPhoto}
              >
                <FiCamera aria-hidden />{" "}
                {t("marketing:listBusiness.preview.addPhoto")}
              </Button>
            </span>
          )
        }
      />
    </div>
  );
}
