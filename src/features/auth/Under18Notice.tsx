import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import styles from "./Under18Notice.module.css";

interface Under18NoticeProps {
  /** Return to the form/step — the block is a pause, never a dead end. */
  onBack: () => void;
  backLabel?: string;
}

/**
 * The humane under-18 block: a supportive plum panel (not an error page, not an
 * accusation) shown when someone tells us they're not 18 yet. It explains that
 * QueerPulse is 18+ *today*, that this isn't a judgement, points to queer
 * resources that are for them right now, and leaves the door open to come back.
 */
export function Under18Notice({
  onBack,
  backLabel = "Back",
}: Under18NoticeProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.icon}>
        <FiHeart size={26} color="var(--accent)" aria-hidden />
      </div>
      <h2 className={styles.title}>
        We'll be here <em>when you're ready</em>
      </h2>
      <p className={styles.body}>
        QueerPulse is an 18+ community for now, so we can't set you up with an
        account just yet — and that's not a judgement on you. You belong in
        queer community; this particular room just isn't open to under-18s
        today. Come back when you turn 18 and there'll be a place for you.
      </p>
      <p className={styles.body}>
        In the meantime, there's plenty here that's for you right now:
      </p>
      <ul className={styles.links}>
        <li>
          <Link to={routes.queer101}>
            Queer 101 — the basics, no gatekeeping
          </Link>
        </li>
        <li>
          <Link to={routes.comingOut}>Coming out, at your own pace</Link>
        </li>
        <li>
          <Link to={routes.resources}>Community resources &amp; support</Link>
        </li>
        <li>
          <Link to={`${routes.terms}#eligibility`}>
            Why we're 18+ (our Terms)
          </Link>
        </li>
      </ul>
      <div className={styles.actions}>
        <Button variant="ghost-dark" onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
