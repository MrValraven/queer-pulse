import { useId } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../shared/lib/initials";
import { routes } from "../../../app/routeMap";
import { AdminAvatar } from "../ui";
import type { EarlyAccessRosterRowDTO } from "../api/adminEarlyAccess.types";
import styles from "./AdminEarlyAccessPage.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * One member holding early access: who they are, when it was turned on and
 * by whom, and Revoke. The row only asks for the confirm; the section hosts
 * the dialog, because the row leaves the list the moment the revoke starts.
 */
export function AdminEarlyAccessRosterRow({
  row,
  onRevoke,
}: {
  row: EarlyAccessRosterRowDTO;
  onRevoke: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const nameId = useId();
  const revokeId = useId();
  const { member, grantedBy } = row;
  const grantedDate = formatters.date(new Date(row.grantedAt), DATE_OPTIONS);

  return (
    <article className={styles.row} aria-label={member.displayName}>
      <div className={styles.identity}>
        <AdminAvatar
          size="md"
          src={member.avatarUrl ?? undefined}
          initials={initialsFromName(member.displayName, "?")}
          alt=""
        />
        <div className={styles.identityText}>
          {/* A member without a public handle has no profile to open. */}
          {member.slug ? (
            <Link
              id={nameId}
              to={`${routes.members}/${member.slug}`}
              className={styles.name}
            >
              {member.displayName}
            </Link>
          ) : (
            <span id={nameId} className={styles.name}>
              {member.displayName}
            </span>
          )}
          <span className={styles.granted}>
            {grantedBy
              ? t("admin:earlyAccess.roster.grantedBy", {
                  staff: grantedBy.displayName,
                  date: grantedDate,
                })
              : t("admin:earlyAccess.roster.grantedOn", { date: grantedDate })}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        id={revokeId}
        className={styles.revoke}
        // Every row's button reads "Revoke access"; its name adds whose.
        aria-labelledby={`${revokeId} ${nameId}`}
        onClick={onRevoke}
      >
        {t("admin:earlyAccess.roster.revokeCta")}
      </Button>
    </article>
  );
}
