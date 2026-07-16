import { FiHeart, FiShield } from "react-icons/fi";
import { currentUser } from "../../members/data/members";
import { Translation } from "../../../shared/i18n/Translation";
import styles from "./StartCommunityPage.module.css";

/** Chapter 0 — the reassuring opening, before any fields. */
export function StepOpening() {
  return (
    <div>
      <div className={styles.crest}>
        <FiHeart size={30} aria-hidden />
      </div>
      <div className={styles.reassure}>
        <FiShield size={20} aria-hidden />
        <p>
          <Translation
            i18nKey="communities:start.opening.reassure"
            components={{ strong: <b /> }}
          />
        </p>
      </div>
      <div className={styles.signed}>
        <span className={`${styles.signedAv} ${styles.tintFacePlum}`}>
          {currentUser.initials}
        </span>
        <Translation
          i18nKey="communities:start.opening.signed"
          components={{ strong: <b /> }}
          values={{ name: currentUser.first }}
        />
      </div>
    </div>
  );
}
