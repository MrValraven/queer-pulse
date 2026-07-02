import { FiHeart, FiShield } from "react-icons/fi";
import { currentUser } from "../../members/data/members";
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
          <b>Nothing you do here is public until the last step.</b> Take your
          time, skip what you're unsure about, and change your mind as often as
          you like. Founding a community is a big, generous thing — there's no
          wrong way to start.
        </p>
      </div>
      <div className={styles.signed}>
        <span className={`${styles.signedAv} ${styles.tintFacePlum}`}>
          {currentUser.initials}
        </span>
        You'll be its first steward, <b>{currentUser.first}</b>.
      </div>
    </div>
  );
}
