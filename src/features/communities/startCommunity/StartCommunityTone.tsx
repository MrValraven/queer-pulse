import { useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { ENFORCEMENT_LADDER, RULE_PRESETS } from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

/** Chapter 5 — Tone: the covenant, plus how the group holds it. */
export function StepTone({ form }: { form: CommunityForm }) {
  const { draft, toggleRule, addRule } = form;
  const [custom, setCustom] = useState("");

  // Presets first (in their canonical order), then any custom rules added.
  const customRules = draft.rules.filter((r) => !RULE_PRESETS.includes(r));
  const shown = [...RULE_PRESETS, ...customRules];

  const add = () => {
    const r = custom.trim();
    if (!r) return;
    addRule(r);
    setCustom("");
  };

  return (
    <div>
      <p className={styles.covenantIntro}>
        "We look after each other here. Warmth first, always — and no room for
        anyone who'd make this space unsafe."
      </p>

      <div className={styles.rulesList}>
        {shown.map((rule) => {
          const on = draft.rules.includes(rule);
          return (
            <button
              key={rule}
              type="button"
              className={[styles.rule, on && styles.ruleOn]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={on}
              onClick={() => toggleRule(rule)}
            >
              <span className={styles.ruleBox}>
                <FiCheck size={12} aria-hidden />
              </span>
              <span className={styles.ruleTxt}>{rule}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.addRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="Add a value in your own words"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="ghost" onClick={add} disabled={!custom.trim()}>
          <FiPlus size={15} aria-hidden /> Add
        </Button>
      </div>

      <div className={styles.groupH}>When something goes wrong</div>
      <p className={styles.groupSub}>
        You won't have to improvise. Every community starts with the same gentle
        ladder — you can adjust it inside.
      </p>
      <div className={styles.ladder}>
        {ENFORCEMENT_LADDER.map((step, i) => (
          <div key={step.title} className={styles.ladderStep}>
            <span className={styles.lsN}>{i + 1}</span>
            <span className={styles.lsT}>
              <b>{step.title}</b>
              <span>{step.desc}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
