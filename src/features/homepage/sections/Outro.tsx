import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import styles from "./Outro.module.css";

export function Outro() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();

  return (
    <section className={styles.outro}>
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal as="h2" className={styles.title}>
            <Translation
              i18nKey="homepage:outro.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={80}>
            {loggedIn ? t("homepage:outro.memberSub") : t("homepage:outro.sub")}
          </Reveal>
          <Reveal delay={140}>
            {/* Request-invite is guest-only; members get their feed. */}
            <Button
              size="lg"
              to={loggedIn ? routes.feed : requestInvitePath("homepage_outro")}
            >
              {loggedIn
                ? t("homepage:outro.memberCta")
                : t("homepage:outro.cta")}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
