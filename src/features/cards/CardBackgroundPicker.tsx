import { useId, useState } from "react";
import { RadioCardGroup, SegmentedControl } from "../../shared/components/ui";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CardSkin, CardTextBackdrop } from "./api/cards.api";
import { CardSkinPicker } from "./CardSkinPicker";
import { CARD_BACKGROUND_PRESETS } from "./cardBackgrounds.data";
import { TEXT_BACKDROP_OPTIONS } from "./cardDesigner.data";
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
  /** How the card's own text stays readable over that ground. */
  textBackdrop: CardTextBackdrop;
  onTextBackdropChange: (backdrop: CardTextBackdrop) => void;
}

/**
 * What the card is made of: one of the five flat skins, a pride flag, or the
 * community's own photo, plus how the card's own text survives whichever of
 * those it lands on.
 *
 * The three are mutually exclusive by construction — switching mode clears
 * whichever grounds the other modes had set — because the card has exactly one
 * ground and the backend enforces the same rule on write. Leaving both set and
 * picking a winner at render time would mean the designer and the member's
 * card could disagree about which one they were looking at.
 *
 * WHETHER the text over a flag or a photo is legible is not the owner's
 * problem to solve: the card face always darkens what sits under the print
 * and switches to light ink (see `.hasGround` in
 * MembershipCardFace.module.css), so no community can ship a card that cannot
 * be read at a door. WHICH treatment does that darkening is theirs, because
 * the right answer depends on their artwork: the default gradient suits a
 * striped flag and loses to a busy illustration, where the detail competing
 * with the holder's name is in the middle of the card rather than at its
 * edges. So the choice appears only once a ground is set, and it offers three
 * treatments rather than an off switch.
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
  textBackdrop,
  onTextBackdropChange,
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

      {/* Only over a flag or a photo. The five flat skins carry their own
          curated ink pairing (see cardSkins.ts), so there is nothing here for
          them to fix and the control would only ask an owner to decide
          something that does not apply to the card they are looking at. */}
      {mode !== "colour" && (
        <div className={styles.groupField}>
          <div className={styles.groupLabel}>
            {t("cards:designer.backdropLabel")}
          </div>
          <SegmentedControl
            fullWidth
            label={t("cards:designer.backdropLabel")}
            value={textBackdrop}
            onChange={(value) =>
              onTextBackdropChange(
                (value as CardTextBackdrop | null) ?? "shade",
              )
            }
            className={styles.modes}
            options={TEXT_BACKDROP_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
          {/* The helper describes the SELECTED treatment rather than listing
              all three: the card beside it is already showing the choice, so
              this only has to say which artwork it is the right answer for. */}
          <p className={styles.groupHelper}>
            {t(
              TEXT_BACKDROP_OPTIONS.find(
                (option) => option.value === textBackdrop,
              )?.helperKey ?? "cards:backdrop.shadeHelper",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
