import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ForumDraftCardDetails } from "../useForumThreadDraftPreview";
import { useDraftCardFacts } from "./useDraftCardFacts";
import styles from "./DraftCardRibbon.module.css";

/** A single row has room for two chips; the rest fold into a "+N" count. */
const VISIBLE_FACT_COUNT = 2;

/**
 * The ribbon's chips: the first two composer choices, then how many more the
 * draft carries. The count reads "+2" on screen and "2 more details" to a
 * screen reader.
 */
export function DraftCardRibbonFacts({
  details,
}: {
  details: ForumDraftCardDetails;
}) {
  const { t } = useTranslation();
  const facts = useDraftCardFacts(details);
  const visibleFacts = facts.slice(0, VISIBLE_FACT_COUNT);
  const hiddenFactCount = facts.length - visibleFacts.length;

  return (
    // An explicit list role: VoiceOver drops the semantics of a `ul` styled
    // with list-style: none, and a `ul role="list"` trips jsx-a11y's
    // redundant-role rule, so this follows SettingsSaveBar's div list.
    <div
      className={styles.facts}
      role="list"
      aria-label={t("forum:draftNotice.factsLabel")}
    >
      {visibleFacts.map((fact) => {
        const FactIcon = fact.icon;
        return (
          <div key={fact.id} className={styles.fact} role="listitem">
            <FactIcon className={styles.factIcon} aria-hidden />
            <span className={styles.factLabel}>{fact.label}</span>
          </div>
        );
      })}
      {hiddenFactCount > 0 && (
        <div className={`${styles.fact} ${styles.factMore}`} role="listitem">
          <span aria-hidden>
            {t("forum:draftNotice.moreFacts", { count: hiddenFactCount })}
          </span>
          <span className="visuallyHidden">
            {t("forum:draftNotice.moreFactsLabel", { count: hiddenFactCount })}
          </span>
        </div>
      )}
    </div>
  );
}
