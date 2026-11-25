import { useId } from "react";
import { FiSlash } from "react-icons/fi";
import { memberRefDisplayName } from "../../../shared/api/refs";
import {
  Button,
  Collapse,
  MemberIdentity,
} from "../../../shared/components/ui";
import type { QuizGameWinnerDTO } from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { profilePath } from "../../connect/connections.data";
import { QuizWinBadgeChip } from "../../quizshow/winBadges/QuizWinBadgeChip";
import { AdminChip, AdminRowActions, adminRowActionClasses } from "../ui";
import { QUIZ_EVENT_DATE_FORMAT } from "./quizEventSetup.model";
import styles from "./AdminQuizEventBadges.module.css";

interface AdminQuizFinishedGameWinnerProps {
  winner: QuizGameWinnerDTO;
  onRevoke: () => void;
  /** The screen name, which takes focus after this winner's revoke. */
  nameRef?: (element: HTMLElement | null) => void;
}

/**
 * One winner of a finished game: their screen name, team and account, and
 * the badges the game gave them with Revoke win. A revoked winner shows the
 * revoke date, reason and who revoked it, and offers no action.
 */
export function AdminQuizFinishedGameWinner({
  winner,
  onRevoke,
  nameRef,
}: AdminQuizFinishedGameWinnerProps) {
  const { t } = useTranslation();
  const screenNameId = useId();

  return (
    <article className={styles.winner}>
      <div className={styles.winnerTop}>
        <div className={styles.winnerName}>
          <p
            id={screenNameId}
            ref={nameRef}
            tabIndex={-1}
            className={styles.screenName}
          >
            {winner.screenName}
          </p>
          {winner.teamName !== null && (
            <p className={styles.quietLine}>
              {t("quizshow:winBadges.admin.finished.team", {
                name: winner.teamName,
              })}
            </p>
          )}
        </div>
        <WinnerAccount winner={winner} />
      </div>

      <Collapse isOpen={!winner.isRevoked}>
        <div className={styles.winnerLive}>
          {winner.wins.length > 0 ? (
            <div className={styles.chips}>
              {winner.wins.map((win) => (
                <QuizWinBadgeChip key={win.winId} badge={win.badge} />
              ))}
            </div>
          ) : (
            <p className={styles.quietLine}>
              {t("quizshow:winBadges.admin.finished.noBadges")}
            </p>
          )}
          <AdminRowActions className={styles.rowActions}>
            <Button
              variant="ghost"
              size="sm"
              className={adminRowActionClasses.danger}
              aria-describedby={screenNameId}
              onClick={onRevoke}
            >
              <FiSlash aria-hidden fill="none" />
              {t("quizshow:winBadges.admin.finished.revoke")}
            </Button>
          </AdminRowActions>
        </div>
      </Collapse>
      <Collapse isOpen={winner.isRevoked}>
        <RevokedDetails winner={winner} />
      </Collapse>
    </article>
  );
}

/** The member account behind the screen name, linked to their profile. */
function WinnerAccount({ winner }: { winner: QuizGameWinnerDTO }) {
  const { t } = useTranslation();
  const { member } = winner;
  if (member === null) {
    return (
      <p className={styles.quietLine}>
        {t("quizshow:winBadges.admin.finished.accountGone")}
      </p>
    );
  }
  const isInactive = member.isInactiveMember === true;
  return (
    <MemberIdentity
      size={32}
      person={{
        slug: member.slug,
        name: memberRefDisplayName(member, t),
        avatarUrl: member.avatarUrl ?? undefined,
        isInactiveMember: isInactive,
      }}
      to={isInactive ? undefined : profilePath(member.slug)}
    />
  );
}

function RevokedDetails({ winner }: { winner: QuizGameWinnerDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const revokedDate =
    winner.revokedAt === null
      ? ""
      : fmt.date(new Date(winner.revokedAt), QUIZ_EVENT_DATE_FORMAT);
  return (
    <div className={styles.revoked}>
      <AdminChip tone="danger">
        {t("quizshow:winBadges.admin.finished.revokedTag")}
      </AdminChip>
      <p className={styles.quietLine}>
        {t("quizshow:winBadges.admin.finished.revokedLine", {
          date: revokedDate,
          reason: winner.revokeReason ?? "",
        })}
      </p>
      {winner.revokedBy !== null && (
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.finished.revokedBy", {
            name: memberRefDisplayName(winner.revokedBy, t),
          })}
        </p>
      )}
    </div>
  );
}
