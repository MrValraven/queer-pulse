import { useState } from "react";
import { FiGlobe, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import { SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PoemBlock, PoemVersion } from "../api/subprofiles.api";
import { newPoemVersion } from "./poemBlocks";
import { normalizePoemVersions } from "./poemModel";
import { PoemBodyEditor } from "./PoemBodyEditor";
import styles from "./PoemVersionsEditor.module.css";

export interface PoemVersionsEditorProps {
  /** Current translations (from `draft.structured.poemVersions`). */
  value: PoemVersion[] | null;
  /** Legacy single-poem body (`draft.structured.poem`), used to seed the first
   *  version for poems saved before translations existed (no migration). */
  legacyPoem: PoemBlock[] | null;
  /** Legacy plain-text `description`, forwarded to the first version's body
   *  editor as its seed fallback (matches the old single-poem behaviour). */
  description: string;
  onChange: (versions: PoemVersion[]) => void;
}

/**
 * Wraps the single-body `PoemBodyEditor` with a translation manager: a tab
 * strip of named versions (first = default), an inline name field, and
 * add / make-default / remove controls. The body editor is remounted per
 * active version (keyed by id) so it re-seeds with that version's blocks;
 * every edit commits back into the active version. A poem with one untitled
 * version renders exactly like the old single-poem editor, plus one subtle
 * "Add a translation" affordance.
 */
export function PoemVersionsEditor({
  value,
  legacyPoem,
  description,
  onChange,
}: PoemVersionsEditorProps) {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<PoemVersion[]>(() =>
    normalizePoemVersions(value, legacyPoem),
  );
  const [activeId, setActiveId] = useState<string>(() => versions[0]!.id);

  const activeIndex = Math.max(
    0,
    versions.findIndex((version) => version.id === activeId),
  );
  const activeVersion = versions[activeIndex]!;
  const hasTabs = versions.length > 1;

  function commit(next: PoemVersion[]) {
    setVersions(next);
    onChange(next);
  }

  function displayLabel(version: PoemVersion, index: number): string {
    return (
      version.label.trim() ||
      t("subprofiles:poem.versions.untitled", { index: index + 1 })
    );
  }

  function patchActiveBlocks(blocks: PoemBlock[]) {
    commit(
      versions.map((version) =>
        version.id === activeVersion.id ? { ...version, blocks } : version,
      ),
    );
  }

  function renameActive(label: string) {
    commit(
      versions.map((version) =>
        version.id === activeVersion.id ? { ...version, label } : version,
      ),
    );
  }

  function addVersion() {
    const created = newPoemVersion();
    commit([...versions, created]);
    setActiveId(created.id);
  }

  function removeActive() {
    if (versions.length <= 1) return;
    const next = versions.filter((version) => version.id !== activeVersion.id);
    commit(next);
    setActiveId(next[Math.min(activeIndex, next.length - 1)]!.id);
  }

  /** Move the active version to the front — it becomes the default shown first
   *  (and the one mirrored into legacy `structured.poem`). */
  function makeActiveDefault() {
    if (activeIndex === 0) return;
    commit([
      activeVersion,
      ...versions.filter((version) => version.id !== activeVersion.id),
    ]);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        {hasTabs && (
          <SegmentedControl
            className={styles.tabs}
            label={t("subprofiles:poem.versions.tablistAria")}
            options={versions.map((version, index) => ({
              value: version.id,
              label: displayLabel(version, index),
              icon: index === 0 ? <FiStar aria-hidden /> : undefined,
            }))}
            value={activeVersion.id}
            onChange={setActiveId}
          />
        )}
        <button type="button" className={styles.addBtn} onClick={addVersion}>
          <FiPlus aria-hidden /> {t("subprofiles:poem.versions.add")}
        </button>
      </div>

      {hasTabs && (
        <div className={styles.controls}>
          <label className={styles.nameField}>
            <FiGlobe aria-hidden />
            <input
              value={activeVersion.label}
              placeholder={t("subprofiles:poem.versions.namePlaceholder")}
              aria-label={t("subprofiles:poem.versions.nameAria")}
              onChange={(event) => renameActive(event.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={makeActiveDefault}
            disabled={activeIndex === 0}
          >
            <FiStar aria-hidden /> {t("subprofiles:poem.versions.makeDefault")}
          </button>
          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={removeActive}
          >
            <FiTrash2 aria-hidden /> {t("subprofiles:poem.versions.remove")}
          </button>
        </div>
      )}

      <PoemBodyEditor
        key={activeVersion.id}
        value={activeVersion.blocks}
        description={activeIndex === 0 ? description : ""}
        onChange={patchActiveBlocks}
      />
    </div>
  );
}
