import { useId, useState } from "react";
import { RadioCardGroup, SegmentedControl } from "../../shared/components/ui";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CardSkin } from "./api/cards.api";
import { CardSkinPicker } from "./CardSkinPicker";
import { CARD_BACKGROUND_PRESETS } from "./cardBackgrounds.data";
import styles from "./CardDesignerModal.module.css";

type BackgroundMode = "colour" | "flag" | "photo";

export interface CardBackgroundPickerProps {
  skin: CardSkin;
  onSkinChange: (skin: CardSkin) => void;
  accentToken: string;
  preset: string | null;
  onPresetChange: (preset: string | null) => void;
  /** Storage key (or the saved URL) for an uploaded ground; `""` for none. */
  photoKey: string;
  onPhotoChange: (key: string) => void;
  onPhotoPreviewChange: (previewUrl: string | null) => void;
}

/**
 * What the card is made of: one of the five flat skins, a pride flag, or the
 * community's own photo.
 *
 * The three are mutually exclusive by construction — switching mode clears
 * whichever grounds the other modes had set — because the card has exactly one
 * ground and the backend enforces the same rule on write. Leaving both set and
 * picking a winner at render time would mean the designer and the member's
 * card could disagree about which one they were looking at.
 *
 * Legibility over a flag or a photo is not the owner's problem to solve: the
 * card face lays a fixed scrim over any ground and switches to light ink (see
 * `.hasGround` in MembershipCardFace.module.css), so no community can ship a
 * card that cannot be read at a door.
 */
export function CardBackgroundPicker({
  skin,
  onSkinChange,
  accentToken,
  preset,
  onPresetChange,
  photoKey,
  onPhotoChange,
  onPhotoPreviewChange,
}: CardBackgroundPickerProps) {
  const { t } = useTranslation();
  const skinLabelId = useId();
  const flagLabelId = useId();
  // Opens on whatever the saved programme actually uses.
  const [mode, setMode] = useState<BackgroundMode>(
    photoKey ? "photo" : preset ? "flag" : "colour",
  );

  const changeMode = (next: BackgroundMode) => {
    setMode(next);
    if (next !== "flag" && preset) onPresetChange(null);
    if (next !== "photo" && photoKey) onPhotoChange("");
  };

  return (
    <div className={styles.group}>
      <div className={styles.groupLabel} id={skinLabelId}>
        {t("cards:designer.backgroundLabel")}
      </div>

      <SegmentedControl
        fullWidth
        label={t("cards:designer.backgroundLabel")}
        value={mode}
        onChange={(value) => changeMode(value as BackgroundMode)}
        className={styles.modes}
        options={[
          { value: "colour", label: t("cards:designer.background.colour") },
          { value: "flag", label: t("cards:designer.background.flag") },
          { value: "photo", label: t("cards:designer.background.photo") },
        ]}
      />

      {mode === "colour" && (
        <CardSkinPicker
          value={skin}
          accentToken={accentToken}
          onChange={onSkinChange}
          labelledBy={skinLabelId}
        />
      )}

      {mode === "flag" && (
        <>
          <p className={styles.groupHelper} id={flagLabelId}>
            {t("cards:designer.flagHelper")}
          </p>
          <RadioCardGroup<string>
            value={preset ?? ""}
            onChange={onPresetChange}
            ariaLabel={t("cards:designer.background.flag")}
            ariaLabelledBy={flagLabelId}
            className={styles.flags}
            optionClassName={styles.flagChip}
            checkedClassName={styles.skinChipOn}
            options={CARD_BACKGROUND_PRESETS.map((option) => ({
              id: option.id,
              render: (
                <>
                  <span
                    className={styles.flagFace}
                    style={{ background: option.background }}
                    aria-hidden="true"
                  />
                  <span className={styles.chipLabel}>{t(option.labelKey)}</span>
                </>
              ),
            }))}
          />
        </>
      )}

      {mode === "photo" && (
        <>
          <p className={styles.groupHelper}>
            {t("cards:designer.photoHelper")}
          </p>
          {/* `community-cover` rather than the crest's `group-avatar`: this is
              a wide banner-sized image, and that kind already carries the
              larger dimension cap a card ground needs to stay crisp. */}
          <div className={styles.photoSlot}>
            <ImageUploadField
              value={photoKey}
              onChange={onPhotoChange}
              onPreviewChange={onPhotoPreviewChange}
              kind="community-cover"
              size={120}
              placeholder={t("cards:designer.background.photo")}
            />
          </div>
        </>
      )}
    </div>
  );
}
