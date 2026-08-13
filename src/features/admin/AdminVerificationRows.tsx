import { useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsOf } from "../../shared/api/refs";
import { VerificationBadge } from "../economy/VerificationBadge";
import type { VerificationLevel } from "../economy/api/verification.api";
import type { AdminVerificationDTO } from "./api/adminVerifications.api";
import styles from "./AdminVerificationsPage.module.css";

const LEVELS: VerificationLevel[] = ["none", "email", "phone", "id_verified"];

/** One reviewable verification record with a manual-override control. */
export function AdminVerificationRow({
  row,
  demoMode,
  saving,
  onOverride,
}: {
  row: AdminVerificationDTO;
  demoMode: boolean;
  saving: boolean;
  onOverride: (level: VerificationLevel) => void;
}) {
  const { t } = useTranslation();
  const [level, setLevel] = useState<VerificationLevel>(row.level);
  const name = row.member
    ? `${row.member.firstName} ${row.member.lastName}`.trim()
    : t("admin:verifications.unknownMember");

  return (
    <div className={styles.row}>
      <Avatar
        initials={
          row.member
            ? initialsOf(row.member.firstName, row.member.lastName)
            : "?"
        }
        src={row.member?.avatarUrl ?? undefined}
        alt={name}
        size={40}
      />
      <div className={styles.rowMain}>
        <div className={styles.rowName}>
          {name} <VerificationBadge level={row.level} size="sm" />
        </div>
        <div className={styles.rowMeta}>
          {t("admin:verifications.via", {
            method: row.method ?? "—",
            provider: row.provider ?? "—",
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <label className={styles.srOnly} htmlFor={`level-${row.userId}`}>
          {t("admin:verifications.setLevelLabel")}
        </label>
        <select
          id={`level-${row.userId}`}
          className={styles.select}
          value={level}
          disabled={demoMode || saving}
          onChange={(event) =>
            setLevel(event.target.value as VerificationLevel)
          }
        >
          {LEVELS.map((option) => (
            <option key={option} value={option}>
              {t(`admin:verifications.level.${option}`)}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          disabled={demoMode || saving || level === row.level}
          onClick={() => onOverride(level)}
        >
          {t("admin:verifications.applyCta")}
        </Button>
      </div>
    </div>
  );
}
