import { Link } from "react-router-dom";
import { FiKey, FiLogIn } from "react-icons/fi";
import { CopyLinkRow } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { joinRequestStatusLink } from "./api/joinRequestStatusToken";
import styles from "./RequestInviteReference.module.css";

/**
 * The reference code, handed over at the one moment it exists.
 *
 * The backend keeps only a hash of this token and QueerPulse sends no email, so
 * this block is the entire delivery mechanism: if the applicant leaves without
 * it, their decision becomes unreachable to them forever. Hence a copy
 * affordance (the shared `CopyLinkRow`, so there is exactly one clipboard
 * implementation in the app), a plain sentence about why it matters, and a
 * direct link that carries the code for them.
 *
 * `token` is null on the 409 duplicate path — no new row, no new token — where
 * this renders the two RECOVERY routes instead of an empty code slot (PRD-14).
 *
 * Both routes are here because a re-submission is usually someone who lost
 * their code, and a bare "you already asked" ends their journey there. The
 * routes are, in order of how likely they are to work:
 *
 *   1. the code they may still have, pasted into the status page;
 *   2. signing in with the Google account for the address they applied under,
 *      which proves they own it and carries them to their own status page.
 *
 * The second one exists BECAUSE there is no third. QueerPulse sends no email
 * and an applicant has no account, so nothing can deliver a replacement code
 * to a typed address. A "tell us your email and we will look it up" form would
 * have to answer the typist directly, which on an invite-gated platform means
 * telling any stranger whether a given person has applied. Google sign-in
 * proves the address instead of asking someone to claim it.
 */
export function RequestInviteReference({ token }: { token: string | null }) {
  const { t } = useTranslation();

  if (!token) {
    return (
      <div className={styles.panel}>
        <h2 className={styles.title}>
          <FiKey aria-hidden /> {t("auth:requestInvite.reference.backTitle")}
        </h2>
        <p className={styles.body}>
          {t("auth:requestInvite.reference.noCode")}
        </p>
        <Link className={styles.link} to={routes.joinRequestStatus}>
          {t("auth:requestInvite.reference.enterCodeCta")}
        </Link>
        <p className={styles.body}>
          {t("auth:requestInvite.reference.signInBody")}
        </p>
        <Link className={styles.link} to={routes.signIn}>
          <FiLogIn aria-hidden /> {t("auth:requestInvite.reference.signInCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>
        <FiKey aria-hidden /> {t("auth:requestInvite.reference.title")}
      </h2>
      <CopyLinkRow
        tone="paper"
        value={token}
        fieldLabel={t("auth:requestInvite.reference.fieldLabel")}
        copyLabel={t("auth:requestInvite.reference.copy")}
        copiedLabel={t("auth:requestInvite.reference.copied")}
        copiedToast={t("auth:requestInvite.reference.copiedToast")}
        errorToast={t("auth:requestInvite.reference.copyErrorToast")}
        className={styles.codeRow}
      />
      <p className={styles.body}>{t("auth:requestInvite.reference.body")}</p>
      <Link className={styles.link} to={joinRequestStatusLink(token)}>
        {t("auth:requestInvite.reference.checkCta")}
      </Link>
    </div>
  );
}
