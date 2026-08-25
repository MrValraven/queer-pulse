import { FiArrowRight } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import type { TFunction } from "../../shared/i18n/types";
import type { VerificationEventDTO } from "./api/adminVerifications.api";
import type { VerificationLevel } from "../economy/api/verification.api";
import type { MemberRefDTO } from "../../shared/api/refs";
import styles from "./AdminVerificationsPage.module.css";

function actorLabel(actor: MemberRefDTO | null, t: TFunction): string {
  if (!actor) return t("admin:verifications.drawer.historySystemActor");
  return `${actor.firstName} ${actor.lastName}`.trim();
}

function levelLabel(
  level: VerificationLevel | null,
  t: TFunction,
): string | null {
  return level ? t(`admin:verifications.level.${level}`) : null;
}

/**
 * The append-only verification audit trail for one member, rendered into
 * `VerificationDetailDrawer`'s body — mirrors `ListingHistoryPanel`'s
 * skeleton/empty/list structure. One row per `VerificationEventDTO`: the
 * action, the level range it moved (`fromLevel` → `toLevel`, either side
 * optional — e.g. a `submitted` event only carries `fromLevel`), who did it
 * (or "System" when `actor` is null, e.g. an automated self-serve step-up),
 * a relative timestamp, and the reason when one was recorded.
 *
 * `events`/`isLoading` come from the parent drawer's own `useVerificationHistory`
 * call rather than a second fetch here — the drawer's head also needs this
 * same history to derive the provenance line, so it reads the hook once and
 * passes the result down.
 */
export function VerificationHistoryPanel({
  events,
  isLoading,
}: {
  events: VerificationEventDTO[];
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.historyPanel}>
      <h4 className={styles.historySectionTitle}>
        {t("admin:verifications.drawer.historyHeading")}
      </h4>
      {isLoading ? (
        <HistorySkeleton />
      ) : events.length > 0 ? (
        <ul className={styles.historyList}>
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        <p className={styles.historyEmpty}>
          {t("admin:verifications.drawer.historyEmpty")}
        </p>
      )}
    </div>
  );
}

function EventRow({ event }: { event: VerificationEventDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const whenText = formatRelative(event.createdAt, fmt);
  const fromLabel = levelLabel(event.fromLevel, t);
  const toLabel = levelLabel(event.toLevel, t);

  return (
    <li className={styles.historyRow}>
      <div className={styles.historyRowHead}>
        <span className={styles.historyRowLabel}>
          {t(`admin:verifications.drawer.historyAction.${event.action}`)}
        </span>
        {whenText && (
          <time className={styles.historyRowMeta} dateTime={event.createdAt}>
            {whenText}
          </time>
        )}
      </div>
      <div className={styles.historyRowDetail}>
        {fromLabel}
        {fromLabel && toLabel && (
          <FiArrowRight aria-hidden className={styles.historyArrow} />
        )}
        {toLabel}
        <span className={styles.historyActor}>
          {(fromLabel || toLabel) && "· "}
          {actorLabel(event.actor, t)}
        </span>
      </div>
      {event.reason && <p className={styles.historyReason}>“{event.reason}”</p>}
    </li>
  );
}

function HistorySkeleton() {
  return (
    <div className={styles.historyList} aria-hidden>
      <SkeletonLine width="90%" height={14} />
      <SkeletonLine width="60%" height={12} style={{ marginTop: 8 }} />
      <SkeletonLine width="85%" height={14} style={{ marginTop: 20 }} />
      <SkeletonLine width="50%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}
