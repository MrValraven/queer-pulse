import type { ReactNode } from "react";
import {
  resolveCommunityFlairTint,
  type CommunityFlairTint,
} from "./communityBadges.catalog";
import styles from "./CommunityFlair.module.css";

const FLAIR_RING_CLASS: Record<CommunityFlairTint, string> = {
  jade: styles.ringJade!,
  accent: styles.ringAccent!,
  plum: styles.ringPlum!,
  rose: styles.ringRose!,
  amber: styles.ringAmber!,
  violet: styles.ringViolet!,
};

export interface CommunityFlairRingProps {
  tint: string | null | undefined;
  children: ReactNode;
}

/**
 * A 2px ring in the badge's ink around a round avatar. It is decoration: the
 * chip beside the name carries the badge for screen readers. Without a tint
 * the children sit in a plain inline wrapper, so a member with no worn badge
 * keeps the same layout.
 */
export function CommunityFlairRing({
  tint,
  children,
}: CommunityFlairRingProps) {
  if (!tint) return <span className={styles.plain}>{children}</span>;
  const ringClass = FLAIR_RING_CLASS[resolveCommunityFlairTint(tint)];
  return <span className={`${styles.ring} ${ringClass}`}>{children}</span>;
}
