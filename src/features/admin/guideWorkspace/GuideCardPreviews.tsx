import { GuideCard } from "../../marketing/ResourceLibrarySections";
import { GuideIndexCard } from "../../resources/GuideIndexPage";
import { resourceToGuide } from "../../resources/api/resources.adapters";
import type {
  ResourceIndexEntryDTO,
  ResourceResponseDTO,
} from "../../resources/api/resources.api";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import { chipForDraft } from "./guideCardChip";
import type { GuideDraft } from "./guideDraft";
import styles from "./GuideRail.module.css";

/**
 * The two public cards, rendered by their real components from the draft.
 * Both read the English title and description in any language, exactly as
 * the public cards do, and sit inside `inert` frames so they cannot navigate.
 */
export function GuideCardPreviews({
  draft,
  guide,
  storedMeta,
}: {
  draft: GuideDraft;
  guide: AdminResourceGuideDTO | null;
  storedMeta: string | null;
}) {
  const { t } = useTranslation();
  const title = draft.title || t("admin:guideWorkspace.untitled");
  const slug = draft.slug || guide?.slug || "new-guide";
  const routePath = draft.routePath || null;
  const previewResource: ResourceResponseDTO = {
    slug,
    category: draft.category,
    title,
    description: draft.description,
    body: "",
    meta: chipForDraft(draft, storedMeta),
    externalUrl: null,
    lastVerifiedAt: guide?.lastVerifiedAt ?? null,
    titlePt: null,
    descriptionPt: null,
    sections: [],
    sectionsPt: null,
    routePath,
    lastReviewedOn: guide?.lastReviewedOn ?? null,
    reviewedBy: null,
    reviewDueOn: null,
  };
  const indexEntry: ResourceIndexEntryDTO = {
    slug,
    category: draft.category,
    title,
    description: draft.description,
    routePath,
    lastReviewedOn: guide?.lastReviewedOn ?? null,
    isManaged: true,
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>
        {t("admin:guideWorkspace.cards.title")}
      </h2>
      <p className={styles.fieldHint}>
        {t("admin:guideWorkspace.cards.englishOnly")}
      </p>
      <p className={styles.cardLabel}>
        {t("admin:guideWorkspace.cards.library")}
      </p>
      <div className={styles.cardFrame} inert>
        <GuideCard guide={resourceToGuide(previewResource)} index={0} />
      </div>
      <p className={styles.cardLabel}>
        {t("admin:guideWorkspace.cards.index")}
      </p>
      <div className={styles.cardFrame} inert>
        <GuideIndexCard entry={indexEntry} index={0} />
      </div>
    </section>
  );
}
