import type { ReactNode } from "react";
import { Translation } from "../../../../shared/i18n/Translation";
import { AudienceCta } from "./AudienceCta";
import type { AudienceId, AudienceMemberAction } from "./audiences.data";
import styles from "./AudienceHeroCopy.module.css";

/**
 * The text half of an audience hero: the eyebrow naming the audience, the
 * page's only `<h1>` (its catalog string may carry an `<em>`), the lede and
 * the hero CTA. Each page composes its own collage beside it.
 */
export function AudienceHeroCopy({
  audience,
  eyebrow,
  titleKey,
  lede,
  memberActions,
  className,
}: {
  audience: AudienceId;
  eyebrow: string;
  titleKey: string;
  lede: ReactNode;
  memberActions: readonly AudienceMemberAction[];
  className?: string;
}) {
  return (
    <div className={[styles.copy, className].filter(Boolean).join(" ")}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h1>
      <p className={styles.lede}>{lede}</p>
      <AudienceCta
        audience={audience}
        placement="hero"
        memberActions={memberActions}
      />
    </div>
  );
}
