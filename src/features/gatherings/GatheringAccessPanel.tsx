import { DirectoryAccessibilityAnswers } from "../marketing/DirectoryAccessibilityAnswers";
import { normalizeAccessibilityAnswers } from "../marketing/listBusiness/listingAccessibility.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import styles from "./GatheringDetailPanels.module.css";

/**
 * The gathering's six accessibility answers, read by somebody deciding whether
 * they can leave the house for it.
 *
 * This renders through the DIRECTORY's own answers component on purpose. A
 * member who uses a wheelchair should meet the same six questions in the same
 * three-valued words whether they are reading a bar's page or a Tuesday supper
 * club's, and "nobody has said" has to stay distinct from "no" in both. Two
 * components would drift; one cannot.
 */
export function GatheringAccessPanel({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>
        {t("gatherings:gathering.access.heading")}
      </h2>
      <p className={styles.lead}>{t("gatherings:gathering.access.lead")}</p>
      <DirectoryAccessibilityAnswers
        accessibility={{
          answers: normalizeAccessibilityAnswers(
            gathering.accessibilityAnswers,
          ),
          note: gathering.accessibilityNote?.trim() || null,
        }}
        ownerFirstName={gathering.hostFirst ?? ""}
      />
    </section>
  );
}
