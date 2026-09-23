import { useId } from "react";
import {
  FiCheck,
  FiInfo,
  FiKey,
  FiLock,
  FiSlash,
  FiUnlock,
  FiUserCheck,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessTier } from "./api/communities.api";
import { isTierSelectable, TIER_ORDER } from "./spaceTierOptions";
import styles from "./CreateSpaceForm.module.css";

/** Same icon per tier as the founding wizard's access step. The lock belongs
 *  to Private alone, so a locked card's corner mark is a slash. */
const TIER_ICON = {
  public: FiUnlock,
  request: FiUserCheck,
  invite: FiKey,
  private: FiLock,
} as const;

/** Catalog key for each tier's short name as a space wears it, shared with
 *  the space card's tier badge: the Portuguese names agree with "espaço".
 *  CommunityBadges keeps the same map; a component file exporting it would
 *  trip the fast-refresh lint, so the two stay in step by hand. */
const TIER_NAME_KEY: Record<AccessTier, string> = {
  public: "communities:badges.spaceTier.public",
  request: "communities:badges.spaceTier.request",
  invite: "communities:badges.spaceTier.invite",
  private: "communities:badges.spaceTier.private",
};

/** What each tier means for a space. The wizard's copy describes a
 *  top-level community, and a space only ever admits people already in the
 *  parent, so it gets its own lines. */
const TIER_DESCRIPTION_KEY: Record<AccessTier, string> = {
  public: "communities:spaces.mod.form.tierDescription.public",
  request: "communities:spaces.mod.form.tierDescription.request",
  invite: "communities:spaces.mod.form.tierDescription.invite",
  private: "communities:spaces.mod.form.tierDescription.private",
};

interface SpaceTierPickerProps {
  value: AccessTier;
  onChange: (tier: AccessTier) => void;
  /** Tiers looser than this are locked: a space can't sit more open. */
  parentTier: AccessTier;
  parentName: string;
}

/**
 * The four access tiers as selectable cards. Each card wraps a native,
 * visually hidden radio, so arrow keys, form semantics and the radio role
 * all come from the browser; the card only draws the state. The "can't be
 * more open" reason is written once under the grid and described onto
 * every locked radio.
 */
export function SpaceTierPicker({
  value,
  onChange,
  parentTier,
  parentName,
}: SpaceTierPickerProps) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const lockedNoteId = `${idPrefix}-locked`;
  const hasLockedTier = TIER_ORDER.some(
    (tier) => !isTierSelectable(tier, parentTier),
  );

  return (
    <fieldset className={styles.section}>
      <legend className={styles.sectionLegend}>
        {t("communities:spaces.mod.form.tier")}
      </legend>
      <div className={styles.tierGrid}>
        {TIER_ORDER.map((tier) => {
          const Icon = TIER_ICON[tier];
          const isLocked = !isTierSelectable(tier, parentTier);
          const isChecked = value === tier;
          const descriptionId = `${idPrefix}-${tier}`;
          return (
            <label
              key={tier}
              className={[
                styles.tierCard,
                isChecked && styles.tierCardChecked,
                isLocked && styles.tierCardLocked,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                className="visuallyHidden"
                name={`${idPrefix}-tier`}
                aria-label={t(TIER_NAME_KEY[tier])}
                aria-describedby={
                  isLocked ? `${descriptionId} ${lockedNoteId}` : descriptionId
                }
                value={tier}
                checked={isChecked}
                disabled={isLocked}
                onChange={() => onChange(tier)}
              />
              <span className={styles.tierIcon}>
                <Icon size={18} aria-hidden />
              </span>
              <span className={styles.tierBody}>
                <span className={styles.tierName}>
                  {t(TIER_NAME_KEY[tier])}
                </span>
                <span id={descriptionId} className={styles.tierDescription}>
                  {t(TIER_DESCRIPTION_KEY[tier], { name: parentName })}
                </span>
              </span>
              <span className={styles.tierMark} aria-hidden>
                {isLocked ? (
                  <FiSlash size={14} />
                ) : (
                  isChecked && <FiCheck size={13} />
                )}
              </span>
            </label>
          );
        })}
      </div>
      {hasLockedTier && (
        <p id={lockedNoteId} className={styles.tierNote}>
          <FiInfo size={14} aria-hidden />
          <span>
            {t("communities:spaces.mod.form.tierLocked", { name: parentName })}
          </span>
        </p>
      )}
    </fieldset>
  );
}
