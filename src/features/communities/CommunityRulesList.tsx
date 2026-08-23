import { RULE_PRESET_KEYS } from "./startCommunity/startCommunity.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunityRulesList.module.css";

/**
 * A community's house rules, numbered, in the reader's language.
 *
 * Preset rules are stored as i18n KEYS (a stable, language-independent id);
 * custom ones are text a member wrote and are rendered verbatim. Same test the
 * About tab and the founding wizard use, so the three surfaces can never drift
 * into showing a raw key to one reader and a sentence to another.
 */
export function CommunityRulesList({
  rules,
  compact = false,
}: {
  rules: string[];
  /** Tighter spacing for the in-page prompt, where the list sits inside a card
   *  rather than filling a modal step. */
  compact?: boolean;
}) {
  const { t } = useTranslation();
  if (rules.length === 0) return null;
  return (
    <ol
      className={[styles.rules, compact && styles.compact]
        .filter(Boolean)
        .join(" ")}
    >
      {rules.map((rule, index) => (
        <li className={styles.rule} key={rule}>
          <span className={styles.num}>{index + 1}</span>
          <span>{RULE_PRESET_KEYS.includes(rule) ? t(rule) : rule}</span>
        </li>
      ))}
    </ol>
  );
}
