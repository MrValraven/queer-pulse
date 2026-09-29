import { FiPlus } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import styles from "../../PitchTrackerPage.module.css";

export interface SubmissionsSummaryProps {
  /** Submissions the desk has not finished with, counted from the member's
   *  own rows. `null` while the first read is in flight or after it failed,
   *  which hides the line so it never claims a zero it has not counted. */
  activeCount: number | null;
  /** Submissions of theirs that reached print. `null` while loading or
   *  after a failed read. */
  publishedCount: number | null;
}

/**
 * The compact row at the top of the Submissions tab: the member's own counts
 * and the way to pitch something new at `/magazine/submit-story`. The
 * workspace's `.ebar` already names the surface, so this row carries no
 * heading of its own.
 *
 * Both numbers are counted from real rows. The prototype interpolated three
 * hardcoded numbers and a turnaround promise that nothing in the product
 * measures, so someone who had pitched once would have read that they had
 * seven live.
 */
export function SubmissionsSummary({
  activeCount,
  publishedCount,
}: SubmissionsSummaryProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.summary}>
      {/* Two pluralized fragments rather than one string with two numbers:
          each half needs its own CLDR `count`, and "1 pitches" is the kind of
          thing a member notices. */}
      {activeCount !== null && publishedCount !== null && (
        <p className={styles.summaryLead}>
          <Translation
            i18nKey="magazine:pitchTracker.header.leadActive"
            values={{ count: activeCount }}
          />
          {" · "}
          <Translation
            i18nKey="magazine:pitchTracker.header.leadPublished"
            components={{ b: <b /> }}
            values={{ count: publishedCount }}
          />
        </p>
      )}
      <Button
        size="sm"
        variant="primary"
        to={routes.submitStory}
        className={styles.summaryCta}
      >
        <FiPlus aria-hidden /> {t("magazine:pitchTracker.header.newPitchCta")}
      </Button>
    </div>
  );
}
