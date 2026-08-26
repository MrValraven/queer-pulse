import { Link } from "react-router-dom";
import { FiKey } from "react-icons/fi";
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
 * this renders the recovery line instead of an empty code slot.
 */
export function RequestInviteReference({ token }: { token: string | null }) {
  const { t } = useTranslation();

  if (!token) {
    return (
      <div className={styles.panel}>
        <p className={styles.body}>
          {t("auth:requestInvite.reference.noCode")}
        </p>
        <Link className={styles.link} to={routes.joinRequestStatus}>
          {t("auth:requestInvite.reference.enterCodeCta")}
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
