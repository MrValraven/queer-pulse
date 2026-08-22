import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  IVA_EXEMPTION_OVERRUN,
  IVA_EXEMPTION_THRESHOLD,
  IVA_EXEMPT_NOTE,
  TAX_DISCLAIMER_KEY,
} from "./tax.constants";
import type { IvaEntry } from "./ivaTracker.data";
import styles from "./IvaTrackerPage.module.css";

interface IvaTrackerStatusProps {
  entries: IvaEntry[];
}

/** How close to the limit before we flip from comfortable to warning. */
const NEAR_THRESHOLD_MARGIN = 2000;

type Zone = "safe" | "near" | "over" | "overrun";

function zoneFor(total: number): Zone {
  if (total > IVA_EXEMPTION_OVERRUN) return "overrun";
  if (total > IVA_EXEMPTION_THRESHOLD) return "over";
  if (total >= IVA_EXEMPTION_THRESHOLD - NEAR_THRESHOLD_MARGIN) return "near";
  return "safe";
}

const ZONE_CLASS: Record<Zone, string | undefined> = {
  safe: styles.zoneSafe,
  near: styles.zoneNear,
  over: styles.zoneOver,
  overrun: styles.zoneOverrun,
};

/**
 * Live read-out of invoiced income against the art. 53.º exemption threshold:
 * a colour-coded progress bar, the headline numbers, and an escalating warning
 * once you cross €15,000 (and a hard one past €18,750).
 */
export function IvaTrackerStatus({ entries }: IvaTrackerStatusProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const total = entries.reduce(
    (sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0),
    0,
  );
  const remaining = IVA_EXEMPTION_THRESHOLD - total;
  const pct = (total / IVA_EXEMPTION_THRESHOLD) * 100;
  const barPct = Math.min(100, Math.max(0, pct));
  const zone = zoneFor(total);
  const thresholdFmt = fmt.currency(IVA_EXEMPTION_THRESHOLD);
  const overrunFmt = fmt.currency(IVA_EXEMPTION_OVERRUN);

  return (
    <div className={`${styles.status} ${ZONE_CLASS[zone]}`}>
      <p className={styles.statusEyebrow}>
        {t("economy:ivaTracker.status.eyebrow")}
      </p>
      <p className={styles.statusTotal}>{fmt.currency(total)}</p>

      <div
        className={styles.barTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={IVA_EXEMPTION_THRESHOLD}
        aria-valuenow={Math.round(total)}
        aria-label={t("economy:ivaTracker.status.barAriaLabel")}
      >
        <div
          className={styles.barFill}
          style={{ transform: `scaleX(${barPct / 100})` }}
        />
        <span className={styles.barCap}>{thresholdFmt}</span>
      </div>

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt>{t("economy:ivaTracker.status.invoiced")}</dt>
          <dd>{fmt.currency(total)}</dd>
        </div>
        <div className={styles.metric}>
          <dt>
            {remaining >= 0
              ? t("economy:ivaTracker.status.headroomLeft")
              : t("economy:ivaTracker.status.overBy")}
          </dt>
          <dd>{fmt.currency(Math.abs(remaining))}</dd>
        </div>
        <div className={styles.metric}>
          <dt>{t("economy:ivaTracker.status.thresholdUsed")}</dt>
          <dd>{Math.round(pct)}%</dd>
        </div>
      </dl>

      {zone === "safe" && (
        <p className={styles.note}>
          <FiCheckCircle aria-hidden className={styles.noteIconOk} />
          <span>{t("economy:ivaTracker.status.safeNote")}</span>
        </p>
      )}

      {zone === "near" && (
        <p className={styles.note}>
          <FiAlertTriangle aria-hidden className={styles.noteIconWarn} />
          <span>
            {t("economy:ivaTracker.status.nearNote", {
              remaining: fmt.currency(Math.max(0, remaining)),
              threshold: thresholdFmt,
            })}
          </span>
        </p>
      )}

      {zone === "over" && (
        <p className={styles.note}>
          <FiAlertTriangle aria-hidden className={styles.noteIconDanger} />
          <span>
            {t("economy:ivaTracker.status.overNote", {
              threshold: thresholdFmt,
              overrun: overrunFmt,
            })}
          </span>
        </p>
      )}

      {zone === "overrun" && (
        <div className={styles.hardWarn}>
          <p className={styles.hardWarnTitle}>
            <FiAlertTriangle aria-hidden />{" "}
            <Translation
              i18nKey="economy:ivaTracker.status.overrunTitle"
              components={{ em: <em /> }}
            />
          </p>
          <p className={styles.hardWarnBody}>
            {t("economy:ivaTracker.status.overrunBody", {
              overrun: overrunFmt,
            })}
          </p>
          <p className={styles.hardWarnNote}>
            {t("economy:ivaTracker.status.overrunNote", {
              note: IVA_EXEMPT_NOTE,
            })}
          </p>
        </div>
      )}

      <p className={styles.disclaimer}>{t(TAX_DISCLAIMER_KEY)}</p>
    </div>
  );
}
