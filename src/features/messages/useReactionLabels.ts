// src/features/messages/useReactionLabels.ts
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REACTION_ORDER } from "./reactionKeys";

/**
 * Translated accessible name for each reaction key ("Love", "Laugh", …),
 * resolved via `messages:reactions.name.<key>`. Shared by `ReactionPicker`
 * (a button's own name) and `ReactionChips` (the name folded into a chip's
 * "name, count, including yours" label) so neither ever falls back to the raw
 * key: `aria-label={key}` used to read English identifiers to a PT
 * screen-reader member regardless of the active language (DES-201).
 */
export function useReactionLabels(): Record<MessageReactionKey, string> {
  const { t } = useTranslation();
  return REACTION_ORDER.reduce(
    (labels, key) => {
      labels[key] = t(`messages:reactions.name.${key}`);
      return labels;
    },
    {} as Record<MessageReactionKey, string>,
  );
}
