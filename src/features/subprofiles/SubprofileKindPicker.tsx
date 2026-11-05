import { useMemo } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "./api/subprofiles.api";
import { KIND_FAMILIES } from "./kindFamilies.data";
import { KindFamilyCard } from "./KindFamilyCard";
import { KindFamilyPicker } from "./KindFamilyPicker";
import { kindsSwitchableFrom, SKIN_OF } from "./subprofile-skins";
import styles from "./NewSideModal.module.css";
import pickerStyles from "./SubprofileKindPicker.module.css";

/**
 * The type choices for "Change type". A persona of any kind but "Other" may
 * switch only within its own page group, so it sees that one group's card
 * with the other types of the group (canonical order, the usual icons and
 * labels). An "Other" persona may become any type, so it gets the full
 * family picker with its search field. The caller handles the case where no
 * type is available, so this is never rendered for an empty list. The full
 * picker is long, so it scrolls inside its own capped area, and `onClose`
 * adds a button at the bottom of that area to fold the list away again.
 */
export function SubprofileKindPicker({
  currentKind,
  pendingKind,
  onPickKind,
  onClose,
}: {
  currentKind: SubprofileKind;
  pendingKind: SubprofileKind | null;
  onPickKind: (kind: SubprofileKind) => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  // The picker memoizes on this list's identity, so it must stay stable.
  const allowedKinds = useMemo(
    () => kindsSwitchableFrom(currentKind),
    [currentKind],
  );

  if (currentKind === "generic") {
    return (
      <div className={pickerStyles.scrollArea} data-testid="kind-picker-scroll">
        <KindFamilyPicker
          kind={pendingKind}
          onChangeKind={onPickKind}
          allowedKinds={allowedKinds}
          t={t}
        />
        {onClose && (
          <div className={pickerStyles.closeRow}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("subprofiles:kindChange.close")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  const currentGroup = KIND_FAMILIES.find(
    (familyGroup) => familyGroup.family === SKIN_OF[currentKind],
  );
  if (!currentGroup) return null;
  const visibleKinds = currentGroup.kinds.filter((candidateKind) =>
    allowedKinds.includes(candidateKind),
  );

  return (
    <div className={styles.fams}>
      <KindFamilyCard
        familyGroup={currentGroup}
        visibleKinds={visibleKinds}
        selectedKind={pendingKind}
        onChangeKind={onPickKind}
        shouldKindsPopIn={false}
        t={t}
      />
    </div>
  );
}
