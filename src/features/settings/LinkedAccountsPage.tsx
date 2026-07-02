import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { LINK_PROVIDERS } from "./integrations.data";
import { LinkProviderModal } from "./LinkProviderModal";
import { IntegrationsModal } from "./IntegrationsModal";
import { SignInMethodsList, ConnectedAppsList } from "./LinkedAccountsSections";
import styles from "./LinkedAccountsPage.module.css";

export function LinkedAccountsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const loading = useSimulatedLoad();
  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set());
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [linkProviderId, setLinkProviderId] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  function handleUnlink(id: string) {
    if (
      window.confirm("Unlink/revoke this connection? You can re-link anytime.")
    ) {
      setRevokedIds((prev) => new Set(prev).add(id));
      showToast("Connection revoked", "success");
    }
  }

  function handleLinked(id: string) {
    setLinkedIds((prev) => new Set(prev).add(id));
  }

  function handleCopyCalendar() {
    navigator.clipboard?.writeText("https://queerpulse.app/cal/tomas.ics");
    showToast("Calendar URL copied", "success");
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
        >
          ← Security
        </button>
        <div className={styles.eyebrow}>Security · Linked accounts</div>
        <h1 className={styles.heading}>
          Sign-in methods &amp; <em>connected apps.</em>
        </h1>
        <p className={styles.lead}>
          Two separate lists. <b>Sign-in methods</b> are alternative ways to
          sign in to QueerPulse. <b>Connected apps</b> are third-party services
          you've given limited access to.{" "}
          <em>You can revoke either, any time.</em>
        </p>

        <div className={styles.sectionH}>Sign-in methods</div>
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
          <b>About SSO and privacy.</b> Linking Google or Apple means those
          services know you have a QueerPulse account, but not what you do here.{" "}
          <em>
            They never see your messages, posts, or community memberships.
          </em>{" "}
          If you're worried about a workplace Google linking to your queer life,
          use magic-link instead — it's our most private option.
        </div>

        <div className={styles.sectionH}>
          Connected apps · third-party access
        </div>
        <div className={styles.list}>
          <ConnectedAppsList
            loading={loading}
            revokedIds={revokedIds}
            onUnlink={handleUnlink}
            onCopyCalendar={handleCopyCalendar}
          />
        </div>

        <div className={styles.sectionH}>Connect another</div>
        <div className={styles.list}>
          <div className={`${styles.row} ${styles.rowDashed}`}>
            <div className={`${styles.icon} ${styles.iconAdd}`}>+</div>
            <div className={styles.info}>
              <b className={styles.infoName}>Browse available integrations</b>
              <span className={styles.infoDetail}>
                Stripe (Sustainer billing), Mastodon, Spotify (Audio Rooms),
                iCal export, and 4 more
              </span>
            </div>
            <Button
              variant="primary"
              className={`${styles.rowBtn} ${styles.rowBtnConnect}`}
              onClick={() => setGalleryOpen(true)}
            >
              Browse
            </Button>
          </div>
        </div>

        <div className={`${styles.ssoNote} ${styles.ssoNoteAccent}`}>
          <b>Permissions are scoped narrowly.</b> No connected app can read your
          DMs, your draft posts, your billing, or your community memberships. If
          you ever want a full audit, request a{" "}
          <Link
            to={routes.dataExport}
            style={{
              color: "var(--plum)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            data export
          </Link>
          .
        </div>
      </div>

      {linkProviderId && LINK_PROVIDERS[linkProviderId] && (
        <LinkProviderModal
          provider={LINK_PROVIDERS[linkProviderId]}
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
