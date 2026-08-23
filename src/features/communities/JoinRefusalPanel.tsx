import { FiClock, FiSlash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRefusal } from "./api/communityJoin.api";
import styles from "./JoinModal.module.css";

/**
 * The two refusals that are an answer rather than a fault: this community is
 * closed to you (`BANNED_FROM_COMMUNITY`), and you asked recently and were
 * asked to wait (`REAPPLY_TOO_SOON`).
 *
 * Both are worded plainly and carry no reason, no reviewer's name and no
 * judgement. The backend deliberately sends neither, and the applicant reading
 * this is a person being turned away: the copy's job is to be clear and to
 * leave their dignity intact. The wait case shows the date they may try again,
 * formatted through `useFormat` so it reads correctly in both languages.
 */
export function JoinRefusalPanel({
  refusal,
  onClose,
}: {
  refusal: Extract<JoinRefusal, { kind: "banned" | "reapplyTooSoon" }>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isBanned = refusal.kind === "banned";
  const reapplyDate =
    refusal.kind === "reapplyTooSoon" && refusal.reapplyAfter
      ? fmt.date(new Date(refusal.reapplyAfter))
      : null;

  return (
    <div>
      <div className={styles.refusalIcon}>
        {isBanned ? <FiSlash aria-hidden /> : <FiClock aria-hidden />}
      </div>
      <div className={styles.title}>
        {isBanned
          ? t("communities:join.refusal.banned.title")
          : t("communities:join.refusal.reapply.title")}
      </div>
      <p className={styles.desc}>
        {isBanned
          ? t("communities:join.refusal.banned.body")
          : reapplyDate
            ? t("communities:join.refusal.reapply.body", { date: reapplyDate })
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
