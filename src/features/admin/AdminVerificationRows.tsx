import { FiChevronRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberRefToPerson } from "../../shared/api/refs";
import { AdminAvatar, AdminChip, type AvatarTone } from "./ui";
import { VERIFICATION_STATUS_TONE } from "./verificationStatusTone";
import type { AdminVerificationDTO } from "./api/adminVerifications.api";
import styles from "./AdminSubmissionList.module.css";

/**
 * The verification queue's row list, on the shared `AdminSubmissionList`
 * classes (the same row family as the concerns/nominations/proposals
 * inboxes). Each row is read-only here — the level `<select>` + Apply
 * control that used to sit inline moved into the detail drawer (Task F);
 * this row's only interactive control is the trailing "Review" button that
 * opens it via `onOpen(userId)`.
 */
export function AdminVerificationRows({
  rows,
  onOpen,
}: {
  rows: AdminVerificationDTO[];
  onOpen: (userId: string) => void;
}) {
  return (
    <div className={styles.rows}>
      {rows.map((row) => (
        <AdminVerificationRow key={row.userId} row={row} onOpen={onOpen} />
      ))}
    </div>
  );
}

function AdminVerificationRow({
  row,
  onOpen,
}: {
  row: AdminVerificationDTO;
  onOpen: (userId: string) => void;
}) {
  const { t } = useTranslation();
  const person = memberRefToPerson(row.member);
  const name = person?.name ?? t("admin:verifications.unknownMember");
  const methodLabel = row.method ?? t("admin:verifications.meta.unknown");
  const providerLabel = row.provider ?? t("admin:verifications.meta.unknown");

  return (
    <div className={styles.row}>
      <AdminAvatar
        initials={person?.initials ?? "?"}
        // `Person.tint` is `AvatarTint` (a different, wider palette type);
        // `tintForSlug` (its only source) only ever produces coral/plum/jade,
        // which is also a subset of AdminAvatar's `AvatarTone` — same cast
        // used by EditSuggestionRows.
        tone={(person?.tint as AvatarTone | undefined) ?? "anon"}
        size="md"
        src={person?.avatarUrl ?? undefined}
        alt={name}
      />
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{name}</span>
          <AdminChip tone={VERIFICATION_STATUS_TONE[row.level]} dot>
            {t(`admin:verifications.level.${row.level}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:verifications.via", {
            method: methodLabel,
            provider: providerLabel,
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button variant="ghost" size="sm" onClick={() => onOpen(row.userId)}>
          {t("admin:verifications.reviewCta")}
          <FiChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
