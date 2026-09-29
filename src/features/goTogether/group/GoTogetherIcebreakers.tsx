import { useId, useState } from "react";
import { FiChevronDown, FiMessageSquare } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./GoTogetherGroup.module.css";

/** The curated bank holds `goTogether:icebreaker.1` to `.12`. */
const ICEBREAKER_BANK_SIZE = 12;
const ICEBREAKERS_SHOWN = 3;

/** FNV-1a over the group id: the same group always gets the same prompts,
 *  so every member sees the same three. */
function hashGroupId(groupId: string): number {
  let hash = 0x811c9dc5;
  for (const character of groupId) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Three distinct prompt numbers (1 to 12), picked by a seeded shuffle of the
 *  bank. */
function pickIcebreakerNumbers(groupId: string): number[] {
  const bank = Array.from(
    { length: ICEBREAKER_BANK_SIZE },
    (_unused, position) => position + 1,
  );
  let seed = hashGroupId(groupId);
  for (let position = bank.length - 1; position > 0; position -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapWith = seed % (position + 1);
    [bank[position], bank[swapWith]] = [bank[swapWith]!, bank[position]!];
  }
  return bank.slice(0, ICEBREAKERS_SHOWN);
}

/** "Something to start with": three light prompts in a block the member can
 *  fold open, so the group card stays short. */
export function GoTogetherIcebreakers({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const promptNumbers = pickIcebreakerNumbers(groupId);

  return (
    <section className={styles.icebreakers}>
      <button
        type="button"
        className={styles.icebreakerToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMessageSquare aria-hidden="true" />
        <span className={styles.icebreakerTitle}>
          {t("goTogether:group.icebreakers.title")}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={styles.icebreakerChevron}
          data-open={isOpen}
        />
      </button>
      <div id={panelId}>
        <Collapse isOpen={isOpen}>
          <ol className={styles.icebreakerList}>
            {promptNumbers.map((promptNumber) => (
              <li key={promptNumber}>
                {t(`goTogether:icebreaker.${promptNumber}`)}
              </li>
            ))}
          </ol>
        </Collapse>
      </div>
    </section>
  );
}
