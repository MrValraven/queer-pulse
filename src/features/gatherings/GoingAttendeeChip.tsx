import { Link } from "react-router-dom";
import { Avatar, KindChip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GoingAttendeesPreview.module.css";

/** One person in the "Who's going" row, whether they came from the
 *  gathering's preview or from a page of the attendees route. */
export interface GoingChipPerson {
  slug: string;
  firstName: string;
  fullName: string;
  initials: string;
  /** Absent when their photo visibility hides it; the initials stand in. */
  avatarUrl?: string;
}

export type GoingChipRole = "host" | "cohost" | null;

/** The data attribute every chip carries. Revealed chips set it to
 *  "revealed", so the expansion can find the first chip of a newly revealed
 *  batch and move focus to it. */
export const GOING_CHIP_ATTRIBUTE = "data-going-chip";
export const REVEALED_CHIP_SELECTOR = `[${GOING_CHIP_ATTRIBUTE}="revealed"]`;

/**
 * A pill linking to the member's profile: avatar, first name, and a small
 * "Host" or "Co-host" tag when they organise this gathering.
 */
export function GoingAttendeeChip({
  person,
  role,
  isRevealed = false,
  className,
}: {
  person: GoingChipPerson;
  role: GoingChipRole;
  /** One of the people "+N more" revealed, after the preview's own. */
  isRevealed?: boolean;
  /** Extra class, e.g. the fade a revealed chip takes. */
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/members/${person.slug}`}
      className={[styles.chip, className].filter(Boolean).join(" ")}
      {...{ [GOING_CHIP_ATTRIBUTE]: isRevealed ? "revealed" : "" }}
    >
      <Avatar
        initials={person.initials}
        tint="plum"
        size={26}
        src={person.avatarUrl}
        name={person.fullName}
      />
      <span>{person.firstName}</span>
      {role === "host" && (
        <KindChip kind="feature" className={styles.roleChip}>
          {t("gatherings:gathering.attendeesPreview.hostTag")}
        </KindChip>
      )}
      {role === "cohost" && (
        <KindChip kind="feature" className={styles.roleChip}>
          {t("gatherings:gathering.attendeesPreview.cohostTag")}
        </KindChip>
      )}
    </Link>
  );
}
