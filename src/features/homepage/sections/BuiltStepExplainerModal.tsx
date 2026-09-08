import { FiArrowRight, FiHeart, FiUnlock, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { ModalSheet } from "../../../shared/components/ui/Modal";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import type { BuiltStep } from "../data/types";
import styles from "./ExplainerModal.module.css";

/**
 * The signed-out explainer behind every CTA on the "we built the community we
 * wanted to find" board: what the thing actually is, what it gives a member,
 * and how it powers the rest of the platform, then the ask to join. Signed-in
 * members never see it and follow the CTA straight to the surface instead (see
 * `BuiltStepCta`), the same split the members explainer makes.
 *
 * Three pillars in a fixed order, so every step reads the same way: how it
 * works, what you get, how it powers QueerPulse. The first wears the step's own
 * rail icon, tying the modal back to the row that opened it.
 *
 * Rendered only while open (owns no state itself), so `ModalSheet` runs its
 * scroll-lock/focus-trap once per open.
 */
export function BuiltStepExplainerModal({
  step,
  onClose,
}: {
  step: BuiltStep;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const StepIcon = step.icon;
  const key = step.key;

  const pillars = [
    { id: "how", Icon: StepIcon, slug: "a" },
    { id: "gives", Icon: FiUnlock, slug: "b" },
    { id: "powers", Icon: FiHeart, slug: "c" },
  ];

  return (
    <ModalSheet success onClose={onClose} ariaLabel={t(step.labelKey)}>
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("shared:modal.close")}
        >
          <FiX aria-hidden />
        </button>

        <span className={styles.eyebrow}>{t(step.labelKey)}</span>
        <h2 className={styles.title}>
          <Translation
            i18nKey={`homepage:painPoints.${key}.modal.title`}
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>
          {t(`homepage:painPoints.${key}.modal.lede`)}
        </p>

        <ul className={styles.pillars}>
          {pillars.map(({ id, Icon, slug }) => (
            <li key={id} className={styles.pillar}>
              <span className={styles.pillarIcon} aria-hidden>
                <Icon />
              </span>
              <span className={styles.pillarText}>
                <span className={styles.pillarTitle}>
                  {t(`homepage:painPoints.${key}.modal.${slug}.title`)}
                </span>
                <span className={styles.pillarBody}>
                  {t(`homepage:painPoints.${key}.modal.${slug}.body`)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {/* The rail already greys an unbuilt step; this says the same thing in
            the one place someone is deciding whether to join for it. */}
        {!step.isLaunched && (
          <p className={styles.note}>
            {t("homepage:painPoints.modal.soonNote")}
          </p>
        )}

        <div className={styles.actions}>
          <Button size="lg" to={requestInvitePath("homepage_built")}>
            {t("homepage:painPoints.modal.requestInviteCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button size="lg" variant="ghost-dark" to={routes.signIn}>
            {t("homepage:painPoints.modal.signInCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
