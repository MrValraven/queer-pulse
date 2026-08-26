import { useId } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityRuleOptionDTO } from "./api/communityBans.api";
import styles from "./CommunityRuleCitation.module.css";

/** The sentinel value for "cite nothing", since a `Select` value is a string. */
export const NO_RULE_VALUE = "none";

/**
 * Pick which of a community's own house rules a moderation action rests on.
 *
 * Citing is optional and stays optional: some conduct no rule anticipated, and
 * a community with no rules has nothing to cite. When there are no rules the
 * picker renders a line saying so, so a moderator is never shown an empty
 * control they cannot use.
 *
 * The value handed back is the rule's 0-based index into the community's
 * current rules. The server turns that into the stored snapshot (index,
 * version and the rule's exact wording), so what gets recorded survives a
 * later rewrite of the rules.
 */
export function CommunityRulePicker({
  rules,
  value,
  onChange,
  disabled,
}: {
  rules: CommunityRuleOptionDTO[];
  /** The chosen rule index, or null for no citation. */
  value: number | null;
  onChange: (ruleIndex: number | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const legendId = useId();

  if (rules.length === 0) {
    return (
      <div className={styles.editorGroup}>
        <span className={styles.editorLegend}>
          {t("communities:detail.modtools.rule.legend")}
        </span>
        <p className={styles.editorHint}>
          {t("communities:detail.modtools.rule.noneWritten")}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.editorGroup}>
      <span className={styles.editorLegend} id={legendId}>
        {t("communities:detail.modtools.rule.legend")}
      </span>
      <Select
        labelledBy={legendId}
        value={value === null ? NO_RULE_VALUE : String(value)}
        onChange={(next) =>
          onChange(
            next === null || next === NO_RULE_VALUE ? null : Number(next),
          )
        }
        disabled={disabled}
        options={[
          {
            value: NO_RULE_VALUE,
            label: t("communities:detail.modtools.rule.noneOption"),
          },
          ...rules.map((rule) => ({
            value: String(rule.index),
            label: t("communities:detail.modtools.rule.option", {
              number: String(rule.index + 1),
              text: rule.text,
            }),
            keywords: rule.text,
          })),
        ]}
      />
      <p className={styles.editorHint}>
        {t("communities:detail.modtools.rule.hint")}
      </p>
    </div>
  );
}
