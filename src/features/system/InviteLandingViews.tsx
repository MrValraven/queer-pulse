import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { routes } from "../../app/routeMap";
import type { InviteView } from "../../features/auth/api/useInvite";
import { AgeAttestation } from "../auth/AgeAttestation";
import { buildLoaderSteps, WHAT_ITEMS } from "./inviteLanding.data";
import styles from "./InviteLandingPage.module.css";

function InviterAvatar({
  view,
  className,
}: {
  view: InviteView;
  className?: string;
}) {
  // External avatar CDNs (e.g. Google's lh3.googleusercontent.com from OAuth)
  // 403/429 when the request carries a Referer — no-referrer lets them load —
  // and a genuinely broken URL falls back to initials instead of an empty circle.
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className={className} aria-hidden>
      {view.inviter.photo && !imgFailed ? (
        <img
          className={styles.avatarPhoto}
          src={resolveAvatarSrc(view.inviter.photo)}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      ) : (
        view.inviter.initials
      )}
    </div>
  );
}

/** Network phase: while GET /invites/:code is in flight. */
export function InviteLoadingView() {
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <div className={styles.loader}>
        <div className={styles.loaderBrand}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.loaderStatus} role="status" aria-live="polite">
          {t("system:inviteLanding.loader.verifying")}
        </p>
        <div className={styles.loaderBar}>
          <div className={styles.loaderBarFill} />
        </div>
      </div>
    </div>
  );
}

/** Sealed envelope: the inviter resolved, waiting for the recipient to open it. */
export function InviteSealedView({
  view,
  onOpen,
}: {
  view: InviteView;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <div className={styles.sealed}>
        <div className={`${styles.seal} ${styles.sealStatic}`} aria-hidden>
          <svg className={styles.sealRingStatic} viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" />
          </svg>
          <InviterAvatar view={view} className={styles.sealAvatar} />
        </div>
        <div className={styles.loaderBrand}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.sealedEyebrow}>
          {t("system:inviteLanding.sealed.eyebrow")}
        </div>
        <h1 className={styles.loaderTitle}>
          <Translation
            i18nKey="system:inviteLanding.sealed.title"
            values={{ name: view.inviter.name }}
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.sealedSub}>
          {t("system:inviteLanding.sealed.sub", { count: view.memberCount })}
        </p>
        <Button size="lg" onClick={onOpen} className={styles.sealedBtn}>
          {t("system:inviteLanding.sealed.openCta")}
        </Button>
      </div>
    </div>
  );
}

/** Decorative unsealing animation between sealed and the opened card. */
export function InviteOpeningView({
  view,
  step,
}: {
  view: InviteView;
  step: number;
}) {
  const { t } = useTranslation();
  const steps = useMemo(
    () => buildLoaderSteps(t, view.inviter.firstName),
    [t, view.inviter.firstName],
  );
  return (
    <div className={styles.root}>
      <div className={styles.loader}>
        <div className={styles.seal} aria-hidden>
          <svg className={styles.sealRing} viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" />
          </svg>
          <InviterAvatar view={view} className={styles.sealAvatar} />
        </div>
        <div className={styles.loaderBrand}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em /> }}
          />
        </div>
        <h1 className={styles.loaderTitle}>
          <Translation
            i18nKey="system:inviteLanding.opening.title"
            values={{ name: view.inviter.firstName }}
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.loaderStatus} role="status" aria-live="polite">
          {steps[step]}
        </p>
        <div className={styles.loaderBar}>
          <div className={styles.loaderBarFill} />
        </div>
      </div>
    </div>
  );
}

/** The opened invitation: who invited you, their note, and how to join. */
export function InviteCardView({
  view,
  onGoogle,
  is18,
  onIs18Change,
  onUnder18,
}: {
  view: InviteView;
  onGoogle: () => void;
  /** Whether the 18+ box is ticked — gates the Google button. */
  is18: boolean;
  onIs18Change: (value: boolean) => void;
  onUnder18: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to={routes.homepage} className={styles.brand}>
            <span className={styles.brandDot} aria-hidden />
            <Translation
              i18nKey="shared:brand.wordmark"
              components={{ em: <em /> }}
            />
          </Link>
          <div className={styles.inviterRow}>
            <InviterAvatar view={view} className={styles.inviterAvatar} />
            <div>
              <div className={styles.inviterName}>{view.inviter.name}</div>
              <div className={styles.inviterNote}>
                {view.inviter.since
                  ? t("system:inviteLanding.card.inviterNoteWithSince", {
                      since: view.inviter.since,
                    })
                  : t("system:inviteLanding.card.inviterNoteNoSince")}
              </div>
            </div>
          </div>
          <h1 className={styles.heading}>
            <Translation
              i18nKey="system:inviteLanding.card.heading"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.headerNote}>
            {t("system:inviteLanding.card.headerNote")}
          </p>
        </div>

        {/* view.note is the inviter's own message — user-authored content
            fetched from the API in live mode, so it is never translated. */}
        {view.note && (
          <div className={styles.message}>
            <div className={styles.messageLabel}>
              {t("system:inviteLanding.card.noteFrom", {
                name: view.inviter.firstName,
              })}
            </div>
            <div className={styles.messageText}>{view.note}</div>
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.whatList}>
            {WHAT_ITEMS.map((item) => (
              <div className={styles.whatItem} key={item.strongKey}>
                <div className={styles.whatDot} aria-hidden />
                <div className={styles.whatText}>
                  <strong>{t(item.strongKey)}</strong> {t(item.restKey)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.tokenBadge}>
            <div>
              <div className={styles.tokenLabel}>
                {t("system:inviteLanding.card.tokenLabel")}
              </div>
              <div className={styles.tokenCode}>{view.code}</div>
            </div>
            <div className={styles.tokenExpiry}>
              {t("system:inviteLanding.card.validFor", {
                count: view.validForDays,
              })}
            </div>
          </div>

          {view.expiryLabel && (
            <div className={styles.expiryRow}>
              <svg viewBox="0 0 14 14" aria-hidden>
                <circle cx="7" cy="7" r="5.5" />
                <polyline points="7,4 7,7 9,9" />
              </svg>
              {/* view.expiryLabel is formatted upstream by useInvite.ts
                  (features/auth), outside this namespace's remit. */}
              <span>
                {t("system:inviteLanding.card.expires", {
                  date: view.expiryLabel,
                })}
              </span>
            </div>
          )}

          <AgeAttestation
            id="invite-age-attestation"
            confirmed={is18}
            onConfirmedChange={onIs18Change}
            onUnder18={onUnder18}
          />

          <button
            type="button"
            className={styles.google}
            onClick={onGoogle}
            disabled={!is18}
            aria-disabled={!is18}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            {t("system:inviteLanding.card.googleCta")}
          </button>

          <p className={styles.consentNote}>
            <Translation
              i18nKey="system:inviteLanding.card.consent"
              components={{
                termsLink: <Link to={routes.terms} />,
                privacyLink: <Link to={routes.privacy} />,
              }}
            />
          </p>

          <p className={styles.alreadyMember}>
            <Translation
              i18nKey="system:inviteLanding.card.alreadyMember"
              components={{ a: <Link to={routes.signIn} /> }}
            />
          </p>
        </div>
      </div>

      <div className={styles.pageFooter}>
        <p>
          <Translation
            i18nKey="system:inviteLanding.card.notExpecting"
            components={{ a: <Link to={routes.privacy} /> }}
          />
        </p>
      </div>
    </div>
  );
}
