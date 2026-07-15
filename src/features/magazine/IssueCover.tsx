import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ISSUE_COVER_IMG } from "./issue.data";
import styles from "./IssuePage.module.css";

export interface IssueCoverProps {
  /** Overrides — sourced live from GET /magazine/issues/:number; the
   *  prototype's hardcoded copy (features/pages/contributors counts, the
   *  editor's letter) has no backend analogue and always stays as written. */
  number?: string;
  title?: ReactNode;
  dek?: ReactNode;
  publishedLabel?: string;
}

export function IssueCover({
  number = "09",
  title = (
    <>
      On <em>health.</em>
    </>
  ),
  dek = (
    <>
      Twelve pieces about how we keep our bodies, our minds, and each other.
      Reported, debated, illustrated. <em>Sometimes funny.</em>
    </>
  ),
  publishedLabel = "6 Jun 2026",
}: IssueCoverProps) {
  return (
    <>
      <div className={styles.cover}>
        <div className={styles.coverInner}>
          <Link to={routes.magazine} className={styles.back}>
            ← All issues
          </Link>
          <div className={styles.spread}>
            <div>
              <div className={styles.metaRow}>
                <span className={styles.num}>
                  Issue <em>{number}</em>
                </span>
                <span className={styles.numL}>Spring · 2026</span>
                <span className={styles.pill}>Current</span>
              </div>
              <h1 className={styles.h1}>{title}</h1>
              <p className={styles.dek}>{dek}</p>
              <div className={styles.stats}>
                <span>
                  <b>12</b> features
                </span>
                <span>
                  <b>84</b> pages
                </span>
                <span>
                  <b>8</b> contributors
                </span>
                <span>
                  Published <b>{publishedLabel}</b>
                </span>
              </div>
            </div>
            <ImageSlot
              tint="coral"
              radius={18}
              src={ISSUE_COVER_IMG}
              alt='Issue 09 cover · "On Health"'
              placeholder='Issue 09 cover · "On Health"'
              style={{ aspectRatio: "3/4", height: "auto" }}
            />
          </div>
        </div>
      </div>

      <section className={styles.letter}>
        <div className={styles.letterInner}>
          <div className={styles.letterEyebrow}>Editor's letter</div>
          <h2>
            The body is <em>a political object.</em> So is the appointment.
          </h2>
          <p>
            We started reporting this issue because half of the people in our
            community say they're putting off a doctor's visit. Not because they
            don't have insurance. Because they're tired of explaining themselves
            at a desk.
          </p>
          <p>
            Twelve writers, three months, fourteen interviews, two clinics
            visited at 2am. The result is an issue we could only have made
            together — Sara Pinheiro's cover piece on the trans health protocol,
            an interview with the woman who fixed an entire clinic by being{" "}
            <em>kind on purpose</em>.
          </p>
          <p>Read it in any order. Lend it to your GP.</p>
          <div className={styles.sign}>
            <Avatar initials="MR" tint="coral" size={42} />
            <div>
              <div className={styles.signName}>Marta Reis</div>
              <div className={styles.signRole}>
                Editor in chief · QueerPulse Magazine
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
