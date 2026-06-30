import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { memberName } from "../members/data/members";
import { routes } from "../../app/routeMap";
import styles from "./MagazinePage.module.css";

const COVER_IMG =
  "https://images.unsplash.com/photo-1601399470081-29ab3942fd8b?q=80&w=1600&auto=format&fit=crop";

export function MagazineCover() {
  return (
    <div className={styles.coverRebalanced}>
      <div className={styles.csImage}>
        <ImageSlot
          tint="plum"
          width="100%"
          height="100%"
          radius={0}
          src={COVER_IMG}
          alt="Cover portrait"
          placeholder="Cover portrait — full bleed, dramatic lighting"
          style={{ position: "absolute", inset: 0 }}
        />
        <div className={styles.csImageLabel}>Cover · June 2026</div>
      </div>
      <div className={styles.csText}>
        <div className={styles.csTextInner}>
          <div className={styles.csKicker}>Cover story · Feature</div>
          <h1 className={styles.csTitle}>
            The city changed.
            <br />
            <em>Did we?</em>
          </h1>
          <div className={styles.csByline}>
            By {memberName("sofia")} · Photography by {memberName("andre")}
          </div>
          <p className={styles.csExcerpt}>
            Lisbon's queer community has spent a decade finding itself. The rent
            has tripled. The bars have closed and reopened and closed again.
            What survived the decade, and what did we lose in the process?
          </p>
          <Link
            className={styles.csRead}
            to={`${routes.article}?id=city-changed`}
          >
            Read the full feature <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
