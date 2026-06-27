import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import type { Barter } from "./barter.data";
import styles from "./BarterPage.module.css";

/** Post-a-swap strip: a short offer/want form that prepends a live post, with an animated success state. */
export function BarterPostStrip({ onPost }: { onPost: (barter: Barter) => void }) {
  const [offerText, setOfferText] = useState("");
  const [wantText, setWantText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canPost = offerText.trim().length > 0 && wantText.trim().length > 0;

  const postSwap = () => {
    if (!canPost) return;
    const offer = offerText.trim();
    const want = wantText.trim();
    onPost({
      id: `posted-${Date.now()}`,
      name: "You",
      initials: "Y",
      tint: "coral",
      hood: "Your post",
      cat: "all",
      mode: "both",
      offer,
      want,
      offerDetail: "Posted just now — message to start the exchange.",
      wantDetail: "Posted just now — message to start the exchange.",
      tags: ["new", "your post"],
      days: 1,
    });
    setSubmitted(true);
  };

  const postAnother = () => {
    setOfferText("");
    setWantText("");
    setSubmitted(false);
  };

  return (
    <Reveal className={styles.postStrip}>
      {submitted ? (
        <div className={`${styles.psSuccess} ${styles.screenIn}`} key="success">
          <div className={styles.psSuccessIcon}>
            <FiCheck size={24} aria-hidden />
          </div>
          <h3>
            It's <em>on the table.</em>
          </h3>
          <p>
            Your swap is live at the top of the board. We'll let you know when
            someone proposes an exchange.
          </p>
          <Button variant="ghost-dark" onClick={postAnother}>
            Post another →
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h3>
              Put something <em>on the table.</em>
            </h3>
            <p>
              Every exchange starts with a post. Tell the community what you can
              offer and what you're hoping for in return.
            </p>
          </div>
          <form
            className={styles.psForm}
            onSubmit={(e) => {
              e.preventDefault();
              postSwap();
            }}
          >
            <input
              className={styles.psInput}
              placeholder="I can offer — e.g. Portuguese lessons, logo design…"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
            />
            <input
              className={styles.psInput}
              placeholder="I'm looking for — e.g. tax advice, moving help…"
              value={wantText}
              onChange={(e) => setWantText(e.target.value)}
            />
            <Button type="submit" disabled={!canPost}>
              Post to the exchange →
            </Button>
          </form>
        </>
      )}
    </Reveal>
  );
}
