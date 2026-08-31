import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COHOST_INVITE_COMMITMENTS,
  COHOST_INVITE_ROLES,
} from "./cohostInviteOptions";
import styles from "./CoHostInvitePage.module.css";

/** The co-host invite's chosen role and time commitment, resolved from their
 *  ids against the fixed taxonomy, plus a fixed note on what a co-host can
 *  do (editing/RSVPs are granted on accept) and what always stays with the
 *  lead host (cancelling the gathering and the host fund). */
export function CoHostInviteDetails({
  role,
  commitment,
  host,
}: {
  role: string;
  commitment: string;
  host: string;
}) {
  const { t } = useTranslation();
  const roleOption = COHOST_INVITE_ROLES.find((r) => r.id === role);
  const commitmentOption = COHOST_INVITE_COMMITMENTS.find(
    (c) => c.id === commitment,
  );
  return (
    <div className={styles.roleCard}>
      <h3>
        <Translation
          i18nKey="gatherings:cohostInvite.rolesTitle"
          components={{ em: <em /> }}
        />
      </h3>
      {roleOption && (
        <div className={styles.roleRow}>
          <div className={styles.roleText}>
            <b>{t(roleOption.labelKey)}</b>
            <span>{t(roleOption.descriptionKey)}</span>
          </div>
        </div>
      )}
      {commitmentOption && (
        <div className={styles.roleRow}>
          <div className={styles.roleText}>
            <b>{t(commitmentOption.labelKey)}</b>
            <span>{t(commitmentOption.descriptionKey)}</span>
          </div>
        </div>
      )}
      <p className={styles.outclause}>
        <Translation
          i18nKey="gatherings:cohostInvite.permissionsNote"
          values={{ host }}
          components={{ b: <b /> }}
        />
      </p>
    </div>
  );
}
