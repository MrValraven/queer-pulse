import { useState } from "react";
import { Button, FormField, Modal, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useCardProgram,
  useIssueAllCards,
  useUpsertCardProgram,
} from "./api/useCardProgram";
import type { CardSkin } from "./api/cards.api";
import { MembershipCardFace } from "./MembershipCardFace";
import {
  ACCENT_OPTIONS,
  CARD_SKIN_OPTIONS,
  VALIDITY_OPTIONS,
  previewCard,
  selectValueToValidity,
  validityToSelectValue,
} from "./cardDesigner.data";
import styles from "./CardDesignerModal.module.css";

export function CardDesignerModal({
  slug,
  communityName,
  onClose,
}: {
  slug: string;
  communityName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { program } = useCardProgram(slug);
  const upsert = useUpsertCardProgram(slug);
  const issueAll = useIssueAllCards(slug);

  const [skin, setSkin] = useState<CardSkin>(program?.skin ?? "plum");
  const [accentToken, setAccentToken] = useState(
    program?.accentToken ?? "accent",
  );
  const [cardName, setCardName] = useState(program?.cardName ?? "");
  const [validityMonths, setValidityMonths] = useState<number | null>(
    program?.validityMonths ?? null,
  );

  const isSaving = upsert.isPending || issueAll.isPending;

  const save = async () => {
    try {
      // Editing must not silently flip a paused programme back on. A
      // programme that doesn't exist yet defaults to enabled (there is
      // nothing to pause); an existing one keeps whatever enabled state it
      // already had, and only ModToolsCardSection's dedicated pause/resume
      // toggle changes that.
      const isEnabled = program?.isEnabled ?? true;
      await upsert.mutateAsync({
        isEnabled,
        skin,
        accentToken,
        cardName: cardName.trim() || t("cards:designer.defaultCardName"),
        validityMonths,
        // Phase 1 has no profile badge to gate (spec §J is Phase 3); the DTO
        // still requires the field, so this keeps sending the value the
        // backend already stores rather than exposing a control for a
        // feature that does not exist yet.
        allowsPublicBadge: true,
      });
      // Re-issuing to the whole roster only makes sense for a live
      // programme. A paused one has no active holders to push a reissue to,
      // and doing it anyway would be the exact silent mass-reissue this
      // guard exists to prevent.
      if (isEnabled) {
        const result = await issueAll.mutateAsync();
        showToast(
          t("cards:designer.saved", { count: result.issued }),
          "success",
        );
      } else {
        showToast(t("cards:designer.savedPaused"), "success");
      }
      onClose();
    } catch {
      // Both calls carry the global error toast on failure via the query
      // client's default handling in most flows, but this sequence has no
      // caller left to show it once the modal unmounts on success — surface
      // it here explicitly instead.
      showToast(t("common:toast.saveFailed"), "error");
    }
  };

  return (
    <Modal
      title={t("cards:designer.ariaLabel")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {t("communities:edit.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void save()}
            disabled={isSaving}
          >
            {isSaving ? t("communities:edit.saving") : t("cards:designer.save")}
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <div className={styles.preview}>
          <MembershipCardFace
            card={previewCard(
              communityName,
              cardName || t("cards:designer.defaultCardName"),
              skin,
              accentToken,
            )}
            isActive={false}
          />
        </div>

        <CardDesignerFields
          cardName={cardName}
          onCardNameChange={setCardName}
          skin={skin}
          onSkinChange={setSkin}
          accentToken={accentToken}
          onAccentChange={setAccentToken}
          validityMonths={validityMonths}
          onValidityChange={setValidityMonths}
        />
      </div>
    </Modal>
  );
}

/** The form controls, split out of `CardDesignerModal` to keep each
 *  component under the repo's 200-line limit. */
function CardDesignerFields({
  cardName,
  onCardNameChange,
  skin,
  onSkinChange,
  accentToken,
  onAccentChange,
  validityMonths,
  onValidityChange,
}: {
  cardName: string;
  onCardNameChange: (value: string) => void;
  skin: CardSkin;
  onSkinChange: (value: CardSkin) => void;
  accentToken: string;
  onAccentChange: (value: string) => void;
  validityMonths: number | null;
  onValidityChange: (value: number | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.fields}>
      <FormField label={t("cards:designer.cardNameLabel")}>
        <input
          type="text"
          value={cardName}
          maxLength={32}
          onChange={(event) => onCardNameChange(event.target.value)}
          placeholder={t("cards:designer.cardNamePlaceholder")}
        />
      </FormField>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {t("cards:designer.skinLabel")}
        </legend>
        <div className={styles.skins}>
          {CARD_SKIN_OPTIONS.map((option) => (
            <label key={option.value} className={styles.skinOption}>
              <input
                type="radio"
                name="card-skin"
                value={option.value}
                checked={skin === option.value}
                onChange={() => onSkinChange(option.value)}
              />
              <span
                className={styles.swatch}
                data-skin={option.value}
                aria-hidden="true"
              />
              <span>{t(option.labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label={t("cards:designer.accentLabel")}>
        <Select
          value={accentToken}
          onChange={(value) => onAccentChange(value ?? "accent")}
          options={ACCENT_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
        />
      </FormField>

      <FormField label={t("cards:designer.validityLabel")}>
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
