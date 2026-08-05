import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUpdateLandingFeature } from "./api/useLandingFeatures";
import {
  AdminLandingCopyFields,
  buildLandingCopy,
  landingCopyValueFromCopy,
} from "./AdminLandingCopyFields";
import type { LandingFeatureVM } from "./api/landingFeatures.adapters";
import type { LandingSection } from "./api/landingFeatures.api";
import styles from "./AdminLandingPage.module.css";

/**
 * Controlled copy form for one already-featured slot, keyed by section via
 * the shared `AdminLandingCopyFields`. Local state starts from `feature.copy`
 * and only reaches the server on explicit Save — nothing autosaves as the
 * admin types. (The create-time counterpart of this form lives inline in
 * `AdminLandingEligiblePicker`, sharing the same field group + `buildLandingCopy`.)
 */
export function AdminLandingFeatureEditor({
  section,
  feature,
  onSaved,
}: {
  section: LandingSection;
  feature: LandingFeatureVM;
  onSaved?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateFeature = useUpdateLandingFeature();

  const [value, setValue] = useState(() =>
    landingCopyValueFromCopy(feature.copy),
  );

  function handleSave() {
    const copy = buildLandingCopy(section, value);
    updateFeature.mutate(
      { id: feature.id, copy },
      {
        onSuccess: () => {
          showToast(t("admin:landing.editor.savedToast"));
          onSaved?.();
        },
        onError: () => showToast(t("admin:landing.editor.saveError")),
      },
    );
  }

  return (
    <div className={styles.editor}>
      <AdminLandingCopyFields
        section={section}
        value={value}
        onChange={(patch) =>
          setValue((current) => ({ ...current, ...patch }))
        }
      />

      <div className={styles.editorActions}>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={updateFeature.isPending}
        >
          {t("admin:landing.editor.save")}
        </Button>
      </div>
    </div>
  );
}
