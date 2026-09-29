import { FiLock } from "react-icons/fi";
import {
  MemberIdentity,
  RadioCardGroup,
  type RadioCardOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  GoTogetherFeedbackMemberDTO,
  MeetAgainVerdict,
} from "../api/goTogether.types";
import { FeedbackOptionLabel } from "./FeedbackOptionLabel";
import styles from "./GoTogetherFeedback.module.css";

const VERDICTS: MeetAgainVerdict[] = ["yes", "maybe", "no"];

interface MeetAgainRowProps {
  member: GoTogetherFeedbackMemberDTO;
  /** The verdict to show selected: the viewer's edit this visit, or the
   *  already-saved one, or "" when neither exists yet. */
  value: MeetAgainVerdict | "";
  onChange: (slug: string, verdict: MeetAgainVerdict) => void;
}

/**
 * One other group member: their identity, then a Yes / Maybe / Not for me
 * radio group. Picking "Not for me" reveals a small private note right under
 * it, so the choice feels safe to make: nobody finds out, and it simply keeps
 * the two of them apart from now on.
 *
 * Privacy: shows only the first name, pronouns and (when the API sent one)
 * the avatar. No last name, no percentage, no lens.
 */
export function MeetAgainRow({ member, value, onChange }: MeetAgainRowProps) {
  const { t } = useTranslation();

  const options: RadioCardOption<MeetAgainVerdict>[] = VERDICTS.map(
    (verdict) => ({
      id: verdict,
      render: (
        <FeedbackOptionLabel
          label={t(`goTogether:feedback.option.${verdict}`)}
          isSelected={verdict === value}
        />
      ),
    }),
  );

  return (
    <div className={styles.row}>
      <MemberIdentity
        person={{
          slug: member.slug,
          name: member.firstName,
          avatarUrl: member.avatarUrl ?? undefined,
        }}
        secondary={member.pronouns}
        showStaffBadge={false}
      />
      <RadioCardGroup<MeetAgainVerdict>
        value={value}
        onChange={(verdict) => onChange(member.slug, verdict)}
        options={options}
        ariaLabel={t("goTogether:feedback.row.ariaLabel", {
          name: member.firstName,
        })}
        columns={3}
        className={styles.rowOptions}
        optionClassName={styles.rowOption}
        checkedClassName={styles.rowOptionOn}
      />
      {value === "no" && (
        <p className={styles.privateNote}>
          <FiLock aria-hidden />
          {t("goTogether:feedback.privateNote")}
        </p>
      )}
    </div>
  );
}
