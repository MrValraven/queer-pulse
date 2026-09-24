import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../../../app/routeMap";
import type { PersonaAction } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import {
  COMPLETENESS_EDIT_TARGETS,
  therapistEditHref,
} from "./therapistEditLinks.data";
import styles from "./TherapistOwnerBar.module.css";

interface TherapistOwnerCompletenessProps {
  subprofileId: string;
  view: TherapistView;
  onAction: (action: PersonaAction) => void;
}

/** The owner bar's completeness card: the meter, each missing piece as a
 *  link to where it is filled in, and the way into the whole editor. */
export function TherapistOwnerCompleteness({
  subprofileId,
  view,
  onAction,
}: TherapistOwnerCompletenessProps) {
  const { t } = useTranslation();
  const { percent, missing } = view.completeness;
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>
        {t("subprofiles:therapist.owner.completeness")}
      </span>
      <div className={styles.meter} aria-hidden="true">
        <span className={styles.meterFill} style={{ width: `${percent}%` }} />
      </div>
      <b className={styles.percent}>
        {t("subprofiles:therapist.owner.percent", { percent })}
      </b>
      <span
        className={
          missing.length > 0 ? `${styles.meta} ${styles.missing}` : styles.meta
        }
      >
        {missing.length > 0 ? (
          <>
            <span>{t("subprofiles:therapist.owner.missingLead")}</span>{" "}
            {missing.map((key, index) => {
              const item = t(`subprofiles:therapist.completeness.${key}`);
              return (
                <Fragment key={key}>
                  {index > 0 && (
                    <span className={styles.missingSeparator}>, </span>
                  )}
                  <Link
                    className={styles.missingLink}
                    to={therapistEditHref(
                      subprofileId,
                      COMPLETENESS_EDIT_TARGETS[key],
                    )}
                    aria-label={t("subprofiles:therapist.owner.missingItem", {
                      item,
                    })}
                  >
                    {item}
                  </Link>
                </Fragment>
              );
            })}
          </>
        ) : (
          t("subprofiles:therapist.owner.complete")
        )}
      </span>
      <Button
        className={styles.cardAction}
        variant="ghost-dark"
        size="sm"
        to={subprofileEditPath(subprofileId)}
        onClick={() => onAction("edit")}
      >
        <FiEdit2 aria-hidden /> {t("subprofiles:therapist.owner.edit")}
      </Button>
    </div>
  );
}
