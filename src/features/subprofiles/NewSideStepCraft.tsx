import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  KIND_LABEL_KEYS,
  KIND_SECTIONS,
  SECTION_META,
} from "./subprofile-kinds";
import { KIND_FAMILIES } from "./kindFamilies.data";
import { StartMethodPicker, type StartMethod } from "./StartMethodPicker";
import { CopySourcePicker } from "./CopySourcePicker";
import { CopyModePreview } from "./CopyModePreview";
import type { CopyMode } from "./subprofileDuplicate";
import styles from "./NewSideModal.module.css";

/** The lead section's icon stands in for the whole kind in the picker. */
function kindIcon(kind: SubprofileKind) {
  return SECTION_META[KIND_SECTIONS[kind][0]!].icon;
}

/** "Shows, Looks" / "Shows & Looks" — a plain locale-neutral join (no i18n
 *  list-formatting helper exists in this repo's `t()`; see translate.ts). */
function joinedSectionLabels(kind: SubprofileKind, t: TranslationApi["t"]): string {
  const labels = KIND_SECTIONS[kind].map((section) => t(SECTION_META[section].labelKey));
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]}`;
}

/**
 * Step 1: choose how the persona starts. A `.seg` [By craft / Blank / Copy
 * one] picks the method; "By craft" and "Blank" both need a kind (it decides
 * the page family/sections either way), shown as a family-grouped picker
 * (`.fams`); "Copy" swaps in the existing source + mode pickers. A live
 * summary line explains what the chosen kind produces.
 */
export function NewSideStepCraft({
  method,
  onChangeMethod,
  kind,
  onChangeKind,
  sources,
  sourceId,
  onChangeSourceId,
  copyMode,
  onChangeCopyMode,
  effectiveKind,
  t,
}: {
  method: StartMethod;
  onChangeMethod: (method: StartMethod) => void;
  kind: SubprofileKind | null;
  onChangeKind: (kind: SubprofileKind) => void;
  sources: SubprofileView[];
  sourceId: string | null;
  onChangeSourceId: (id: string) => void;
  copyMode: CopyMode;
  onChangeCopyMode: (mode: CopyMode) => void;
  effectiveKind: SubprofileKind | null;
  t: TranslationApi["t"];
}) {
  const source = sources.find((candidate) => candidate.id === sourceId) ?? null;

  return (
    <>
      <StartMethodPicker
        method={method}
        onChange={onChangeMethod}
        copyDisabled={sources.length === 0}
        t={t}
      />

      {method !== "copy" && (
        <div className={styles.fams}>
          {KIND_FAMILIES.map((familyGroup) => (
            <div key={familyGroup.family} className={styles.fam}>
              <div className={styles.famHead}>
                <b>{t(familyGroup.labelKey)}</b>
                <span>{t(familyGroup.noteKey)}</span>
              </div>
              <div className={styles.kinds}>
                {familyGroup.kinds.map((candidateKind) => {
                  const Icon = kindIcon(candidateKind);
                  const selected = kind === candidateKind;
                  return (
                    <button
                      key={candidateKind}
                      type="button"
                      aria-pressed={selected}
                      className={[styles.kindBtn, selected && styles.kindBtnOn]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => onChangeKind(candidateKind)}
                    >
                      <Icon size={16} aria-hidden />
                      {t(KIND_LABEL_KEYS[candidateKind])}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {method === "copy" && (
        <>
          <CopySourcePicker
            sources={sources}
            selectedId={sourceId}
            onSelect={onChangeSourceId}
            t={t}
          />
          {source && (
            <CopyModePreview
              source={source}
              mode={copyMode}
              onChange={onChangeCopyMode}
              t={t}
            />
          )}
        </>
      )}

      {effectiveKind && (
        <p className={styles.craftSummary}>
          {t("subprofiles:newModal.craftSummary", {
            kind: t(KIND_LABEL_KEYS[effectiveKind]),
            // KIND_FAMILIES is total over SubprofileKind (built from every
            // kind, grouped by SKIN_OF), so this always finds a family.
            skin: t(
              KIND_FAMILIES.find((familyGroup) =>
                familyGroup.kinds.includes(effectiveKind),
              )!.labelKey,
            ),
            sections: joinedSectionLabels(effectiveKind, t),
          })}
        </p>
      )}
    </>
  );
}
