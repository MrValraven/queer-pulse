import { useId, useState, type KeyboardEvent } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CollaboratorDTO } from "./api/subprofiles.api";
import { MAX_COLLABORATORS } from "./collaborators.data";
import styles from "./HandleChipInput.module.css";

interface HandleChipInputProps {
  collaborators: CollaboratorDTO[];
  onChange: (collaborators: CollaboratorDTO[]) => void;
}

/** Strip a leading "@" (one or more, in case someone pastes "@@handle") and
 *  surrounding whitespace, so "@Jamie" and "Jamie" both store as "Jamie". */
function normalizeHandleInput(rawHandle: string): string {
  return rawHandle.trim().replace(/^@+/, "");
}

/**
 * Free-text `@handle` chip editor for an item's collaborator credits. Only
 * `.handle` is meaningful on save — `itemsToInputDto` maps it to the input
 * DTO's `collaborators: string[]`. The rest of the stand-in `CollaboratorDTO`
 * (`type`/`name`/`avatarUrl`/`slug`) is a placeholder until the backend
 * resolves the handle and the next read swaps it for the real resolved card.
 */
export function HandleChipInput({
  collaborators,
  onChange,
}: HandleChipInputProps) {
  const { t } = useTranslation();
  const [pendingHandle, setPendingHandle] = useState("");
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const atCap = collaborators.length >= MAX_COLLABORATORS;

  function commitPendingHandle() {
    const handle = normalizeHandleInput(pendingHandle);
    setPendingHandle("");
    if (!handle || atCap) return;
    const alreadyAdded = collaborators.some(
      (collaborator) => collaborator.handle.toLowerCase() === handle.toLowerCase(),
    );
    if (alreadyAdded) return;
    onChange([
      ...collaborators,
      { handle, type: "member", name: handle, avatarUrl: null, slug: null },
    ]);
  }

  function removeHandle(handle: string) {
    onChange(collaborators.filter((collaborator) => collaborator.handle !== handle));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitPendingHandle();
    }
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={inputId}>
        {t("subprofiles:itemEditor.collaboratorsLabel")}
      </label>
      {collaborators.length > 0 && (
        <ul className={styles.chipList}>
          {collaborators.map((collaborator) => (
            <li key={collaborator.handle} className={styles.chip}>
              <span>@{collaborator.handle}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => removeHandle(collaborator.handle)}
                aria-label={t("subprofiles:itemEditor.collaboratorRemove", {
                  handle: collaborator.handle,
                })}
              >
                <FiX size={12} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={inputId}
        className={styles.input}
        value={pendingHandle}
        placeholder={t("subprofiles:itemEditor.collaboratorsPlaceholder")}
        onChange={(e) => setPendingHandle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitPendingHandle}
        disabled={atCap}
        aria-describedby={helperId}
      />
      <span className={styles.helper} id={helperId}>
        {atCap
          ? t("subprofiles:itemEditor.collaboratorsCapHint")
          : t("subprofiles:itemEditor.collaboratorsHelper")}
      </span>
    </div>
  );
}
