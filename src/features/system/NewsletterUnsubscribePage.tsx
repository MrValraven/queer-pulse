import { useSearchParams } from "react-router-dom";
import { Button, StatusCard } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useNewsletterUnsubscribe } from "./api/useNewsletterUnsubscribe";
import styles from "./NewsletterUnsubscribePage.module.css";

/** Ring icon for the "confirming your request" phase. */
function SpinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={styles.spinIcon}>
      <circle cx="12" cy="12" r="9" strokeDasharray="34 20" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </svg>
  );
}

function LinkOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

const HOME_CTA_KEY = "system:newsletterUnsubscribe.goHomeCta";

/**
 * Self-serve newsletter unsubscribe landing (CNT-19). Reached with a
 * subscription token in the URL (`?token=...`). Unlike `GET /newsletter/confirm`,
 * which answers on the API as bare JSON, this route shows real
 * success/already-unsubscribed/invalid-link states. The backend call itself
 * mirrors confirm's token mechanism exactly (see `useNewsletterUnsubscribe`).
 *
 * QueerPulse delivers no email, so nothing hands anyone this link: the page
 * exists so a token holder can always opt out, however they came by the token.
 */
export function NewsletterUnsubscribePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { data, isLoading, isError } = useNewsletterUnsubscribe(token);

  if (!token || isError) {
    return (
      <SystemStateShell>
        <StatusCard
          icon={<LinkOffIcon />}
          kicker={t("system:newsletterUnsubscribe.invalid.eyebrow")}
          heading={
            <Translation
              i18nKey="system:newsletterUnsubscribe.invalid.heading"
              components={{ em: <em /> }}
            />
          }
          lead={t("system:newsletterUnsubscribe.invalid.lead")}
          actions={
            <>
              <Button to={routes.homepage}>{t(HOME_CTA_KEY)}</Button>
              <Button variant="ghost" to={routes.contact}>
                {t("system:newsletterUnsubscribe.contactCta")}
              </Button>
            </>
          }
        />
      </SystemStateShell>
    );
  }

  if (isLoading || !data) {
    return (
      <SystemStateShell>
        <StatusCard
          icon={<SpinIcon />}
          kicker={t("system:newsletterUnsubscribe.loading.eyebrow")}
          heading={t("system:newsletterUnsubscribe.loading.heading")}
        />
      </SystemStateShell>
    );
  }

  const stateKey = data.alreadyUnsubscribed ? "alreadyUnsubscribed" : "success";

  return (
    <SystemStateShell orbTone="jade">
      <StatusCard
        tone="jade"
        icon={<CheckIcon />}
        kicker={t(`system:newsletterUnsubscribe.${stateKey}.eyebrow`)}
        heading={
          <Translation
            i18nKey={`system:newsletterUnsubscribe.${stateKey}.heading`}
            components={{ em: <em /> }}
          />
        }
        lead={t(`system:newsletterUnsubscribe.${stateKey}.lead`)}
        actions={<Button to={routes.homepage}>{t(HOME_CTA_KEY)}</Button>}
      />
    </SystemStateShell>
  );
}
