import { useId, useState, type RefObject } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingDraft, PhotoKey } from "./listBusiness.data";
import { ListBusinessFullPreview } from "./ListBusinessFullPreview";
import { ListingLivePreviewBody } from "./preview/ListingLivePreviewBody";
import { useFocusedListingField } from "./preview/useFocusedListingField";
import styles from "./ListBusinessPage.module.css";

/** Sticky directory-card + detail-page preview that mirrors the live form. */
export function ListBusinessPreview({
  draft,
  userName,
  photoPreviews,
  formColumnRef,
  onAddPhoto,
}: {
  draft: ListingDraft;
  userName: string;
  photoPreviews: Record<PhotoKey, string>;
  /** The wizard's form column. The focus hook lives here, so focusing or
   *  hovering a field re-renders only the preview. */
  formColumnRef: RefObject<HTMLElement | null>;
  /** Jumps the wizard to the photos step: wired to the preview's "add cover
   *  photo" call to action when there's no photo yet. */
  onAddPhoto: () => void;
}) {
  const { t } = useTranslation();
  const [showFull, setShowFull] = useState(false);
  const { activeAnchor } = useFocusedListingField(formColumnRef);
  const hasCard = draft.name.trim().length > 0;
  // The head line is the column's heading and names the aside, so it shows
  // up in a screen reader's heading and landmark lists. The global reset
  // already zeroes the h2's margins, so `.pvHead` keeps its look.
  const headingId = useId();

  return (
    <aside className={styles.previewCol} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.pvHead}>
        <span className={styles.dot} />
        {t("marketing:listBusiness.preview.head")}
      </h2>

      <ListingLivePreviewBody
        draft={draft}
        photoPreviews={photoPreviews}
        activeAnchor={activeAnchor}
        onAddPhoto={onAddPhoto}
      />

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
