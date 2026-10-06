import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./DsarPage.module.css";

/** Sign-in with a `?next=` back-link, so the member lands on this page again. */
const SIGN_IN_HREF = `${routes.signIn}?next=${encodeURIComponent(routes.dsar)}`;

/** The Contact form with its `privacy` topic preselected (see `ContactPage`). */
const PRIVACY_CONTACT_HREF = `${routes.contact}?topic=privacy`;

/**
 * ENG-473. The request form's signed-out state.
 *
 * `POST /account/dsar` files against the session's own account, so the form
 * only works for someone signed in. A member is offered sign-in that returns
 * here. Someone who holds data with us and no account (an invite requester, a
 * contact-form sender, a former member) is sent to the Contact form with the
 * privacy topic picked, which staff read in the admin inbox.
 */
export function DsarSignedOutPanel() {
  const { t } = useTranslation();
  return (
    <section className={styles.form} aria-labelledby="dsar-signed-out-title">
      <h2 id="dsar-signed-out-title">
        <Translation
          i18nKey="marketing:dsar.signedOut.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.formSub}>{t("marketing:dsar.signedOut.body")}</p>
      <Button variant="primary" to={SIGN_IN_HREF}>
        {t("marketing:dsar.signedOut.signInCta")}
      </Button>

      <div className={styles.actions}>
        <div className={styles.info}>
          <Translation
            i18nKey="marketing:dsar.signedOut.noAccount"
            components={{ b: <b /> }}
          />
        </div>
        <Button variant="ghost" to={PRIVACY_CONTACT_HREF}>
          {t("marketing:dsar.signedOut.contactCta")}
        </Button>
      </div>
    </section>
  );
}
