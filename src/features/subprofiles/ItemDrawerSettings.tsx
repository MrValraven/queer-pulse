import { useId } from "react";
import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { CollaboratorPicker } from "./CollaboratorPicker";
import { ProtectWorkSection } from "./rights/ProtectWorkSection";
import styles from "./ItemDrawerSettings.module.css";

/**
 * The spotlight choice as a real on/off switch. It used to be a full-width
 * amber bar reading "Remove from spotlight" — a banner-shaped button whose
 * label described the action, not the state, so nobody could tell whether
 * the piece was in the spotlight or not. A switch says both at a glance.
 */
function SpotlightSwitch({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const helpId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-labelledby={titleId}
      aria-describedby={helpId}
      className={styles.spotlight}
      onClick={onToggle}
    >
      <span className={styles.spotlightIcon} aria-hidden>
        <FiStar />
      </span>
      <span className={styles.spotlightText}>
        <span id={titleId} className={styles.spotlightTitle}>
          {t("subprofiles:itemEditor.spotlightLabel")}
        </span>
        <span id={helpId} className={styles.spotlightHelp}>
          {t(
            isOn
              ? "subprofiles:itemEditor.spotlightOnHelp"
              : "subprofiles:itemEditor.spotlightOffHelp",
          )}
        </span>
      </span>
      <span className={styles.track} aria-hidden>
        <span className={styles.thumb} />
      </span>
    </button>
  );
}

/**
 * The item drawer's settings rail: how the piece is presented and who shares
 * the credit, kept apart from what the piece *is* (the content column). On a
 * wide sheet it sits beside the fields; on a phone it follows them.
 */
export function ItemDrawerSettings({
  draft,
  canFeature,
  isNew,
  authorName,
  onPatch,
}: {
  draft: SubprofileItemView;
  canFeature: boolean;
  isNew: boolean;
  authorName: string;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}) {
  const { t } = useTranslation();
  // A gallery photo has no collaborators and the public view never shows
  // them; with no spotlight either, the rail would be empty.
  const hasCollaborators = draft.section !== "gallery";
  if (!canFeature && !hasCollaborators && isNew) return null;
  return (
    <aside
      className={styles.rail}
      aria-label={t("subprofiles:itemDrawer.settingsLabel")}
    >
      {canFeature && (
        <SpotlightSwitch
          isOn={draft.isFeatured}
          onToggle={() => onPatch({ isFeatured: !draft.isFeatured })}
        />
      )}
      {hasCollaborators && (
        <CollaboratorPicker
          collaborators={draft.collaborators}
          onChange={(collaborators) => onPatch({ collaborators })}
        />
      )}
      {/* Owner-only "Protect this work": only meaningful once the item has a
          real, server-assigned `createdAt`. Guarded on `isNew`, not on
          `createdAt` — an unsaved draft's `createdAt` is a client-stamped
          placeholder from `emptyItem`. */}
      {!isNew && <ProtectWorkSection item={draft} authorName={authorName} />}
    </aside>
  );
}
