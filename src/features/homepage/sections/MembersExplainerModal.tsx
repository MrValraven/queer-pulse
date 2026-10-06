import { useLocation } from "react-router-dom";
import { FiArrowRight, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { ModalSheet } from "../../../shared/components/ui/Modal";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import { MEMBER_PILLARS } from "./membersExplainer.data";
import styles from "./ExplainerModal.module.css";

const LEDE_KEYS = {
  members: "homepage:membersExplainer.lede",
  gathering: "homepage:membersExplainer.ledeGathering",
  roadmap: "homepage:membersExplainer.ledeRoadmap",
  rating: "homepage:membersExplainer.ledeRating",
} as const;

// Each context tags its invite request so the review queue can tell the
// surfaces apart (append-only keys in `joinRequestSource.ts`).
const SOURCES = {
  members: "members_explainer",
  gathering: "gathering_explainer",
  roadmap: "roadmap_explainer",
  rating: "rating_explainer",
} as const;

/**
 * Signed-out explainer for the "Explore members" CTA: why the member directory
 * is invite-only, and how to get in. Shown instead of bouncing a logged-out
 * visitor to the sign-in page. Rendered only while open (owns no state itself),
 * so `ModalSheet` runs its scroll-lock/focus-trap once per open.
 */
export function MembersExplainerModal({
  onClose,
  context = "members",
}: {
  onClose: () => void;
  context?: "members" | "gathering" | "roadmap" | "rating";
}) {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  return (
    <ModalSheet
      success
      onClose={onClose}
      ariaLabel={t("homepage:membersExplainer.titlePlain")}
    >
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("shared:modal.close")}
        >
          <FiX aria-hidden />
        </button>

        <span className={styles.eyebrow}>
          {t("homepage:membersExplainer.eyebrow")}
        </span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="homepage:membersExplainer.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>{t(LEDE_KEYS[context])}</p>

        <ul className={styles.pillars}>
          {MEMBER_PILLARS.map(({ id, Icon, titleKey, bodyKey }) => (
            <li key={id} className={styles.pillar}>
              <span className={styles.pillarIcon} aria-hidden>
                <Icon />
              </span>
              <span className={styles.pillarText}>
                <span className={styles.pillarTitle}>{t(titleKey)}</span>
                <span className={styles.pillarBody}>{t(bodyKey)}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Button size="lg" to={requestInvitePath(SOURCES[context])}>
            {t("homepage:membersExplainer.requestInviteCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="ghost-dark"
            to={`${routes.signIn}?next=${encodeURIComponent(`${pathname}${search}`)}`}
          >
            {t("homepage:membersExplainer.signInCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
