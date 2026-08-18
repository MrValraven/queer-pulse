import { useState } from "react";
import { FiArrowRight, FiCamera } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { submittedToPlace } from "../api/directory.adapters";
import { LocalBusinessCardBody } from "../LocalBusinessCardBody";
import {
  DAYS,
  formatDayHours,
  goodForLabel,
  initials,
  langLabel,
  PHOTO_KEYS,
  slugify,
  type ListingDraft,
  type PendingListing,
  type PhotoKey,
} from "./listBusiness.data";
import { ListBusinessFullPreview } from "./ListBusinessFullPreview";
import styles from "./ListBusinessPage.module.css";
import dirStyles from "../DirectoryPage.module.css";

function hoursLine(draft: ListingDraft): string | null {
  const open = DAYS.filter((d) => draft.hours[d.id]?.open);
  const first = open[0];
  if (!first) return null;
  const sample = formatDayHours(draft.hours[first.id]);
  return `${open.map((d) => d.id).join(", ")} · ${sample ?? ""}`;
}

/** Sticky directory-card + detail-page preview that mirrors the live form. */
export function ListBusinessPreview({
  draft,
  userName,
  photoPreviews,
  editSlug,
  onAddPhoto,
}: {
  draft: ListingDraft;
  userName: string;
  photoPreviews: Record<PhotoKey, string>;
  /** Public slug of the listing being edited — present in edit mode, so the
   *  preview's deterministic tint matches the real card's. Absent in create
   *  mode, where the eventual slug doesn't exist yet. */
  editSlug?: string;
  /** Jumps the wizard to the photos step — wired to the preview's "add cover
   *  photo" call to action when there's no photo yet. */
  onAddPhoto: () => void;
}) {
  const { t } = useTranslation();
  const [showFull, setShowFull] = useState(false);
  const hasCard = draft.name.trim().length > 0;
  const wit = draft.whatItIs.filter((w) => w.text.trim());
  const hrs = hoursLine(draft);
  const showOwner = draft.visibility !== "anon" && draft.ownerName.trim();

  // Same shape the real directory card renders from, so the preview can
  // never drift from the live card again. `photoPreviews` (the just-uploaded
  // blob URL) wins over the persisted `draft.photos` value, mirroring the
  // wizard's own display convention (see ListingPhotoGallery).
  const place = hasCard
    ? submittedToPlace({
        ...draft,
        ref: "",
        slug: editSlug || slugify(draft.name),
        status: "review",
        submittedBy: "",
        photos: PHOTO_KEYS.reduce(
          (acc, key) => {
            acc[key] = photoPreviews[key] || draft.photos[key];
            return acc;
          },
          {} as Record<PhotoKey, string>,
        ),
      } satisfies PendingListing)
    : null;

  return (
    <aside className={styles.previewCol}>
      <div className={styles.pvHead}>
        <span className={styles.dot} />
        {t("marketing:listBusiness.preview.head")}
      </div>

      {place ? (
        <div className={dirStyles.card}>
          <LocalBusinessCardBody
            place={place}
            photoOverlay={
              !place.photos?.wide && (
                <Button
                  variant="ghost-dark"
                  size="sm"
                  className={styles.previewAddPhotoBtn}
                  onClick={onAddPhoto}
                >
                  <FiCamera aria-hidden />{" "}
                  {t("marketing:listBusiness.preview.addPhoto")}
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className={`${styles.dirCard} ${styles.dirCardEmpty}`}>
          <div className={styles.dirTop}>
            <span className={`${styles.dirAv} ${styles.dirAvEmpty}`}>+</span>
            <div>
              <div className={styles.dirName}>
                <span className={styles.dirNamePh}>
                  {t("marketing:listBusiness.preview.placeholderName")}
                </span>
              </div>
              <div className={styles.dirMeta}>
                {t("marketing:listBusiness.preview.placeholderMeta")}
              </div>
            </div>
          </div>

          <div className={`${styles.dirBlurb} ${styles.dirBlurbPh}`}>
            {t("marketing:listBusiness.preview.placeholderBlurb")}
          </div>
        </div>
      )}

      <div className={styles.pvDetail}>
        <div
          className={[styles.pdTagline, !draft.tagline && styles.pdTaglinePh]
            .filter(Boolean)
            .join(" ")}
        >
          {draft.tagline ||
            t("marketing:listBusiness.preview.placeholderTagline")}
        </div>

        {wit.length > 0 && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.whatItIs")}</h5>
            <ul className={styles.pdWit}>
              {wit.map((w) => (
                <li key={w.id}>{w.text}</li>
              ))}
            </ul>
          </div>
        )}

        {draft.goodFor.length > 0 && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.goodFor")}</h5>
            <div className={styles.pdChips}>
              {draft.goodFor.map((g) => (
                <span key={g}>{goodForLabel(t, g)}</span>
              ))}
            </div>
          </div>
        )}

        {draft.langs.length > 0 && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.languages")}</h5>
            <div className={styles.pdChips}>
              {draft.langs.map((l) => (
                <span key={l}>{langLabel(t, l)}</span>
              ))}
            </div>
          </div>
        )}

        {hrs && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.hours")}</h5>
            <div className={styles.dirMeta}>{hrs}</div>
          </div>
        )}

        {showOwner && (
          <div className={styles.pdOwner}>
            <span className={styles.pdOwnerAv}>
              {initials(draft.ownerName)}
            </span>
            <div>
              <div className={styles.pdOwnerName}>
                {draft.visibility === "role"
                  ? draft.ownerRole
                  : draft.ownerName}
              </div>
              <div className={styles.pdOwnerRole}>
                {draft.visibility === "role"
                  ? t("marketing:listBusiness.preview.roleShown")
                  : draft.ownerRole ||
                    t("marketing:listBusiness.preview.yourRole")}
                {draft.linkToProfile ? ` · ${userName}` : ""}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.previewFullBtn}>
        <Button
          variant="ghost"
          onClick={() => setShowFull(true)}
          disabled={!hasCard}
          title={
            !hasCard
              ? t("marketing:listBusiness.preview.fullDisabledTitle")
              : undefined
          }
        >
          {t("marketing:listBusiness.preview.fullCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>

      <div className={styles.pvFoot}>
        {t("marketing:listBusiness.preview.foot")}
      </div>

      {showFull && (
        <ListBusinessFullPreview
          draft={draft}
          userName={userName}
          photoPreviews={photoPreviews}
          onClose={() => setShowFull(false)}
        />
      )}
    </aside>
  );
}
