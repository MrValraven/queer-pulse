import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { requestInvitePath } from "./api/joinRequestSource";
import styles from "./signInCard.module.css";

/** The left column of the sign-in card: a back-to-home link on top; the
 *  heading, the lede, the sign-in `actions` and the ways in for newcomers in
 *  the middle; and a trust line at the foot. */
export function SignInCardContent({ actions }: { actions: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className={styles.column}>
      <Link to={routes.homepage} className={styles.backHome}>
        <FiArrowLeft aria-hidden className={styles.backHomeIcon} />
        <span>{t("common:cta.backHome")}</span>
      </Link>

      <div className={styles.middle}>
        <h1 className={styles.title}>
          <Translation
            i18nKey="auth:signIn.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lede}>{t("auth:signIn.lede")}</p>
        <div>{actions}</div>

        <p className={styles.divider}>{t("auth:signIn.newHere")}</p>
        <div className={styles.secondaryPair}>
          <Button
            variant="ghost"
            size="sm"
            to={requestInvitePath("sign_in")}
            className={styles.secondaryButton}
          >
            {t("auth:common.notAMemberYet")}
          </Button>
          {/* PRD-306. Someone holding a code and no link lands here, because
              sign-in is the only door they can name. Without this they would
              request a fresh invite for one they already have. */}
          <Button
            variant="ghost"
            size="sm"
            to={routes.enterInviteCode}
            className={styles.secondaryButton}
          >
            {t("auth:common.haveAnInviteCode")}
          </Button>
        </div>
      </div>

      <p className={styles.trust}>
        <FiLock aria-hidden className={styles.trustIcon} />
        <span>{t("auth:signIn.trust")}</span>
      </p>
    </div>
  );
}
