import { useId, useState } from "react";
import {
  Button,
  FormField,
  Modal,
  RadioCardGroup,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useReportSubmissionError } from "../../safety/api/reportSubmissionError";
import {
  asReasonCode,
  useReportReasons,
} from "../../safety/api/useReportReasons";
import type { GoTogetherGroupMemberDTO } from "../api/goTogether.types";
import { useReportGoTogetherGroupMember } from "../api/useGoTogetherGroupSafety";
import { ChoiceCheck } from "../card/ChoiceCheck";
import { isGroupNotFoundError } from "./groupActionHelpers";
import styles from "./GoTogetherGroup.module.css";

/** The server's cap on a report's detail (`CreateReportDto.detail`). */
const DETAIL_MAX_LENGTH = 4000;
/** The count appears once the detail comes this close to the cap, so the
 *  field stays quiet for an ordinary report. */
const DETAIL_COUNT_THRESHOLD = DETAIL_MAX_LENGTH - 400;

/**
 * Report one group member to the moderators (PRD-421). It posts to the
 * group's own member route with the opaque `memberRef`, so the member's
 * profile never enters the flow. The reasons are the server's `member` list
 * (`useReportReasons`, which falls back to the local list silently), and the
 * copy is the shared person-report wording. Nothing is preselected, so a
 * hurried reporter never sends the most serious reason unread. A flood cap
 * shows the server's own message exactly as sent.
 */
export function GoTogetherMemberReportDialog({
  groupId,
  member,
  onClose,
}: {
  groupId: string;
  member: GoTogetherGroupMemberDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const reasons = useReportReasons("member");
  const report = useReportGoTogetherGroupMember(groupId);
  const describeReportError = useReportSubmissionError();
  const reasonLabelId = useId();
  const [reasonCode, setReasonCode] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState(false);

  const submit = () => {
    if (!reasonCode || report.isPending) return;
    report.mutate(
      {
        memberRef: member.memberRef,
        body: {
          reasonCode: asReasonCode(reasonCode),
          detail: detail.trim() || undefined,
        },
      },
      // The shared mutation error handler already logs a failure once, so
      // the dialog only shows it.
      { onSuccess: () => setIsDone(true) },
    );
  };

  if (isDone) {
    return (
      // Its own key remounts the dialog, so focus lands on the success view
      // once the form (and the focused Send button) is gone.
      <Modal
        key="done"
        title={
          <Translation
            i18nKey="safety:reportPerson.success.title"
            components={{ em: <em /> }}
          />
        }
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {t("safety:reportPerson.success.doneCta")}
          </Button>
        }
      >
        <p className={styles.quietNote}>
          {t("safety:reportPerson.success.body")}
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      key="form"
      title={t("goTogether:group.memberReport.title", {
        name: member.firstName,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:reportPerson.form.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={!reasonCode || report.isPending}
          >
            {report.isPending
              ? t("safety:reportPerson.form.submitting")
              : t("safety:reportPerson.form.submitCta")}
          </Button>
        </>
      }
    >
      <div className={styles.reportForm}>
        {/* The lead scrolls with the form, so a raised phone keyboard
            leaves the head short and the detail box room to type in. */}
        <p className={styles.quietNote}>{t("safety:reportPerson.form.lead")}</p>
        <p id={reasonLabelId} className={styles.reportLabel}>
          {t("safety:reportPerson.form.reasonLabel")}
        </p>
        <RadioCardGroup
          value={reasonCode}
          onChange={setReasonCode}
          ariaLabel={t("safety:reportPerson.form.reasonLabel")}
          ariaLabelledBy={reasonLabelId}
          className={styles.reportReasons}
          optionClassName={styles.reportReason}
          checkedClassName={styles.reportReasonChecked}
          options={reasons.map((option) => ({
            id: option.code,
            render: (
              <>
                {option.label}
                <ChoiceCheck isChecked={reasonCode === option.code} />
              </>
            ),
          }))}
        />
        <FormField
          label={t("safety:reportPerson.form.detailLabel")}
          labelAside={
            detail.length >= DETAIL_COUNT_THRESHOLD
              ? `${detail.length}/${DETAIL_MAX_LENGTH}`
              : undefined
          }
        >
          <textarea
            value={detail}
            maxLength={DETAIL_MAX_LENGTH}
            placeholder={t("safety:reportPerson.form.detailPlaceholder")}
            onChange={(event) => setDetail(event.target.value)}
          />
        </FormField>
        {report.isError && (
          <p className={styles.errorNote} role="alert">
            {isGroupNotFoundError(report.error)
              ? t("goTogether:group.member.gone")
              : describeReportError(
                  report.error,
                  t("safety:reportPerson.error"),
                )}
          </p>
        )}
      </div>
    </Modal>
  );
}
