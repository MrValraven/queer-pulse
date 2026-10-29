import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import studioStyles from "./studio.module.css";
import styles from "./StudioSupporter.module.css";

/**
 * Disabled look-alikes of the visitor controls, drawn while the owner views
 * their own artist page as a visitor. Each has the shape a visitor gets and
 * no handler, so the preview never follows, supports or requests anything
 * for the owner's own persona. The persona page's visitor preview draws its
 * Follow and Endorse the same way.
 */

/** The hero's Follow, in its unfollowed state. */
export function StudioInertFollow() {
  const { t } = useTranslation();
  return (
    <Button variant="quiet" disabled>
      <FiPlus aria-hidden />
      {t("studio:artist.hero.followCta")}
    </Button>
  );
}

/** "Show me among the top listeners" with its switch off. The live card reads the
 *  supporter state on mount, which the owner's own persona refuses, so the
 *  preview draws this one in its place. */
export function StudioInertSupporterCard({
  personaName,
}: {
  personaName: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const bodyId = useId();
  return (
    <section
      className={`${studioStyles.sideCard} ${styles.card}`}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className={styles.heading}>
        {t("studio:supporter.heading", { persona: personaName })}
      </h2>
      <div className={styles.switchRow}>
        <p id={bodyId} className={styles.body}>
          {t("studio:supporter.body", { persona: personaName })}
        </p>
        <Toggle
          label={t("studio:supporter.heading", { persona: personaName })}
          aria-describedby={bodyId}
          checked={false}
          disabled
          onChange={() => undefined}
        />
      </div>
    </section>
  );
}
