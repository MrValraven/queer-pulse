import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Tooltip } from "../../../../shared/components/ui";
import type { TranslateOptions } from "../../../../shared/i18n/types";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import { CARD_FLAG_ICONS, type CardFlagKind } from "./cardIcons";
import styles from "./CardFlags.module.css";

interface FlagDef {
  kind: CardFlagKind;
  labelKey: string;
  warn?: boolean;
  values?: TranslateOptions;
}

/** Which of the 6 possible flags apply to `item`, prototype order. */
function activeFlags(item: AdminRoadmapItemDTO): FlagDef[] {
  const flags: FlagDef[] = [];
  if (item.requested) {
    flags.push({ kind: "requested", labelKey: "admin:roadmap.board.flag.requested" });
  }
  if (item.committed) {
    flags.push({ kind: "committed", labelKey: "admin:roadmap.board.flag.committed" });
  }
  if (!item.isPublic) {
    flags.push({ kind: "hidden", labelKey: "admin:roadmap.board.flag.hidden" });
  }
  if (item.safetyStatus === 1) {
    flags.push({
      kind: "safetyGated",
      labelKey: "admin:roadmap.board.flag.safetyGated",
      warn: true,
    });
  }
  if (item.spikeFlag) {
    flags.push({ kind: "spike", labelKey: "admin:roadmap.board.flag.spike", warn: true });
  }
  if (item.slips.length > 0) {
    flags.push({
      kind: "slips",
      labelKey: "admin:roadmap.board.flag.slips",
      values: { count: item.slips.length },
    });
  }
  return flags;
}

/**
 * The Board card's small flag-icon row — up to 6 possible states, each an
 * icon (`cardIcons.tsx`) behind a `Tooltip` so hover/focus/tap all reveal
 * what it means without spending card width on text for every one. Each
 * trigger carries its own `aria-label` (the `Tooltip` bubble itself is
 * decorative) and is independently focusable.
 */
export function CardFlags({ item }: { item: AdminRoadmapItemDTO }) {
  const { t } = useTranslation();
  const flags = activeFlags(item);
  if (flags.length === 0) return null;

  return (
    <span className={styles.row} data-card-interactive>
      {flags.map((flag) => {
        const label = t(flag.labelKey, flag.values);
        return (
          <Tooltip key={flag.kind} label={label}>
            {/* A real <button>, not a tabIndex'd <span> — needs no click
                behavior of its own, but must stay natively focusable so the
                Tooltip's focus-reveal path works for keyboard users. */}
            <button
              type="button"
              className={[styles.flag, flag.warn && styles.flagWarn]
                .filter(Boolean)
                .join(" ")}
              aria-label={label}
            >
              {CARD_FLAG_ICONS[flag.kind]}
            </button>
          </Tooltip>
        );
      })}
    </span>
  );
}
