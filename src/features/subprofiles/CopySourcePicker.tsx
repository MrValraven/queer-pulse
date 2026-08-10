import { useRef, type KeyboardEvent } from "react";
import { Avatar, Badge } from "../../shared/components/ui";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import styles from "./NewSideModal.module.css";

/** Pick which of the owner's existing personas to copy. Renders an empty state
 *  when the owner has none (the caller also disables the Copy method, so this
 *  is a belt-and-braces guard). A single-select listbox with roving tabindex:
 *  one option holds the tab stop, and Arrow/Home/End move the selection (which
 *  follows focus, revealing the copy-mode preview as you go). */
export function CopySourcePicker({
  sources,
  selectedId,
  onSelect,
  t,
}: {
  sources: SubprofileView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: TranslationApi["t"];
}) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (sources.length === 0) {
    return <p className={styles.sourceEmpty}>{t("subprofiles:copy.noSources")}</p>;
  }

  const selectedIndex = sources.findIndex((source) => source.id === selectedId);
  // Roving tab stop: the selected option, or the first one when none is chosen yet.
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function moveTo(nextIndex: number) {
    const clampedIndex = Math.max(0, Math.min(sources.length - 1, nextIndex));
    onSelect(sources[clampedIndex]!.id);
    optionRefs.current[clampedIndex]?.focus();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(sources.length - 1);
        break;
    }
  }

  return (
    <div className={styles.sourceList} role="listbox" aria-label={t("subprofiles:copy.sourceLabel")}>
      {sources.map((source, index) => {
        const selected = source.id === selectedId;
        return (
          <button
            key={source.id}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            type="button"
            role="option"
            aria-selected={selected}
            tabIndex={index === tabStopIndex ? 0 : -1}
            className={[styles.sourceBtn, selected && styles.sourceBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(source.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <Avatar
              initials={initialsFromName(source.displayName, "?")}
              src={source.avatarUrl ?? undefined}
              tint="plum"
              size={40}
            />
            <span className={styles.sourceMeta}>
              <span>{source.displayName || t("subprofiles:mine.untitled")}</span>
              <Badge tone="ghost">{t(KIND_LABEL_KEYS[source.kind])}</Badge>
            </span>
          </button>
        );
      })}
    </div>
  );
}
