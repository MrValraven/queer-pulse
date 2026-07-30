import { FiMusic } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StudioComingSoonPage.module.css";

/**
 * Live-mode placeholder for the whole Studio domain. Studio is a demo-only
 * showcase (no backend, no data hooks — see `docs/superpowers/specs/
 * 2026-07-30-studio-live-mode-gate-design.md`), so when demo mode is OFF every
 * `/studio/*` route resolves here instead of rendering fabricated payouts,
 * tips and broadcast numbers as if they were real.
 *
 * Deliberately uses the marketing `PageShell` rather than Studio's own chrome —
 * showing the studio shell would itself imply the platform is live.
 */
export function StudioComingSoonPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.wrap}>
        <EmptyState
          icon={<FiMusic aria-hidden />}
          title={
            <Translation
              i18nKey="studio:comingSoon.title"
              components={{ em: <em /> }}
            />
          }
          description={t("studio:comingSoon.description")}
          action={{
            label: t("studio:comingSoon.exploreCulture"),
            to: routes.culture,
          }}
          secondaryAction={{
            label: t("studio:comingSoon.backHome"),
            to: routes.homepage,
          }}
        />
      </div>
    </PageShell>
  );
}
