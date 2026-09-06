import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./PitchTrackerPage.module.css";

export interface PitchTrackerHeaderProps {
  /** Pitches the desk has not answered yet, counted from the member's own rows.
   *  `null` while the tracker is still loading, which hides the line rather
   *  than flashing a zero. */
  activeCount: number | null;
  /** Pitches of theirs that reached print. `null` while loading. */
  publishedCount: number | null;
}

/**
 * The tracker's masthead.
 *
 * The lead counts the member's OWN pitches. It used to interpolate three
 * hardcoded prototype numbers ("7 pitches active · 4 published all-time.
 * Editorial replies within ~ 6 days"), which was harmless while the page was
 * gated to a handful of staff and a lie the moment PRD-125 opened it to every
 * member: someone who has pitched once would have been told they had seven
 * live. The turnaround promise went with them, because nothing in the product
 * measures or guarantees it.
 */
export function PitchTrackerHeader({
  activeCount,
  publishedCount,
}: PitchTrackerHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <div>
        <div className={styles.eyebrow}>
          {t("magazine:pitchTracker.header.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="magazine:pitchTracker.header.title"
            components={{ em: <em /> }}
          />
        </h1>
        {/* Two pluralized fragments rather than one string with two numbers:
            each half needs its own CLDR `count`, and "1 pitches" is the kind of
            thing a member notices. */}
        {activeCount !== null && publishedCount !== null && (
          <p className={styles.lead}>
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
      </div>
      <Button variant="primary" to={routes.submitStory}>
        {t("magazine:pitchTracker.header.newPitchCta")}
      </Button>
    </header>
  );
}
