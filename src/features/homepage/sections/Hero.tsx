import { useState } from "react";
import { Button, Eyebrow, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import { MembersExplainerModal } from "./MembersExplainerModal";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useTranslation();
  const { loggedIn, checking } = useAuth();
  const [isMembersExplainerOpen, setIsMembersExplainerOpen] = useState(false);
  // `loggedIn` reads false until GET /auth/me settles, so the explainer waits
  // for a settled signed-out session. During the check the button links to
  // the directory, whose route guard holds on its own loader and then decides.
  const isConfirmedGuest = !loggedIn && !checking;

  return (
    <header className={styles.hero} id="top">
      <div className="wrap">
        <div className={styles.inner}>
          {/* Above-the-fold on mount (this is the homepage's LCP element) — rendered
              directly instead of via <Reveal> so first paint isn't gated behind an
              IntersectionObserver + up to 900ms opacity/transform transition. */}
          <Eyebrow live className={styles.eyebrow}>
            {t("homepage:hero.eyebrow")}
          </Eyebrow>

          <h1 className={styles.title}>
            <Translation
              i18nKey="homepage:hero.title"
              components={{ em: <em /> }}
            />
          </h1>

          <p className={styles.sub}>{t("homepage:hero.sub")}</p>

          <div className={styles.cta}>
            {/* Request-invite is guest-only, so a signed-in member reaching "/"
                gets their feed as the primary action. Same Button element either
                way, so the hero keeps its shape when the session resolves. */}
            <Button
              size="lg"
              to={loggedIn ? routes.feed : requestInvitePath("homepage_hero")}
            >
              {loggedIn
                ? t("homepage:hero.memberFeedCta")
                : t("homepage:hero.requestInviteCta")}
            </Button>
            {/* The member directory is auth-gated: members go straight to it,
                signed-out visitors get the membership explainer. Both always
                exist, unlike the curated #discovery section. */}
            {!isConfirmedGuest ? (
              <Button size="lg" variant="ghost" to={routes.members}>
                {t("homepage:hero.exploreMembersCta")}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="ghost"
                aria-haspopup="dialog"
                onClick={() => setIsMembersExplainerOpen(true)}
              >
                {t("homepage:hero.exploreMembersCta")}
              </Button>
            )}
          </div>

          <Reveal as="p" className={styles.note} delay={220}>
            <span className={styles.liveDot} aria-hidden />
            {t("homepage:hero.note")}
          </Reveal>
        </div>
      </div>
      {isMembersExplainerOpen && (
        <MembersExplainerModal
          onClose={() => setIsMembersExplainerOpen(false)}
        />
      )}
    </header>
  );
}
