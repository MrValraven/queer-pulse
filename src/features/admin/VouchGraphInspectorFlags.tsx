import { type ReactNode } from "react";
import { Button } from "../../shared/components/ui";
import { intlLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatCreationWindow } from "./trustGraph/trustCaseText";
import type {
  TrustRing,
  VouchPerson,
  WeakVoucher,
} from "./trustGraph/trustGraphModel";
import type { Translate } from "./trustGraph/trustPathSentence";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import styles from "./vouchGraphInspector.module.css";

const MILLISECONDS_PER_HOUR = 3_600_000;

type BannerKind = "danger" | "amber" | "coral" | "plum";

const BANNER_CLASS: Record<BannerKind, string | undefined> = {
  danger: styles.flag_danger,
  amber: styles.flag_amber,
  coral: styles.flag_coral,
  plum: styles.flag_plum,
};

function Banner({
  kind,
  title,
  body,
  children,
}: {
  kind: BannerKind;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`${styles.flag} ${BANNER_CLASS[kind] ?? ""}`}>
      <b>{title}</b>
      {body && <span>{body}</span>}
      {children}
    </div>
  );
}

/** How long the ring took to sign up, in hours between its first and last
 *  member. Null when either date is unreadable. */
function ringWindowHours(ring: TrustRing): number | null {
  const firstJoinedMilliseconds = Date.parse(ring.firstJoinedAt);
  const lastJoinedMilliseconds = Date.parse(ring.lastJoinedAt);
  if (
    Number.isNaN(firstJoinedMilliseconds) ||
    Number.isNaN(lastJoinedMilliseconds)
  )
    return null;
  return (
    Math.max(0, lastJoinedMilliseconds - firstJoinedMilliseconds) /
    MILLISECONDS_PER_HOUR
  );
}

/** B2: the ring banner, built from the ring record the backend sends. */
function RingBanner({
  ring,
  onShowRing,
}: {
  ring: TrustRing;
  onShowRing: (ringId: string) => void;
}) {
  const { t, language } = useTranslation();
  const translate: Translate = t;
  const sharedNames = new Intl.ListFormat(intlLocale(language), {
    type: "conjunction",
  }).format(ring.sharedVouchers.map((voucher) => voucher.name));
  return (
    <Banner
      kind="danger"
      title={t("admin:vouchGraph.inspector.ringBanner.title")}
      body={t("admin:vouchGraph.inspector.ringBanner.bodyWindow", {
        count: ring.memberCount,
        window: formatCreationWindow(ringWindowHours(ring), translate),
      })}
    >
      <span>
        {ring.sharedVouchers.length > 0
          ? t("admin:vouchGraph.inspector.ringBanner.sharedVouchers", {
              names: sharedNames,
            })
          : t("admin:vouchGraph.inspector.ringBanner.noSharedVouchers")}
      </span>
      <div className={styles.flagActions}>
        <Button variant="ghost" size="sm" onClick={() => onShowRing(ring.id)}>
          {t("admin:vouchGraph.inspector.ringBanner.showLoopCta")}
        </Button>
      </div>
    </Banner>
  );
}

/** A2: the isolation banner lists each weak voucher as "Name (reason)", one
 *  button per voucher that selects them when they are in this view. */
function IsolationBanner({
  vouchers,
  onGo,
}: {
  vouchers: WeakVoucher[];
  onGo: (id: string) => void;
}) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const reasonText = (voucher: WeakVoucher): string =>
    voucher.reason === "new"
      ? t("admin:vouchGraph.inspector.isolationBanner.reason.new", {
          count: graph.newAccountWindowDays,
        })
      : t(
          `admin:vouchGraph.inspector.isolationBanner.reason.${voucher.reason}`,
        );
  return (
    <Banner
      kind="amber"
      title={t("admin:vouchGraph.inspector.isolationBanner.title")}
      body={t("admin:vouchGraph.inspector.isolationBanner.body")}
    >
      <span className={styles.flagSubTitle}>
        {t("admin:vouchGraph.inspector.isolationBanner.causesTitle")}
      </span>
      <ul className={styles.causeList}>
        {vouchers.map((voucher) => {
          const line = t(
            "admin:vouchGraph.inspector.isolationBanner.causeLine",
            {
              name: voucher.name,
              reason: reasonText(voucher),
            },
          );
          const isInView = !!graph.peopleById[voucher.id];
          return (
            <li key={voucher.id}>
              {isInView ? (
                <button
                  type="button"
                  className={styles.nameButton}
                  onClick={() => onGo(voucher.id)}
                >
                  {line}
                </button>
              ) : (
                <span className={styles.nameText}>{line}</span>
              )}
            </li>
          );
        })}
      </ul>
    </Banner>
  );
}

interface VouchGraphInspectorFlagsProps {
  person: VouchPerson;
  onGo: (id: string) => void;
  onShowRing: (ringId: string) => void;
}

/** Every safety banner for the selected member: ring, isolation, reports and
 *  a private network. */
export function VouchGraphInspectorFlags({
  person,
  onGo,
  onShowRing,
}: VouchGraphInspectorFlagsProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const ring = person.ringId ? graph.ringById(person.ringId) : undefined;
  // A ring member whose ring record is missing still gets the title alone.
  const isRingWithoutRecord = !ring && !!person.inRing;

  return (
    <>
      {ring && <RingBanner ring={ring} onShowRing={onShowRing} />}
      {isRingWithoutRecord && (
        <Banner
          kind="danger"
          title={t("admin:vouchGraph.inspector.ringBanner.title")}
        />
      )}
      {person.isolatedBy.length > 0 && (
        <IsolationBanner vouchers={person.isolatedBy} onGo={onGo} />
      )}
      {!!person.reports && (
        <Banner
          kind="coral"
          title={t("admin:vouchGraph.inspector.reportsBanner.title", {
            count: person.reports,
          })}
          body={t("admin:vouchGraph.inspector.reportsBanner.body")}
        />
      )}
      {person.private && (
        <Banner
          kind="plum"
          title={t("admin:vouchGraph.inspector.privateBanner.title")}
          body={t("admin:vouchGraph.inspector.privateBanner.body")}
        />
      )}
    </>
  );
}
