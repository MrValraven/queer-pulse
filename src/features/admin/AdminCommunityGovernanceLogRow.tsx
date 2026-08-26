import { FiAlertOctagon, FiUser } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminAvatar, AdminChip } from "./ui";
import type { AdminGovernanceLogEntryDTO } from "./api/adminCommunityGovernanceLog.api";
import {
  GOVERNANCE_ACTION_TONE,
  governanceAvatarTone,
} from "./adminCommunityGovernanceLog.data";
import { AdminCommunityGovernanceLogMeta } from "./AdminCommunityGovernanceLogMeta";
import styles from "./AdminCommunityGovernanceLog.module.css";

/**
 * One governance action: who did what to whom, when, with the server-written
 * metadata underneath.
 *
 * Both `actor` and `target` can be null, and the copy is built so either case
 * still reads as a sentence. A null actor is genuinely ambiguous — the entry is
 * either an automatic platform action or someone who has since erased their
 * account, and the API cannot tell those apart — so the byline says plainly
 * that nobody is named rather than inventing an attribution.
 */
export function AdminCommunityGovernanceLogRow({
  entry,
  delay = 0,
}: {
  entry: AdminGovernanceLogEntryDTO;
  /** Stagger for the entrance reveal, in ms. */
  delay?: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const isAdminOverride = entry.metadata?.adminOverride === true;
  const createdAt = new Date(entry.createdAt);
  const targetName =
    entry.target?.name ?? t("admin:communities.governanceLog.unknownMember");
  const actorName = entry.actor?.name;

  return (
    <FadeIn as="li" className={styles.entry} delay={delay}>
      <AdminAvatar
        initials={entry.actor?.initials ?? <FiUser />}
        tone={governanceAvatarTone(entry.actor?.slug ?? null)}
        size="md"
        src={entry.actor?.avatarUrl ?? undefined}
        alt={actorName}
      />
      <div className={styles.entryBody}>
        <div className={styles.entryHead}>
          <AdminChip tone={GOVERNANCE_ACTION_TONE[entry.action]}>
            {t(`admin:communities.governanceLog.action.${entry.action}`)}
          </AdminChip>
          {isAdminOverride && (
            <AdminChip
              tone="danger"
              title={t("admin:communities.governanceLog.override.hint")}
            >
              <FiAlertOctagon aria-hidden />{" "}
              {t("admin:communities.governanceLog.override.label")}
            </AdminChip>
          )}
        </div>

        <p className={styles.entrySummary}>
          {t(`admin:communities.governanceLog.summary.${entry.action}`, {
            name: targetName,
          })}
        </p>

        <AdminCommunityGovernanceLogMeta
          metadata={entry.metadata}
          details={entry.details}
        />

        <p className={styles.entryFooter}>
          {actorName ? (
            <span>
              {t("admin:communities.governanceLog.byLine", { name: actorName })}
            </span>
          ) : (
            <span title={t("admin:communities.governanceLog.unattributedHint")}>
              {t("admin:communities.governanceLog.unattributed")}
            </span>
          )}
          {" · "}
          <time dateTime={entry.createdAt}>
            {fmt.date(createdAt)} · {fmt.time(createdAt)}
          </time>
        </p>
      </div>
    </FadeIn>
  );
}
