import { FiGrid } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityRulesList } from "./CommunityRulesList";
import type { CommunityInheritedRules } from "./api/communities.api";
import styles from "./CommunityGuidelinesNote.module.css";

/** Which mod-tools queue is reading the note, and so which heading it needs. */
export type CommunityGuidelinesVariant = "requests" | "reports";

const HEADING_KEY: Record<CommunityGuidelinesVariant, string> = {
  requests: "communities:detail.modtools.guidelines.requests.head",
  reports: "communities:detail.modtools.guidelines.reports.head",
};

/**
 * The community's own shared values, shown above its mod-tools queues.
 *
 * `ModerationStanceNote` covers the platform's PLATFORM-wide stance, and stays
 * on the staff queues in `src/features/admin`. A community mod judging a
 * report or an application needs the rules THIS community actually wrote, so
 * this note reads `LivingCommunity.rules` (and, on a space, `inheritedRules`)
 * directly. Same visual treatment as the platform note (accent inline-start
 * border, paper background) but its own CSS module: the two notes are read by
 * different audiences and should not drift into sharing one stylesheet by
 * accident.
 *
 * A space inherits its parent's rules whole, then layers its own on top, so
 * both lists render here in that order, exactly as the About tab already
 * shows them (`AboutResourcesTab`). A community that has written no rules at
 * all, including a space with nothing inherited, gets one line pointing at
 * where an owner sets them rather than silently showing nothing.
 */
export function CommunityGuidelinesNote({
  communityName,
  rules,
  inheritedRules,
  parentName,
  variant,
}: {
  communityName: string;
  rules: string[];
  inheritedRules: CommunityInheritedRules | null;
  parentName: string | null;
  variant: CommunityGuidelinesVariant;
}) {
  const { t } = useTranslation();
  const headingId = `community-guidelines-${variant}`;
  const isSpace = inheritedRules !== null;
  const hasInheritedRules = isSpace && inheritedRules.rules.length > 0;
  const hasOwnRules = rules.length > 0;
  const hasAnyRules = isSpace ? hasInheritedRules || hasOwnRules : hasOwnRules;

  return (
    <aside className={styles.note} aria-labelledby={headingId}>
      <div className={styles.head} id={headingId}>
        <FiGrid className={styles.icon} aria-hidden />
        {t(HEADING_KEY[variant], { name: communityName })}
      </div>
      {!hasAnyRules ? (
        <p className={styles.empty}>
          {t("communities:detail.modtools.guidelines.empty", {
            name: communityName,
          })}
        </p>
      ) : isSpace ? (
        <>
          {hasInheritedRules && (
            <>
              <div className={styles.subLabel}>
                {t("communities:spaces.rules.fromParent", {
                  name: parentName ?? "",
                })}
              </div>
              <CommunityRulesList rules={inheritedRules.rules} compact />
            </>
          )}
          {hasOwnRules && (
            <>
              <div className={styles.subLabel}>
                {t("communities:spaces.rules.spaceAdds")}
              </div>
              <CommunityRulesList rules={rules} compact />
            </>
          )}
        </>
      ) : (
        <CommunityRulesList rules={rules} compact />
      )}
    </aside>
  );
}
