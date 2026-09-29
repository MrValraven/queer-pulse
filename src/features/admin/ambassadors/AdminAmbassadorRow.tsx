import { Link } from "react-router-dom";
import { FiAlertCircle, FiClock, FiEyeOff } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { routes } from "../../../app/routeMap";
import {
  AMBASSADOR_FOCUS_AREAS,
  AMBASSADOR_FOCUS_LABEL_KEY,
  isAmbassadorFocusArea,
  type AmbassadorFocusArea,
} from "../../../shared/ambassadors/ambassadorFocusAreas.data";
import { AdminAvatar, AdminChip } from "../ui";
import type { AdminAmbassadorDTO } from "./adminAmbassadors.api";
import styles from "./AdminAmbassadorsPage.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * One ambassador grant. An active row carries the two actions (change focus,
 * revoke); a past row reads as the record of who revoked it and why. Every row
 * opens the member's grant history. The revoke confirm and the history drawer
 * are owned by the page: this row leaves the list the moment the revoke
 * lands, and a dialog hosted here would unmount with it.
 */
export function AdminAmbassadorRow({
  row,
  isFocusSaving,
  onChangeFocus,
  onRevoke,
  onShowHistory,
}: {
  row: AdminAmbassadorDTO;
  isFocusSaving: boolean;
  onChangeFocus: (focusArea: AmbassadorFocusArea) => void;
  onRevoke: () => void;
  onShowHistory: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const name = `${row.member.firstName} ${row.member.lastName}`.trim();
  const isActive = !row.revokedAt;
  const formatWhen = (iso: string) =>
    formatters.date(new Date(iso), DATE_OPTIONS);

  return (
    <article className={styles.row} aria-label={name}>
      <div className={styles.rowIdentity}>
        <AdminAvatar
          size="md"
          src={row.member.avatarUrl ?? undefined}
          initials={`${row.member.firstName.slice(0, 1)}${row.member.lastName.slice(0, 1)}`}
          alt=""
        />
        <div className={styles.rowNameBlock}>
          <Link
            to={`${routes.members}/${row.member.slug}`}
            className={styles.rowName}
          >
            {name}
          </Link>
          <span className={styles.rowSlug}>@{row.member.slug}</span>
        </div>
        <div className={styles.rowChips}>
          <AdminChip tone="coral">
            {t(AMBASSADOR_FOCUS_LABEL_KEY[row.focusArea])}
          </AdminChip>
          {isActive && !row.isTagVisible && (
            <AdminChip tone="ghost">
              <FiEyeOff aria-hidden /> {t("admin:ambassadors.row.tagHidden")}
            </AdminChip>
          )}
        </div>
      </div>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>{t("admin:ambassadors.row.since")}</dt>
          <dd>{formatWhen(row.grantedAt)}</dd>
        </div>
        <div className={styles.fact}>
          <dt>{t("admin:ambassadors.row.grantedBy")}</dt>
          <dd>
            {row.grantedBy?.name ?? t("admin:ambassadors.row.unknownStaff")}
          </dd>
        </div>
        <div className={`${styles.fact} ${styles.factWide}`}>
          <dt>{t("admin:ambassadors.row.grantReason")}</dt>
          <dd>{row.grantReason}</dd>
        </div>
        {row.revokedAt && (
          <>
            <div className={styles.fact}>
              <dt>{t("admin:ambassadors.row.revokedOn")}</dt>
              <dd>{formatWhen(row.revokedAt)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{t("admin:ambassadors.row.revokedBy")}</dt>
              <dd>
                {row.revokedBy?.name ?? t("admin:ambassadors.row.unknownStaff")}
              </dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt>{t("admin:ambassadors.row.revokeReason")}</dt>
              <dd>{row.revokeReason}</dd>
            </div>
          </>
        )}
      </dl>

      {isActive && row.inviteQuotaOverride !== null && (
        <p className={styles.overrideNote}>
          <FiAlertCircle aria-hidden />
          {t("admin:ambassadors.row.quotaOverride", {
            quota: row.inviteQuotaOverride,
          })}
        </p>
      )}

      <div className={styles.rowActions}>
        {isActive && (
          <div className={styles.focusControl}>
            <span className={styles.focusCaption} aria-hidden>
              {t("admin:ambassadors.row.changeFocus")}
            </span>
            <select
              className={styles.select}
              value={row.focusArea}
              disabled={isFocusSaving}
              aria-label={t("admin:ambassadors.row.changeFocusAria", { name })}
              onChange={(event) => {
                const nextFocus = event.target.value;
                if (isAmbassadorFocusArea(nextFocus)) onChangeFocus(nextFocus);
              }}
            >
              {AMBASSADOR_FOCUS_AREAS.map((focusArea) => (
                <option key={focusArea} value={focusArea}>
                  {t(AMBASSADOR_FOCUS_LABEL_KEY[focusArea])}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={styles.rowButtons}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowHistory}
            aria-label={t("admin:ambassadors.row.historyAria", { name })}
          >
            <FiClock aria-hidden /> {t("admin:ambassadors.row.history")}
          </Button>
          {isActive && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRevoke}
              aria-label={t("admin:ambassadors.row.revokeAria", { name })}
            >
              {t("admin:ambassadors.row.revoke")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
