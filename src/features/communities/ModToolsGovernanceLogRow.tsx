import { FiShield } from "react-icons/fi";
import { Badge, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import {
  isCommunityGovernanceLogAction,
  type CommunityGovernanceLogEntryDTO,
} from "./api/communityGovernanceLog.api";
import {
  communityGovernanceActionTone,
  humanizeGovernanceKey,
} from "./communityGovernanceLog.data";
import { ModToolsGovernanceLogDetails } from "./ModToolsGovernanceLogDetails";
import styles from "./ModToolsGovernanceLog.module.css";

/** A member ref's display name, or the placeholder for an account that has
 *  since been erased. The FKs behind this trail are `ON DELETE SET NULL`
 *  precisely so an entry outlives the people in it. */
function refName(
  ref: CommunityGovernanceLogEntryDTO["actor"],
  fallback: string,
): string {
  if (!ref) return fallback;
  return `${ref.firstName} ${ref.lastName}`.trim() || fallback;
}

/** The chip label for an action, humanized when this client has no copy for a
 *  value the backend added after it shipped. */
function actionLabel(action: string, t: TFunction): string {
  return isCommunityGovernanceLogAction(action)
    ? t(`communities:detail.modtools.history.action.${action}`)
    : humanizeGovernanceKey(action);
}

/**
 * The one-sentence account of what happened. A removal splits in two on
 * `isSelfRemoval`, because "they left" and "a moderator removed them" are
 * different events and the trail exists to tell them apart. An action with no
 * copy of its own still gets a sentence, built from the humanized action name.
 */
function summaryLine(
  entry: CommunityGovernanceLogEntryDTO,
  targetName: string,
  t: TFunction,
): string {
  if (!isCommunityGovernanceLogAction(entry.action)) {
    return t(
      entry.target
        ? "communities:detail.modtools.history.summary.unknownWithTarget"
        : "communities:detail.modtools.history.summary.unknown",
      { action: humanizeGovernanceKey(entry.action), name: targetName },
    );
  }
  if (entry.action === "member_removed" && entry.details.isSelfRemoval) {
    return t("communities:detail.modtools.history.summary.member_left", {
      name: targetName,
    });
  }
  return t(`communities:detail.modtools.history.summary.${entry.action}`, {
    name: targetName,
  });
}

/**
 * One governance action: what happened, to whom, with the detail the server
 * recorded, then who did it and when.
 *
 * A platform action is labelled as one. The server sends it with no actor and
 * no details on purpose, and this community's staff are entitled to know the
 * change came from QueerPulse rather than from one of them. Rendering it as an
 * unattributed row would leave three moderators asking each other which of
 * them did it.
 *
 * Everywhere else a null actor is genuinely ambiguous: the action was
 * automatic, or the person who took it has erased their account since, and the
 * API cannot tell those apart. The byline says so plainly instead of inventing
 * an attribution.
 */
export function ModToolsGovernanceLogRow({
  entry,
  delay = 0,
}: {
  entry: CommunityGovernanceLogEntryDTO;
  /** Stagger for the entrance reveal, in ms. */
  delay?: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const formerMember = t("communities:detail.modtools.history.formerMember");
  const targetName = refName(entry.target, formerMember);
  const actorName = entry.actor ? refName(entry.actor, formerMember) : null;
  const createdAt = new Date(entry.createdAt);

  return (
    <FadeIn as="li" className={styles.entry} delay={delay}>
      <div className={styles.entryHead}>
        <Badge tone={communityGovernanceActionTone(entry.action)}>
          {actionLabel(entry.action, t)}
        </Badge>
        {entry.isPlatformAction && (
          <Badge tone="violet">
            <FiShield aria-hidden />{" "}
            {t("communities:detail.modtools.history.platform.label")}
          </Badge>
        )}
      </div>

      <p className={styles.summary}>{summaryLine(entry, targetName, t)}</p>

      {entry.isPlatformAction && (
        <p className={styles.platformNote}>
          {t("communities:detail.modtools.history.platform.note")}
        </p>
      )}

      <ModToolsGovernanceLogDetails details={entry.details} />

      <p className={styles.byline}>
        <span>
          {entry.isPlatformAction
            ? t("communities:detail.modtools.history.byPlatform")
            : actorName
              ? t("communities:detail.modtools.history.byLine", {
                  name: actorName,
                })
              : t("communities:detail.modtools.history.unattributed")}
        </span>{" "}
        <time dateTime={entry.createdAt}>
          {t("communities:detail.modtools.history.onDate", {
            date: fmt.date(createdAt),
            time: fmt.time(createdAt),
          })}
        </time>
      </p>
    </FadeIn>
  );
}
