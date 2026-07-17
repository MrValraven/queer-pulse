import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { buildLinkProviders } from "./integrations.data";
import { LinkProviderModal } from "./LinkProviderModal";
import { IntegrationsModal } from "./IntegrationsModal";
import { SignInMethodsList, ConnectedAppsList } from "./LinkedAccountsSections";
import styles from "./LinkedAccountsPage.module.css";

export function LinkedAccountsPage() {
  const { t } = useTranslation();
  const linkProviders = useMemo(() => buildLinkProviders(t), [t]);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const loading = useSimulatedLoad();
  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set());
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [linkProviderId, setLinkProviderId] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  function handleUnlink(id: string) {
    if (window.confirm(t("settings:linkedAccounts.confirmUnlink"))) {
      setRevokedIds((prev) => new Set(prev).add(id));
      showToast(t("settings:linkedAccounts.toast.revoked"), "success");
    }
  }

  function handleLinked(id: string) {
    setLinkedIds((prev) => new Set(prev).add(id));
  }

  function handleCopyCalendar() {
    navigator.clipboard?.writeText("https://queerpulse.app/cal/tomas.ics");
    showToast(t("settings:linkedAccounts.toast.calendarCopied"), "success");
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
        >
          {t("settings:sessions.backToSecurity")}
        </button>
        <div className={styles.eyebrow}>
          {t("settings:linkedAccounts.eyebrow")}
        </div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="settings:linkedAccounts.heading"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="settings:linkedAccounts.lead"
            components={{ strong: <b />, em: <em /> }}
          />
        </p>

        <div className={styles.sectionH}>
          {t("settings:linkedAccounts.section.signInMethods")}
        </div>
        <div className={styles.list}>
          <SignInMethodsList
            loading={loading}
            revokedIds={revokedIds}
            linkedIds={linkedIds}
            onUnlink={handleUnlink}
            onLink={setLinkProviderId}
            navigate={navigate}
          />
        </div>

        <div className={styles.ssoNote}>
          <Translation
            i18nKey="settings:linkedAccounts.ssoNote"
            components={{ strong: <b />, em: <em /> }}
          />
        </div>

        <div className={styles.sectionH}>
          {t("settings:linkedAccounts.section.connectedApps")}
        </div>
        <div className={styles.list}>
          <ConnectedAppsList
            loading={loading}
            revokedIds={revokedIds}
            onUnlink={handleUnlink}
            onCopyCalendar={handleCopyCalendar}
          />
        </div>

        <div className={styles.sectionH}>
          {t("settings:linkedAccounts.section.connectAnother")}
        </div>
        <div className={styles.list}>
          <div className={`${styles.row} ${styles.rowDashed}`}>
            <div className={`${styles.icon} ${styles.iconAdd}`}>+</div>
            <div className={styles.info}>
              <b className={styles.infoName}>
                {t("settings:linkedAccounts.browseIntegrations.name")}
              </b>
              <span className={styles.infoDetail}>
                {t("settings:linkedAccounts.browseIntegrations.detail")}
              </span>
            </div>
            <Button
              variant="primary"
              className={`${styles.rowBtn} ${styles.rowBtnConnect}`}
              onClick={() => setGalleryOpen(true)}
            >
              {t("settings:linkedAccounts.browse")}
            </Button>
          </div>
        </div>

        <div className={`${styles.ssoNote} ${styles.ssoNoteAccent}`}>
          <Translation
            i18nKey="settings:linkedAccounts.ssoNoteAccent"
            components={{
              strong: <b />,
              a: (
                <Link
                  to={routes.dataExport}
                  style={{
                    color: "var(--plum)",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                />
              ),
            }}
          />
        </div>
      </div>

      {linkProviderId && linkProviders[linkProviderId] && (
        <LinkProviderModal
          provider={linkProviders[linkProviderId]}
          onClose={() => setLinkProviderId(null)}
          onLinked={() => handleLinked(linkProviderId)}
        />
      )}
      {galleryOpen && (
        <IntegrationsModal onClose={() => setGalleryOpen(false)} />
      )}
    </AppShell>
  );
}
