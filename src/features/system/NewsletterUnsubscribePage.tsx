import { useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiLoader, FiXCircle } from "react-icons/fi";
import { Button, StatusCard } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useNewsletterUnsubscribe } from "./api/useNewsletterUnsubscribe";
import styles from "./NewsletterUnsubscribePage.module.css";

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
          icon={<FiXCircle aria-hidden />}
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
          icon={<FiLoader aria-hidden className={styles.spinIcon} />}
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
        icon={<FiCheckCircle aria-hidden />}
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
