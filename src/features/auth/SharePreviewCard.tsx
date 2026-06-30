import styles from "./InvitePage.module.css";

interface SharePreviewCardProps {
  senderName: string;
  description: string;
  url: string;
}

/**
 * Pixel-accurate mock of how the invite link unfurls when pasted into a
 * messaging app — a `summary_large_image` card (hero + title + description +
 * domain). Mirrors the static Open Graph tags in index.html.
 */
export function SharePreviewCard({
  senderName,
  description,
  url,
}: SharePreviewCardProps) {
  return (
    <div className={styles.previewWrap}>
      <div className={styles.previewHero} aria-hidden>
        <div className={styles.previewHeroBrand}>
          Queer<em>Pulse</em>
        </div>
        <div className={styles.previewHeroTitle}>
          You belong <em>here</em>
        </div>
        <div className={styles.previewHeroExplainer}>
          Where queer Lisbon gathers — no ads, no algorithm.
        </div>
        <div className={styles.previewHeroSub}>Invite-only · 247 members</div>
      </div>
      <div className={styles.previewMeta}>
        <div className={styles.previewDomain}>{url.split("/")[0]}</div>
        <div className={styles.previewTitle}>
          {senderName} invited you to QueerPulse
        </div>
        <div className={styles.previewDesc}>{description}</div>
      </div>
    </div>
  );
}
