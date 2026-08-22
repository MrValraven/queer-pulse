import { FiAlertTriangle } from "react-icons/fi";
import { CheckLine, FormField, Select } from "../../shared/components/ui";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CardPhotoStyle, CardSkin } from "./api/cards.api";
import { CardBackgroundPicker } from "./CardBackgroundPicker";
import {
  ACCENT_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  VALIDITY_OPTIONS,
  expiryPreviewDate,
  isAccentInvisibleOnSkin,
  selectValueToValidity,
  validityToSelectValue,
} from "./cardDesigner.data";
import styles from "./CardDesignerModal.module.css";

const CARD_NAME_MAX = 32;

export interface CardDesignerFieldsProps {
  cardName: string;
  onCardNameChange: (value: string) => void;
  skin: CardSkin;
  onSkinChange: (value: CardSkin) => void;
  accentToken: string;
  onAccentChange: (value: string) => void;
  validityMonths: number | null;
  onValidityChange: (value: number | null) => void;
  /** Storage key for the crest, `""` for none. Not a fetchable URL. */
  crestKey: string;
  onCrestChange: (key: string) => void;
  /** Local, immediately-renderable URL for a freshly picked crest. */
  onCrestPreviewChange: (previewUrl: string | null) => void;
  /** The card's ground: a flag preset id, or an uploaded image. Never both. */
  backgroundPreset: string | null;
  onBackgroundPresetChange: (preset: string | null) => void;
  backgroundKey: string;
  onBackgroundChange: (key: string) => void;
  onBackgroundPreviewChange: (previewUrl: string | null) => void;
  /** Whether these cards carry the holder's photo. */
  allowsMemberPhoto: boolean;
  onAllowsMemberPhotoChange: (allows: boolean) => void;
  /** How those photos are printed. */
  photoStyle: CardPhotoStyle;
  onPhotoStyleChange: (style: CardPhotoStyle) => void;
}

/** The form controls, split out of `CardDesignerModal` to keep each
 *  component under the repo's 200-line limit. */
export function CardDesignerFields({
  cardName,
  onCardNameChange,
  skin,
  onSkinChange,
  accentToken,
  onAccentChange,
  validityMonths,
  onValidityChange,
  crestKey,
  onCrestChange,
  onCrestPreviewChange,
  backgroundPreset,
  onBackgroundPresetChange,
  backgroundKey,
  onBackgroundChange,
  onBackgroundPreviewChange,
  allowsMemberPhoto,
  onAllowsMemberPhotoChange,
  photoStyle,
  onPhotoStyleChange,
}: CardDesignerFieldsProps) {
  const { t } = useTranslation();
  const format = useFormat();

  // The consequence of the validity choice, as a date. "One year" tells an
  // owner nothing about when their members start getting turned away.
  const expiry = expiryPreviewDate(validityMonths, new Date());
  const validityHelper = expiry
    ? t("cards:designer.validityHelper", { date: format.date(expiry) })
    : t("cards:designer.validityHelperNever");

  return (
    <div className={styles.fields}>
      <FormField
        label={t("cards:designer.cardNameLabel")}
        labelAside={
          <span className={styles.counter}>
            {cardName.length}/{CARD_NAME_MAX}
          </span>
        }
        helper={t("cards:designer.cardNameHelper")}
      >
        <input
          type="text"
          value={cardName}
          maxLength={CARD_NAME_MAX}
          onChange={(event) => onCardNameChange(event.target.value)}
          placeholder={t("cards:designer.cardNamePlaceholder")}
        />
      </FormField>

      <CardBackgroundPicker
        skin={skin}
        onSkinChange={onSkinChange}
        accentToken={accentToken}
        preset={backgroundPreset}
        onPresetChange={onBackgroundPresetChange}
        photoKey={backgroundKey}
        onPhotoChange={onBackgroundChange}
        onPhotoPreviewChange={onBackgroundPreviewChange}
      />

      <FormField
        label={t("cards:designer.accentLabel")}
        helper={
          isAccentInvisibleOnSkin(skin, accentToken) ? (
            <span className={styles.warning}>
              <FiAlertTriangle aria-hidden="true" />{" "}
              {t("cards:designer.accentInvisible")}
            </span>
          ) : undefined
        }
      >
        <Select
          value={accentToken}
          onChange={(value) => onAccentChange(value ?? "accent")}
          options={ACCENT_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
        />
      </FormField>

      <div className={styles.group}>
        <div className={styles.groupLabel}>
          {t("cards:designer.memberPhotoLabel")}
        </div>
        {/* Says plainly that the member keeps a veto, because an owner
            deciding this is deciding it for other people's faces. */}
        <CheckLine
          checked={allowsMemberPhoto}
          onChange={onAllowsMemberPhotoChange}
          title={t("cards:designer.memberPhotoCheck")}
          sub={t("cards:designer.memberPhotoHelper")}
        />
        {/* Only while photos are on: it is the follow-up to that decision,
            and offering it beside a switch that is off would describe a card
            nobody is designing. The draft remembers the choice regardless, so
            switching photos off and on again does not reset it. */}
        {allowsMemberPhoto ? (
          <FormField
            label={t("cards:designer.photoStyleLabel")}
            helper={t("cards:designer.photoStyleHelper")}
          >
            <Select
              value={photoStyle}
              onChange={(value) =>
                onPhotoStyleChange((value as CardPhotoStyle | null) ?? "color")
              }
              options={PHOTO_STYLE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
            />
          </FormField>
        ) : null}
      </div>

      <div className={styles.group}>
        <div className={styles.groupLabel}>
          {t("cards:designer.crestLabel")}
        </div>
        <p className={styles.groupHelper}>{t("cards:designer.crestHelper")}</p>
        {/* Reuses the `group-avatar` upload kind: same job (a small square
            emblem), same size and dimension caps, and it keeps the crest on
            the repo's one presign → PUT → key pipeline rather than adding a
            near-duplicate kind on both sides of the API. */}
        <div className={styles.crestSlot}>
          <ImageUploadField
            value={crestKey}
            onChange={onCrestChange}
            onPreviewChange={onCrestPreviewChange}
            kind="group-avatar"
            size={72}
            placeholder={t("cards:designer.crestLabel")}
          />
        </div>
      </div>

      <FormField
        label={t("cards:designer.validityLabel")}
        helper={validityHelper}
      >
        <Select
          value={validityToSelectValue(validityMonths)}
          onChange={(value) => onValidityChange(selectValueToValidity(value))}
          options={VALIDITY_OPTIONS.map((option) => ({
            value: validityToSelectValue(option.value),
            label: t(option.labelKey),
          }))}
        />
      </FormField>
    </div>
  );
}
