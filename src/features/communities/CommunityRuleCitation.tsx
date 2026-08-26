import { FiBookOpen } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityBanRuleCitationDTO } from "./api/communityBans.api";
import styles from "./CommunityRuleCitation.module.css";

/**
 * The house rule a community moderation action rests on.
 *
 * Communities write and version their own rules and members agree to a version
 * at the door, yet no moderation action could point at one, so removals and
 * bans carried free text at best and the rules themselves became decoration.
 * This is the citation, rendered wherever the decision is.
 *
 * It shows the rule's WORDING, snapshotted when the moderator acted, rather
 * than a live lookup. `Community.rules` is a plain array and its version moves
 * on every edit, so "rule 3" alone would quietly come to mean something else
 * after one rewrite. When the rules have moved since, the row says so, which
 * is the honest reading of an old decision.
 */
export function CommunityRuleCitation({
  rule,
}: {
  rule: CommunityBanRuleCitationDTO;
}) {
  const { t } = useTranslation();

  return (
    <p className={styles.citation}>
      <FiBookOpen className={styles.citationIcon} aria-hidden />
      <span className={styles.citationBody}>
        <span className={styles.citationLabel}>
          {t("communities:detail.modtools.rule.citation", {
            number: String(rule.index + 1),
          })}
        </span>
        <span>{rule.text}</span>
        {rule.isStale && (
          <span className={styles.citationStale}>
            {t("communities:detail.modtools.rule.stale", {
              number: String(rule.index + 1),
              version: String(rule.version),
            })}
          </span>
        )}
      </span>
    </p>
  );
}
