import { FiFeather } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMISSION_INTEREST_PATH } from "./commissionInterest.paths";
import styles from "./CultureComingSoon.module.css";

/**
 * Live-mode placeholder for the Culture landing page. Three of the four tabs
 * (club picks, showcase, radio) are curated editorial content that only exists
 * in the demo mocks: live they render empty boxes with the suggest/submit
 * buttons hidden, and the `content` module's `ContentPage` entity is read-only
 * by design with no admin CRUD behind it, so nothing can ever appear there.
 * When demo mode is OFF `/magazine/culture` resolves here and the meganav entry
 * is dropped (see `DEMO_ONLY_NAV_PATTERNS` in `app/authGate.ts`) rather than
 * advertising a destination with no content pipeline. CON-14.
 *
 * The fourth tab, the commission board, is different: expressing interest in a
 * commission is a real write (`POST /commissions/interest`) landing in a
 * staffed admin queue (`/admin/commission-interests`). So this page carries the
 * one live door into Culture, and it is the honest place for it — the board is
 * being built, and interest can be registered now. PRD-46.
 *
 * That panel is hidden from logged-out visitors because the endpoint behind it
 * is `ActiveMemberGuard`ed and the route is gated: offering a stranger a form
 * that bounces them to sign-in is the kind of dead end this page exists to
 * remove. The escape hatches point at the two neighbouring surfaces that are
 * live for everyone: the magazine and communities.
 */
export function CultureComingSoon() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  return (
    <PageShell>
      <PageMeta
        title={t("culture:comingSoon.metaTitle")}
        description={t("culture:comingSoon.description")}
        noIndex
      />
      <div className={styles.wrap}>
        <EmptyState
          icon={<FiFeather aria-hidden />}
          title={t("culture:comingSoon.title")}
          description={t("culture:comingSoon.description")}
          action={{
            label: t("culture:comingSoon.magazineCta"),
            to: routes.magazine,
          }}
          secondaryAction={{
            label: t("culture:comingSoon.communitiesCta"),
            to: routes.communities,
          }}
        />
        {loggedIn && (
          <section className={styles.commissions}>
            <h2 className={styles.commissionsTitle}>
              {t("culture:comingSoon.commissions.title")}
            </h2>
            <p className={styles.commissionsBody}>
              {t("culture:comingSoon.commissions.body")}
            </p>
            <Button variant="primary" to={COMMISSION_INTEREST_PATH}>
              {t("culture:comingSoon.commissions.cta")}
            </Button>
          </section>
        )}
      </div>
    </PageShell>
  );
}
