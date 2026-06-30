import { FadeIn } from "../../shared/components/ui";
import { AdminAvatar, AdminChip } from "./ui";
import { portrait } from "./adminPeople.data";
import { portraitByInitials } from "./adminVouchGraph.data";
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
  if (members.length === 0) {
    return <p className={styles.emptyLine}>No members match those filters.</p>;
  }
  return (
    <div className={styles.rows}>
      {members.map((m, i) => (
        <FadeIn key={m.id} delay={Math.min(i, 8) * 50}>
          <div
            className={styles.row}
            role="button"
            tabIndex={0}
            aria-label={`Open ${m.name}`}
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
              src={portrait(m.name)}
            />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{m.name}</span>
                <span className={styles.pronoun}>{m.pronoun}</span>
                <AdminChip tone={m.statusTone} dot>
                  {m.statusLabel}
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
              src={portraitByInitials(v.initials)}
            />
          </span>
        ))}
        {more > 0 && <span className={styles.stackMore}>+{more}</span>}
      </div>
      <span className={styles.vouchLabel}>vouched</span>
    </div>
  );
}

/* ── Flagged ─────────────────────────────────────────────── */

export function AdminFlaggedRows({ members }: { members: FlaggedMember[] }) {
  return (
    <div className={styles.rows}>
      {members.map((m, i) => (
        <FadeIn key={m.id} delay={Math.min(i, 8) * 50}>
          <div className={`${styles.row} ${styles.rowFlagged}`}>
            <AdminAvatar initials={m.initials} tone={m.tone} size="md" />
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowHandle}>{m.handle}</span>
                <AdminChip tone={m.catTone}>{m.catLabel}</AdminChip>
              </div>
              <div className={styles.rowMeta}>{m.meta}</div>
            </div>
            <AdminChip tone={m.statusTone} dot>
              {m.statusLabel}
            </AdminChip>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
