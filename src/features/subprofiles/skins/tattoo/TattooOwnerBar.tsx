import { useId } from "react";
import { FiEdit2, FiEye } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../../../app/routeMap";
import { useOwnerSkinPatch } from "../../api/useOwnerSkinPatch";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction } from "../../personaSkinRender";
import {
  TATTOO_STATUS_OPTIONS,
  withTattooStatus,
  type TattooStatusOption,
} from "./tattooBooksStatus";
import type { TattooView } from "./tattooView";
import type { TattooBooksStatus } from "./tattooVocab.data";
import styles from "./TattooOwnerBar.module.css";

interface TattooOwnerBarProps {
  data: PublicSubprofileView;
  view: TattooView;
  onAction: (action: PersonaAction) => void;
  /** A status save succeeded; the page shows it straight away. */
  onStatusSaved: (status: TattooBooksStatus) => void;
}

/**
 * The owner's panel above the hero: "Your books" with the three status
 * buttons, then the way into the editor and, on a published page, "View as
 * visitor". Owner mode only. A save writes `tattoo.status` and the paired
 * persona-wide availability together, so every availability surface agrees.
 */
export function TattooOwnerBar({
  data,
  view,
  onAction,
  onStatusSaved,
}: TattooOwnerBarProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { patchSkin, isSaving } = useOwnerSkinPatch(data.id);
  const headingId = useId();

  // The status lands on the persona's freshly read `skinData`, so a block a
  // co-owner saved after this page loaded rides along. `confirmAvailability`
  // stamps the status as confirmed even when it is unchanged.
  const saveStatus = (option: TattooStatusOption) => {
    if (isSaving) return;
    void patchSkin(
      (freshSkinData) => withTattooStatus(freshSkinData, option.status),
      { availability: option.availability, confirmAvailability: true },
    ).then(
      () => {
        onStatusSaved(option.status);
        showToast(t(option.savedKey), "success");
      },
      () => showToast(t("subprofiles:tattoo.owner.error"), "error"),
    );
  };

  return (
    <section className={styles.bar} aria-labelledby={headingId}>
      {/* Not a heading element: this panel sits above the page's h1. */}
      <p id={headingId} className={styles.label}>
        {t("subprofiles:tattoo.owner.label")}
      </p>
      <div
        className={styles.switch}
        role="group"
        aria-labelledby={headingId}
        aria-busy={isSaving || undefined}
      >
        {TATTOO_STATUS_OPTIONS.map((option) => (
          <button
            key={option.status}
            type="button"
            className={styles.switchButton}
            data-tone={option.tone}
            aria-pressed={view.status === option.status}
            // aria-disabled, so a keyboard user keeps focus on the button
            // while it saves; `saveStatus` ignores clicks meanwhile.
            aria-disabled={isSaving || undefined}
            onClick={() => saveStatus(option)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
      <div className={styles.links}>
        <Button
          variant="ghost"
          size="sm"
          to={subprofileEditPath(data.id)}
          onClick={() => onAction("edit")}
        >
          <FiEdit2 aria-hidden /> {t("subprofiles:tattoo.owner.editPage")}
        </Button>
        {/* Only a published page has a visitor to be viewed as. */}
        {data.status === "published" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAction("preview:enter")}
          >
            <FiEye aria-hidden /> {t("subprofiles:tattoo.owner.viewAsVisitor")}
          </Button>
        )}
      </div>
    </section>
  );
}
