import type { AvatarTint } from "../../../../shared/components/ui";
import styles from "./rail.module.css";

export interface RailAvatarProps {
  initials: string;
  tint: AvatarTint;
}

/**
 * The rail's initials disc. The shared Avatar renders nested `<div>`s, which a
 * `<button>` may not contain, and the Team rows are buttons; this one is a
 * single `<span>` with the same tints, so it sits inside any row. Decorative:
 * the person's name always sits beside it.
 */
export function RailAvatar({ initials, tint }: RailAvatarProps) {
  return (
    <span className={styles.avatar} data-tint={tint} aria-hidden="true">
      {initials}
    </span>
  );
}
