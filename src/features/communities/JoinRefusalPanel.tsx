import { FiClock, FiKey, FiSlash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRefusal } from "./api/communityJoin.api";
import styles from "./JoinModal.module.css";

/**
 * The three refusals that are an answer rather than a fault: this community is
 * closed to you (`BANNED_FROM_COMMUNITY`), you asked recently and were asked to
 * wait (`REAPPLY_TOO_SOON`), and this one needs an invitation you do not have
 * (`invite_required`, PRD-141).
 *
 * All three are worded plainly and carry no reason, no reviewer's name and no
 * judgement. The backend deliberately sends none of that, and the applicant
 * reading this is a person being turned away: the copy's job is to be clear and
 * to leave their dignity intact. The wait case shows the date they may try
 * again, formatted through `useFormat` so it reads correctly in both languages.
 *
 * The invitation case arrives differently from the other two. It is a
 * successful 201 rather than an error, read off the resolved join result by
 * `isInviteRequiredResult`, and it is here rather than in an error toast for
 * exactly the reason the other two are: it describes the community, not a
 * mistake the reader made.
 */
export function JoinRefusalPanel({
  refusal,
  onClose,
}: {
  refusal: Extract<
    JoinRefusal,
    { kind: "banned" | "reapplyTooSoon" | "inviteRequired" }
  >;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isBanned = refusal.kind === "banned";
  const isInviteRequired = refusal.kind === "inviteRequired";
  const reapplyDate =
    refusal.kind === "reapplyTooSoon" && refusal.reapplyAfter
      ? fmt.date(new Date(refusal.reapplyAfter))
      : null;

  return (
    <div>
      <div className={styles.refusalIcon}>
        {isInviteRequired ? (
          <FiKey aria-hidden />
        ) : isBanned ? (
          <FiSlash aria-hidden />
        ) : (
          <FiClock aria-hidden />
        )}
      </div>
      <div className={styles.title}>
        {isInviteRequired
          ? t("communities:detail.join.inviteOnly")
          : isBanned
            ? t("communities:join.refusal.banned.title")
            : t("communities:join.refusal.reapply.title")}
      </div>
      <p className={styles.desc}>
        {isInviteRequired
          ? t("communities:detail.join.inviteOnlyHint")
          : isBanned
            ? t("communities:join.refusal.banned.body")
            : reapplyDate
              ? t("communities:join.refusal.reapply.body", {
                  date: reapplyDate,
                })
              : t("communities:join.refusal.reapply.bodyNoDate")}
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("communities:join.refusal.closeCta")}
        </Button>
      </div>
    </div>
  );
}
