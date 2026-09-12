import { useMemberContact } from "../../connect/useMemberContact";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import type { MemberProfile } from "../data/memberProfiles";
import type { NowChipInsight, NowInsights } from "../api/nowInsights.api";
import { openToLabel, reasonValue, type OpenToEntry } from "../openTo.data";
import { nudgeCopy } from "./nowStaleness";
import styles from "./NowOpenToChips.module.css";

export interface NowOpenToChipsProps {
  profile: MemberProfile;
  /** Your own chips are inert: there's no one to reach out to. */
  isSelf: boolean;
  /** Owner-only per-chip pull: a count pill, the dashed unused-chip treatment,
   *  and the swap nudge underneath. Null for a visitor, so those never render
   *  for anyone but the owner even if a caller passed data in by mistake. */
  insights: NowInsights | null;
}

/** The owner-only count pill: a bare visible numeral plus a hidden "{count}
 *  hellos" label, so a screen reader hears the number as what it counts. */
function ChipCount({ count, t }: { count: number; t: TFunction }) {
  return (
    <span className={styles.count}>
      <span aria-hidden="true">{count}</span>
      <span className="visuallyHidden">
        {t("members:content.now.chip.helloCount", { count })}
      </span>
    </span>
  );
}

function chipInsightFor(
  entry: OpenToEntry,
  insights: NowInsights | null,
): NowChipInsight | null {
  if (!insights) return null;
  const reason = reasonValue(entry);
  // The backend's `GROUP BY` only emits a row for a reason that has drawn at
  // least one hello ever, so a door nobody has ever used has no `perChip`
  // entry at all. That absence IS the zero-hellos-forever case the nudge
  // exists for, so it is synthesized here rather than left as `null` (which
  // would make the chip render exactly like a visitor's, with no count pill,
  // no dashed edge and no nudge, rendering nothing for the one door the
  // feature exists for.
  return (
    insights.perChip.find((chip) => chip.reason === reason) ?? {
      reason,
      count: 0,
      lastHelloAt: null,
    }
  );
}

/**
 * The "Open to" row: one chip per door the member leaves open, each one a
 * shortcut into the connect form with the reason already chosen.
 *
 * A visitor's chip is a real button that calls `contact()`; the owner's is an
 * inert span carrying, additionally, a count pill for how many hellos it drew
 * in the current window, a dashed edge when that count is zero, and (below
 * it) a nudge to swap the door out when it has stayed at zero long enough.
 * `reasonValue()` is the single encoder both this row and the connect form's
 * `<select>` share, so a chip's value preselects there byte for byte.
 */
export function NowOpenToChips({
  profile,
  isSelf,
  insights,
}: NowOpenToChipsProps) {
  const { t } = useTranslation();
  const { contact } = useMemberContact(profile.slug);
  if (profile.openTo.length === 0) return null;
  const ownerInsights = isSelf ? insights : null;
  return (
    <div className={styles.openRow}>
      <span className={styles.openLabel}>
        {t("members:content.now.openLabel")}
      </span>
      {profile.openTo.map((entry) => {
        const label = openToLabel(entry, t);
        const chipInsight = chipInsightFor(entry, ownerInsights);
        const hasNoRecentHellos =
          chipInsight !== null && chipInsight.count === 0;
        const nudge = hasNoRecentHellos ? nudgeCopy(chipInsight, t) : null;
        const chipClass = [
          styles.chip,
          entry.kind === "custom" ? styles.chipCustom : "",
          hasNoRecentHellos ? styles.chipUnused : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={reasonValue(entry)} className={styles.chipGroup}>
            {isSelf ? (
              <span className={chipClass}>
                {label}
                {chipInsight && <ChipCount count={chipInsight.count} t={t} />}
              </span>
            ) : (
              <button
                type="button"
                className={`${chipClass} ${styles.chipAction}`}
                onClick={() =>
                  contact(
                    {
                      slug: profile.slug,
                      name: `${profile.first} ${profile.last}`,
                    },
                    reasonValue(entry),
                  )
                }
              >
                {label}
              </button>
            )}
            {nudge && <p className={styles.nudge}>{nudge}</p>}
          </div>
        );
      })}
    </div>
  );
}
