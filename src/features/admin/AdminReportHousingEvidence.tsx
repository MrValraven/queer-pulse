import type { ReactNode } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useClipboard } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  ReportedGroupRoomSnapshot,
  ReportedHomeSnapshot,
} from "./adminModeration.data";
import styles from "./AdminReportEvidence.module.css";

/**
 * LOC-F12: the housing snapshots a report carries, as the server took them
 * when the report was filed (`HousingSnapshotEvidence` and
 * `GroupListingSnapshotEvidence` in queerpulse-backend
 * `reports/report-evidence.ts`). Colocated with `AdminReportGroupEvidence.tsx`
 * and sharing its module, so every evidence block keeps one section rhythm.
 *
 * Neither snapshot stores photos, so each block shows the listing's own words
 * and its key facts. The poster is held by account id: the content author
 * above names whoever the live row points at, and this line keeps the account
 * on record at filing time, which outlives a deleted room.
 */

function EvidenceFact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.evidenceFact}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * The listing's own words in one quote: its title in bold with the body below.
 * The title is left out when it repeats the reported-content excerpt above
 * word for word (a listing report's excerpt is usually the title itself), so
 * the moderator reads each line once.
 */
function ListingWords({
  title,
  body,
  excerpt,
}: {
  title: string;
  body: string | null;
  excerpt?: string;
}) {
  const isTitleRepeated =
    excerpt !== undefined && title.trim() === excerpt.trim();
  if (isTitleRepeated && !body) return null;
  return (
    <div className={styles.evidenceQuote}>
      {!isTitleRepeated && <p className={styles.evidenceQuoteTitle}>{title}</p>}
      {body && <p className={styles.evidenceQuoteBody}>{body}</p>}
    </div>
  );
}

/** The account id on record, with a small button that copies it, so a
 *  moderator can paste it into a member search without selecting a long
 *  UUID by hand. */
function EvidenceAccountId({ accountId }: { accountId: string | null }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { copy, copied: isCopied } = useClipboard();

  if (!accountId) {
    return <>{t("admin:moderation.reportDrawer.housingEvidence.noAccount")}</>;
  }

  async function copyAccountId(value: string) {
    const didCopy = await copy(value);
    showToast(
      t(
        didCopy
          ? "admin:moderation.reportDrawer.housingEvidence.accountIdCopied"
          : "admin:moderation.reportDrawer.housingEvidence.copyFailed",
      ),
      didCopy ? "success" : "error",
    );
  }

  return (
    <span className={styles.evidenceAccount}>
      <span className={styles.evidenceAccountId}>{accountId}</span>
      <button
        type="button"
        className={styles.evidenceCopy}
        onClick={() => void copyAccountId(accountId)}
        aria-label={t(
          isCopied
            ? "admin:moderation.reportDrawer.housingEvidence.accountIdCopied"
            : "admin:moderation.reportDrawer.housingEvidence.copyAccountId",
        )}
      >
        {isCopied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
      </button>
    </span>
  );
}

function useEvidenceMoments() {
  const format = useFormat();
  return {
    formatDay: (iso: string) => format.date(new Date(iso)),
    formatMoment: (iso: string) => {
      const moment = new Date(iso);
      return `${format.date(moment)} ${format.time(moment)}`;
    },
    formatRent: (euros: number) =>
      format.currency(euros, "EUR", { maximumFractionDigits: 0 }),
  };
}

/** A reported home (`housing` subject). */
export function ReportedHomeEvidence({
  home,
  excerpt,
}: {
  home: ReportedHomeSnapshot;
  /** The reported-content excerpt above, see `ListingWords`. */
  excerpt?: string;
}) {
  const { t } = useTranslation();
  const { formatDay, formatMoment, formatRent } = useEvidenceMoments();
  const location = [home.area, home.city].filter(Boolean).join(", ");

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionLabel}>
        {t("admin:moderation.reportDrawer.homeEvidence.title")}
      </h3>

      <ListingWords title={home.title} body={home.blurb} excerpt={excerpt} />

      <dl className={styles.evidenceFacts}>
        {home.rentEuros !== null && (
          <EvidenceFact
            label={t("admin:moderation.reportDrawer.housingEvidence.rentLabel")}
          >
            {formatRent(home.rentEuros)}
          </EvidenceFact>
        )}
        {location && (
          <EvidenceFact
            label={t(
              "admin:moderation.reportDrawer.homeEvidence.locationLabel",
            )}
          >
            {location}
          </EvidenceFact>
        )}
        <EvidenceFact
          label={t("admin:moderation.reportDrawer.housingEvidence.listedLabel")}
        >
          {formatDay(home.listedAt)}
        </EvidenceFact>
        <EvidenceFact
          label={t(
            "admin:moderation.reportDrawer.housingEvidence.capturedLabel",
          )}
        >
          {formatMoment(home.capturedAt)}
        </EvidenceFact>
        <EvidenceFact
          label={t("admin:moderation.reportDrawer.homeEvidence.listerLabel")}
        >
          <EvidenceAccountId accountId={home.listerId} />
        </EvidenceFact>
      </dl>
    </section>
  );
}

/** A reported room shared inside a housing group (`group_listing` subject). */
export function ReportedGroupRoomEvidence({
  room,
  excerpt,
}: {
  room: ReportedGroupRoomSnapshot;
  /** The reported-content excerpt above, see `ListingWords`. */
  excerpt?: string;
}) {
  const { t } = useTranslation();
  const { formatDay, formatMoment, formatRent } = useEvidenceMoments();

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionLabel}>
        {t("admin:moderation.reportDrawer.groupRoomEvidence.title")}
      </h3>

      <ListingWords
        title={room.title}
        body={room.description}
        excerpt={excerpt}
      />

      <dl className={styles.evidenceFacts}>
        {room.groupName && (
          <EvidenceFact
            label={t(
              "admin:moderation.reportDrawer.groupRoomEvidence.groupLabel",
            )}
          >
            {room.groupName}
          </EvidenceFact>
        )}
        {room.neighbourhood && (
          <EvidenceFact
            label={t(
              "admin:moderation.reportDrawer.groupRoomEvidence.neighbourhoodLabel",
            )}
          >
            {room.neighbourhood}
          </EvidenceFact>
        )}
        {room.priceEuros !== null && (
          <EvidenceFact
            label={t("admin:moderation.reportDrawer.housingEvidence.rentLabel")}
          >
            {formatRent(room.priceEuros)}
          </EvidenceFact>
        )}
        {room.accessibilityInfo && (
          <EvidenceFact
            label={t(
              "admin:moderation.reportDrawer.groupRoomEvidence.accessibilityLabel",
            )}
          >
            {room.accessibilityInfo}
          </EvidenceFact>
        )}
        <EvidenceFact
          label={t("admin:moderation.reportDrawer.housingEvidence.listedLabel")}
        >
          {formatDay(room.listedAt)}
        </EvidenceFact>
        <EvidenceFact
          label={t(
            "admin:moderation.reportDrawer.housingEvidence.capturedLabel",
          )}
        >
          {formatMoment(room.capturedAt)}
        </EvidenceFact>
        <EvidenceFact
          label={t(
            "admin:moderation.reportDrawer.groupRoomEvidence.posterLabel",
          )}
        >
          <EvidenceAccountId accountId={room.posterId} />
        </EvidenceFact>
      </dl>
    </section>
  );
}
