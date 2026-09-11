import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiCheckCircle,
  FiClock,
  FiNavigation,
  FiPackage,
  FiShield,
  FiSmile,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  hasAnyDetail,
  TERRAIN_LABEL_KEYS,
  type FormatDetails,
} from "./gatheringCatalog";
import type { GatheringDetail } from "./data";
import styles from "./GatheringDetailPanels.module.css";

/**
 * One fact, in the same row shape `GatheringWherePanel` uses, so the two
 * panels read as one surface rather than two designs.
 *
 * The label is optional on purpose. `.rowLabel` is small uppercase muted type
 * and `.rowValue` is the readable line, so a fact that is already a whole
 * sentence ("Sober friendly") belongs in the value slot with no label above
 * it. A label is for naming a variable underneath it: "Terrain" over "Steep".
 */
function GoodToKnowRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconType;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon} aria-hidden>
        <Icon />
      </span>
      <span className={styles.rowText}>
        {label && <span className={styles.rowLabel}>{label}</span>}
        <span className={styles.rowValue}>{children}</span>
      </span>
    </div>
  );
}

/**
 * The one or two things this gathering's own format asked its host, answered.
 *
 * The wizard has promised since it shipped that the format "determines some of
 * the fields that follow", and until families landed nothing downstream read
 * the answer. This is the reader's half of that promise: bring a dish, the
 * door checks age, there is something good to drink without alcohol, the
 * ground is steep, the film runs ninety minutes.
 *
 * The create wizard's ready panel reads these same rows back
 * (`GatheringGoodToKnowRows`), so a host finds on the page the same sentences
 * they checked before publishing. Bring and terrain read
 * differently here: each renders as its catalog label over the value, since a
 * dish to bring and a translated terrain word need naming on a page a reader
 * arrives at cold.
 *
 * Renders nothing at all when the host answered none of it, rather than a
 * panel headed "Good to know" with nothing under it.
 */
export function GatheringGoodToKnow({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const details = gathering.formatDetails;
  if (!details || !hasAnyDetail(details)) return null;

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>
        {t("gatherings:catalog.goodToKnow.title")}
      </h2>
      <GatheringGoodToKnowRows details={details} />
    </section>
  );
}

/**
 * The answered format details as rows, one per fact, with no heading. The
 * gathering page shows them under "Good to know", and the create wizard's
 * ready panel reads the same rows back to the host before publishing
 * (`CreateGatheringReadback`), so the host checks the sentences a reader
 * will see.
 */
export function GatheringGoodToKnowRows({
  details,
}: {
  details: FormatDetails;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {details.bring && (
        <GoodToKnowRow
          icon={FiPackage}
          label={t("gatherings:catalog.details.bring.label")}
        >
          {details.bring}
        </GoodToKnowRow>
      )}
      {details.isAdultsOnly && (
        <GoodToKnowRow icon={FiShield}>
          {t("gatherings:catalog.goodToKnow.adultsOnly")}
        </GoodToKnowRow>
      )}
      {details.isSoberFriendly && (
        <GoodToKnowRow icon={FiSmile}>
          {t("gatherings:catalog.goodToKnow.soberFriendly")}
        </GoodToKnowRow>
      )}
      {details.terrain && (
        <GoodToKnowRow
          icon={FiNavigation}
          label={t("gatherings:catalog.details.terrain.label")}
        >
          {t(TERRAIN_LABEL_KEYS[details.terrain])}
        </GoodToKnowRow>
      )}
      {details.isBeginnerFriendly && (
        <GoodToKnowRow icon={FiCheckCircle}>
          {t("gatherings:catalog.goodToKnow.beginnerFriendly")}
        </GoodToKnowRow>
      )}
      {typeof details.runtimeMinutes === "number" && (
        <GoodToKnowRow icon={FiClock}>
          {t("gatherings:catalog.goodToKnow.runtime", {
            minutes: details.runtimeMinutes,
          })}
        </GoodToKnowRow>
      )}
    </div>
  );
}
