import { useId } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./ListingDeleteFlow.module.css";

/**
 * The owner's two reversible alternatives to deleting, each with one line on
 * what it does. Both only take the owner to the editor's Trading and
 * visibility controls, so the labels name that destination and end in an
 * arrow; the listing stays as it is until the owner acts there. The flow
 * closes itself before running the chosen callback.
 *
 * Default-size buttons keep the 44px touch floor, and `.gentlerButton` lets a
 * long label (the PT ones) wrap inside a 320px screen.
 */
export function ListingDeleteGentlerExits({
  onHideInstead,
  onMarkClosedInstead,
}: {
  onHideInstead: () => void;
  onMarkClosedInstead: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={styles.gentler} aria-labelledby={headingId}>
      <p id={headingId} className={styles.gentlerHeading}>
        {t("marketing:listBusiness.deleteFlow.gentler.heading")}
      </p>
      <div className={styles.gentlerOption}>
        <Button
          variant="ghost"
          className={styles.gentlerButton}
          onClick={onHideInstead}
        >
          {t("marketing:listBusiness.deleteFlow.gentler.hide.button")}
          <FiArrowRight aria-hidden />
        </Button>
        <p className={styles.gentlerDetail}>
          {t("marketing:listBusiness.deleteFlow.gentler.hide.detail")}
        </p>
      </div>
      <div className={styles.gentlerOption}>
        <Button
          variant="ghost"
          className={styles.gentlerButton}
          onClick={onMarkClosedInstead}
        >
          {t("marketing:listBusiness.deleteFlow.gentler.closed.button")}
          <FiArrowRight aria-hidden />
        </Button>
        <p className={styles.gentlerDetail}>
          {t("marketing:listBusiness.deleteFlow.gentler.closed.detail")}
        </p>
      </div>
    </section>
  );
}
