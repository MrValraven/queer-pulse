import { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHomepageGatherings } from "../api/useHomepageGatherings";
import type { HomepageGatheringRow } from "./liveGatherings.adapters";
import { MembersExplainerModal } from "./MembersExplainerModal";
import styles from "./Gatherings.module.css";
import liveStyles from "./LiveGatherings.module.css";

/**
 * Live-mode counterpart to `Gatherings`: real gatherings in the same row
 * layout the demo teaser uses. A signed-in member sees the next ones on the
 * board; a signed-out visitor sees the ones the admin team curated (see
 * `useHomepageGatherings`). Every value on a row comes off the event itself,
 * so no fabricated dinner can reach a live visitor.
 *
 * Renders nothing while loading, and nothing when the source is empty or
 * unavailable: an absent section beats an empty shell.
 */
export function LiveGatherings() {
  const { rows, isLoading, isError } = useHomepageGatherings();

  // A failed fetch renders nothing, like an empty slice does. This is the
  // marketing homepage: a visitor has no stake in this teaser row and cannot
  // act on a failure here, and an alert panel between the curated plum and
  // cream sections would cost more than the row is worth. The real board is a
  // click away in the nav. The flag is read explicitly so the choice is a
  // decision rather than an accident.
  if (isLoading || isError || rows.length === 0) return null;

  return <LiveGatheringsView rows={rows} />;
}

/** The section itself, fed already-adapted rows. Exported so the
 *  `/admin/landing` preview renders the exact markup a visitor gets.
 *
 *  A row with a path is a link to the gathering. A row without one (a curated
 *  row shown to a signed-out visitor, whose click the gated detail page would
 *  bounce to sign-in) is a button that opens the membership explainer, the
 *  same answer the "Explore members" call to action gives. */
export function LiveGatheringsView({ rows }: { rows: HomepageGatheringRow[] }) {
  const { t } = useTranslation();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  return (
    <section className={styles.gather} id="gather">
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal>
            <SectionHead
              dark
              title={
                <Translation
                  i18nKey="homepage:gatherings.title"
                  components={{ em: <em /> }}
                />
              }
              subtitle={t("homepage:gatherings.subtitle")}
            />
          </Reveal>

          <div className={styles.list}>
            {rows.map((row, index) => (
              <Reveal key={row.key} delay={index * 50}>
                {row.to === null ? (
                  <button
                    type="button"
                    className={[styles.row, liveStyles.rowButton].join(" ")}
                    aria-haspopup="dialog"
                    onClick={() => setIsExplainerOpen(true)}
                  >
                    <GatheringRowBody row={row} isPhrasingOnly />
                  </button>
                ) : (
                  <Link to={row.to} className={styles.row}>
                    <GatheringRowBody row={row} />
                  </Link>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      {isExplainerOpen && (
        <MembersExplainerModal
          context="gathering"
          onClose={() => setIsExplainerOpen(false)}
        />
      )}
    </section>
  );
}

/** One row's content. Inside a `<button>` only phrasing content is valid, so
 *  `isPhrasingOnly` swaps every block wrapper and the heading for a span made
 *  block-level by `LiveGatherings.module.css`; inside a link the row keeps its
 *  `<h3>` heading. */
function GatheringRowBody({
  row,
  isPhrasingOnly = false,
}: {
  row: HomepageGatheringRow;
  isPhrasingOnly?: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const Block = isPhrasingOnly ? "span" : "div";
  const blockClass = (className: string | undefined) =>
    isPhrasingOnly ? [className, liveStyles.block].join(" ") : className;

  return (
    <>
      <Block className={styles.date}>
        <span className={styles.day}>
          {format.date(row.date, { day: "numeric" })}
        </span>
        <span className={styles.month}>
          {format.date(row.date, { month: "short" })}
        </span>
      </Block>
      <Block>
        <Block className={blockClass(styles.type)}>{row.kicker}</Block>
        {isPhrasingOnly ? (
          <span className={blockClass(styles.title)}>{row.title}</span>
        ) : (
          <h3 className={styles.title}>{row.title}</h3>
        )}
        <Block className={styles.meta}>
          {row.place && <span>{row.place}</span>}
          {row.place && <span className={styles.dot} aria-hidden />}
          <span>{format.time(row.date)}</span>
        </Block>
      </Block>
      <Block className={styles.right}>
        {typeof row.attendeeCount === "number" && (
          <Block className={styles.spots}>
            <b>{format.number(row.attendeeCount)}</b>{" "}
            {t("homepage:gatherings.spots.going")}
          </Block>
        )}
        <span className={styles.cta}>
          {t(
            isPhrasingOnly
              ? "homepage:liveGatherings.joinCta"
              : "homepage:gatherings.cta.seeDetails",
          )}
        </span>
      </Block>
    </>
  );
}
