import { useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DirectorySpaceView } from "../../../marketing/DirectorySpaceView";
import directoryStyles from "../../../marketing/DirectorySpacePage.module.css";
import { listingDraftToPreviewSource } from "../../../marketing/listBusiness/editor/listingDraftPreviewSource";
import type { PhotoKey } from "../../../marketing/listBusiness/listBusiness.data";
import { blankDraft } from "../../../marketing/listBusiness/listingFormDraft";
import { listingDtoToPreviewPlace } from "../../api/listingPreviewPlace";
import type { ListingDraftPreview as ListingDraftPreviewData } from "../../api/adminCreatorDrafts.api";
import { CreatorDraftPreviewFrame } from "./CreatorDraftPreviewFrame";
import { listingDraftPreviewToDraft } from "./listingDraftPreview.adapters";
import styles from "./CreatorDraftPreviews.module.css";

/** No photo was uploaded in this session: every image the preview shows is
 *  a URL the server already resolved inside the draft itself. */
const NO_UPLOADED_PHOTOS: Record<PhotoKey, string> = {
  wide: "",
  d1: "",
  d2: "",
  vibe: "",
};

/**
 * A listing draft (a new listing or an edit of a live one) as its public
 * directory page would show it: the draft laid over a blank one, so every
 * key the server left out reads as "nothing chosen yet", then the same
 * `DirectorySpaceView` the owner's preview and the moderator drawer use.
 * `slug` is the live listing's, or null for a listing that is not live.
 */
export function ListingDraftPreview({
  preview,
  slug,
}: {
  preview: ListingDraftPreviewData;
  slug: string | null;
}) {
  const { t } = useTranslation();
  const place = useMemo(() => {
    const blank = blankDraft();
    const fields = listingDraftPreviewToDraft(preview);
    const draft = {
      ...blank,
      ...fields,
      photos: { ...blank.photos, ...fields.photos },
    };
    return listingDtoToPreviewPlace(
      listingDraftToPreviewSource(draft, slug ?? "", NO_UPLOADED_PHOTOS),
    );
  }, [preview, slug]);

  // A staff preview carries the business half of the draft alone, so the
  // owner's name never arrives and the public "Run by" byline would print
  // around nothing. With no name the byline is hidden; the strip above
  // already names who started the draft.
  const listingFrameRef = useRef<HTMLDivElement>(null);
  const hasOwnerName = place.owner.name.trim() !== "";
  useLayoutEffect(() => {
    const bylineClassName = directoryStyles.ownerByline;
    if (!bylineClassName) return;
    const byline = listingFrameRef.current?.querySelector<HTMLElement>(
      `.${bylineClassName}`,
    );
    if (byline) byline.hidden = !hasOwnerName;
  }, [place, hasOwnerName]);

  return (
    <CreatorDraftPreviewFrame label={t("admin:creatorDrafts.preview.label")}>
      <div ref={listingFrameRef} className={styles.listingFrame}>
        <DirectorySpaceView place={place} preview />
      </div>
    </CreatorDraftPreviewFrame>
  );
}
