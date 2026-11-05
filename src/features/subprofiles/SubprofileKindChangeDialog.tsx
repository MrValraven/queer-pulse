import { ConfirmDialog } from "../../shared/components/ui";
import { intlLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";
import { sectionChangesForKindSwitch } from "./kindSwitchSections";
import { KIND_LABEL_KEYS, SECTION_META } from "./subprofile-kinds";
import styles from "./SubprofileKindChangeDialog.module.css";

/** Names the sections a type change hides, adds and keeps before the owner
 *  confirms it. Nothing is deleted, so a muted last line says the hidden
 *  sections return on a switch back (shown only when something is hidden).
 *  Mount inside AnimatePresence. */
export function SubprofileKindChangeDialog({
  currentKind,
  nextKind,
  isSaving,
  onConfirm,
  onClose,
}: {
  currentKind: SubprofileKind;
  nextKind: SubprofileKind;
  isSaving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t, language } = useTranslation();
  const { hidden, appearing, staying } = sectionChangesForKindSwitch(
    currentKind,
    nextKind,
  );
  const listFormat = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  });
  const describeSections = (
    sections: SubprofileSection[],
    messageKey: string,
  ) => (
    <p key={messageKey}>
      {t(messageKey, {
        count: sections.length,
        sections: listFormat.format(
          sections.map((section) => t(SECTION_META[section].labelKey)),
        ),
      })}
    </p>
  );
  const hasNoSectionChange =
    hidden.length === 0 && appearing.length === 0 && staying.length === 0;

  return (
    <ConfirmDialog
      open
      tone="default"
      loading={isSaving}
      title={t("subprofiles:kindChange.confirm.title", {
        kind: t(KIND_LABEL_KEYS[nextKind]),
      })}
      confirmLabel={t("subprofiles:kindChange.confirm.action")}
      onClose={() => {
        if (!isSaving) onClose();
      }}
      onConfirm={onConfirm}
    >
      <div className={styles.sectionLines}>
        {hidden.length > 0 &&
          describeSections(hidden, "subprofiles:kindChange.confirm.hidden")}
        {appearing.length > 0 &&
          describeSections(
            appearing,
            "subprofiles:kindChange.confirm.appearing",
          )}
        {staying.length > 0 &&
          describeSections(staying, "subprofiles:kindChange.confirm.staying")}
        {hasNoSectionChange && (
          <p>{t("subprofiles:kindChange.confirm.noSectionChange")}</p>
        )}
      </div>
      {hidden.length > 0 && (
        <p className={styles.keepsContent}>
          {t("subprofiles:kindChange.confirm.keepsContent", {
            currentKind: t(KIND_LABEL_KEYS[currentKind]),
          })}
        </p>
      )}
    </ConfirmDialog>
  );
}
