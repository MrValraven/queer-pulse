import type { ReactNode } from "react";
import { AudienceCta } from "./AudienceCta";
import { AudienceSampleNote } from "./AudienceSampleNote";
import { AudienceSection } from "./AudienceSection";
import type { AudienceId, AudienceMemberAction } from "./audiences.data";
import styles from "./AudienceClosing.module.css";

/** The page's last band: a headline, an optional line, the hero's CTA, and
 *  under it the note that says every example on the page is a sample. */
export function AudienceClosing({
  audience,
  title,
  body,
  memberActions,
}: {
  audience: AudienceId;
  title: ReactNode;
  body?: ReactNode;
  memberActions: readonly AudienceMemberAction[];
}) {
  return (
    <AudienceSection
      sectionId="closing"
      title={title}
      lede={body}
      tone="plum"
      isCentered
      className={styles.closing}
    >
      <AudienceCta
        audience={audience}
        placement="closing"
        memberActions={memberActions}
      />
      <AudienceSampleNote className={styles.note} />
    </AudienceSection>
  );
}
