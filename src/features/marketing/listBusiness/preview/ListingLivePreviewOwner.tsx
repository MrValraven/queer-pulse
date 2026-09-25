import { Avatar } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { initials, type ListingDraft } from "../listBusiness.data";
import { isCoManaged } from "../ownerPersonalFields";
import {
  ownerPlaceholderKey,
  shownOwnerName,
} from "./listingPreviewRegions.data";
import previewStyles from "./ListingLivePreview.module.css";
import styles from "../ListBusinessPage.module.css";

/**
 * The excerpt's "who runs it" block, built from the same rules as the real
 * page's byline (`DirectoryOwnerByline` over `submittedOwnerIdentity`): the
 * name, or the role in "role" mode, then the role (public mode only) and
 * whether the owner is on QueerPulse. The owner's own photo shows only for a
 * public, profile-linked owner, as on the real card and page.
 */
export function ListingLivePreviewOwner({
  draft,
  ownerPhotoUrl,
  isHighlighted,
}: {
  draft: ListingDraft;
  /** The signed-in member's photo, already filtered by their photo setting. */
  ownerPhotoUrl: string | null;
  isHighlighted: boolean;
}) {
  const { t } = useTranslation();

  // A co-manager's draft never carries the owner's details, so the preview
  // cannot draw them. The real page still shows them. The role is the one
  // part a co-manager edits, so it shows under the line once set.
  if (isCoManaged(draft)) {
    const coManagedRole = draft.ownerRole.trim();
    return (
      <div className={styles.pdOwner} data-preview-region="owner">
        <div>
          <p className={previewStyles.placeholderLine}>
            {t("marketing:listBusiness.livePreview.placeholder.ownerCoManaged")}
          </p>
          {coManagedRole && (
            <div className={styles.pdOwnerRole}>{coManagedRole}</div>
          )}
        </div>
      </div>
    );
  }

  const ownerShownName = shownOwnerName(draft);
  if (!ownerShownName) {
    if (!isHighlighted) return null;
    return (
      <div className={styles.pdOwner} data-preview-region="owner">
        <p className={previewStyles.placeholderLine}>
          {t(ownerPlaceholderKey(draft))}
        </p>
      </div>
    );
  }

  const isOnQueerPulse = draft.visibility === "public" && draft.linkToProfile;
  const shownRole = draft.visibility === "public" ? draft.ownerRole.trim() : "";
  const ownerLine = [
    shownRole,
    t(
      isOnQueerPulse
        ? "marketing:directory.detail.onQueerPulse"
        : "marketing:directory.detail.addedByMember",
    ),
  ]
    .filter(Boolean)
    .join(" · ");
  const photoUrl = isOnQueerPulse ? ownerPhotoUrl : null;

  return (
    <div className={styles.pdOwner} data-preview-region="owner">
      {/* Initials of what is shown, as the real page does (its owner name
          is the role in "role" mode), so a private name never leaks. */}
      {photoUrl ? (
        <Avatar size={36} initials={initials(ownerShownName)} src={photoUrl} />
      ) : (
        <span className={styles.pdOwnerAv}>{initials(ownerShownName)}</span>
      )}
      <div>
        <div className={styles.pdOwnerName}>{ownerShownName}</div>
        <div className={styles.pdOwnerRole}>{ownerLine}</div>
      </div>
    </div>
  );
}
