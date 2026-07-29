import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "./ui";
import { portrait } from "./adminPeople.data";
import type {
  AdminMember,
  FlaggedMember,
  VouchAvatar,
} from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/* ── All members ─────────────────────────────────────────── */

export function AdminMemberRows({
  members,
  onSelect,
}: {
  members: AdminMember[];
  onSelect: (m: AdminMember) => void;
}) {
  const { t } = useTranslation();
  if (members.length === 0) {
    return <p className={styles.emptyLine}>{t("admin:members.empty")}</p>;
  }
  return (
    <div className={styles.rows}>
      {members.map((m, i) => (
        <FadeIn key={m.id} delay={Math.min(i, 8) * 50}>
          <div
            className={styles.row}
            role="button"
            tabIndex={0}
            aria-label={t("admin:members.openAriaLabel", { name: m.name })}
            onClick={() => onSelect(m)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(m);
              }
            }}
          >
            <AdminAvatar
              initials={m.initials}
              tone={m.tone}
              size="md"
              verified={m.verified}
              src={m.avatarUrl ?? portrait(m.name)}
            />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{m.name}</span>
                <span className={styles.pronoun}>{m.pronoun}</span>
                <AdminChip tone={m.statusTone} dot>
                  {m.verified
                    ? t("admin:members.status.verified")
                    : t("admin:members.status.openReports", {
                        count: m.openReportsCount ?? 0,
                      })}
                </AdminChip>
              </div>
              <div className={styles.rowMeta}>{m.meta}</div>
            </div>
            <VouchStrip vouchedBy={m.vouchedBy} total={m.vouchCount} />
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

function VouchStrip({
  vouchedBy,
  total,
}: {
  vouchedBy: VouchAvatar[];
  total: number;
}) {
  const { t } = useTranslation();
  const shown = vouchedBy.slice(0, 4);
  const more = total - shown.length;
  return (
    <div className={styles.vouchStrip}>
      <div className={styles.stack}>
        {shown.map((v, i) => (
          <span
            key={i}
            className={styles.stackItem}
            style={{ zIndex: shown.length - i }}
          >
            <AdminAvatar
              initials={v.initials}
              tone={v.tone}
              size="sm"
              src={v.avatarUrl ?? undefined}
            />
          </span>
        ))}
        {more > 0 && <span className={styles.stackMore}>+{more}</span>}
      </div>
      <span className={styles.vouchLabel}>
        {t("admin:members.vouchedLabel")}
      </span>
    </div>
  );
}

/* ── Flagged ─────────────────────────────────────────────── */

export function AdminFlaggedRows({ members }: { members: FlaggedMember[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {members.map((m, i) => (
        <FadeIn key={m.id} delay={Math.min(i, 8) * 50}>
          <div className={`${styles.row} ${styles.rowFlagged}`}>
            <AdminAvatar
              initials={m.initials}
              tone={m.tone}
              size="md"
              src={m.avatarUrl ?? undefined}
            />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowHandle}>{m.handle}</span>
                <AdminChip tone={m.categoryTone}>
                  {m.category.kind === "reportsCount"
                    ? t("admin:members.flagged.reportsCount", {
                        count: m.category.count,
                      })
                    : t(`admin:members.flagged.category.${m.category.kind}`)}
                </AdminChip>
              </div>
              <div className={styles.rowMeta}>{m.meta}</div>
            </div>
            <AdminChip tone={m.statusTone} dot>
              {t(`admin:members.flagged.status.${m.statusId}`)}
            </AdminChip>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
