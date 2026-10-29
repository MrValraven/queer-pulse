import { useId, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, CheckLine, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LANDING_LIMITS } from "../studio/api/studio.types";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { usePutLandingPhoto } from "./api/useStudioAdminLandingMutations";
import type {
  AdminStudioLandingPhotoDTO,
  StudioLandingPhotoSlot,
} from "./api/studioLandingAdmin.api";
import { landingPhotoErrorKeyOf } from "./studioAdmin.model";
import css from "./StudioAdminLandingCards.module.css";

/** A text field with its remaining-characters line. */
function CountedField({
  label,
  value,
  maxLength,
  helpText,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  helpText?: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const helpId = useId();
  const counterId = useId();
  return (
    <>
      <label htmlFor={fieldId} className={css.fieldLabel}>
        {label}
      </label>
      <input
        id={fieldId}
        type="text"
        className={css.textInput}
        value={value}
        maxLength={maxLength}
        aria-describedby={helpText ? `${helpId} ${counterId}` : counterId}
        onChange={(event) => onChange(event.target.value)}
      />
      {helpText && (
        <p id={helpId} className={css.fieldHint}>
          {helpText}
        </p>
      )}
      <p id={counterId} className={css.fieldHint}>
        {t("messages:request.charactersLeft", {
          remaining: maxLength - value.length,
        })}
      </p>
    </>
  );
}

/** Add or replace the photo of a slot: the image, a description in each
 *  language, an optional credit and the consent tick (unticked on every
 *  save). Keeping the stored image sends the slot's own key back. */
export function StudioAdminLandingPhotoDialog({
  slot,
  slotLabel,
  photo,
  onClose,
}: {
  slot: StudioLandingPhotoSlot;
  /** The slot's name, shown as the dialog title. */
  slotLabel: string;
  photo: AdminStudioLandingPhotoDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const put = usePutLandingPhoto();
  /** Undefined keeps the stored photo; "" is a cleared field. */
  const [pickedKey, setPickedKey] = useState<string | undefined>(undefined);
  const [altTextEn, setAltTextEn] = useState(photo?.altText.en ?? "");
  const [altTextPt, setAltTextPt] = useState(photo?.altText.pt ?? "");
  const [credit, setCredit] = useState(photo?.credit ?? "");
  const [hasConsent, setHasConsent] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const imageKey = pickedKey ?? photo?.imageKey ?? "";
  const isReady =
    imageKey !== "" &&
    altTextEn.trim() !== "" &&
    altTextPt.trim() !== "" &&
    hasConsent;

  function submit() {
    if (put.isPending || !isReady) return;
    setErrorKey(null);
    put.mutate(
      {
        slot,
        imageKey,
        altTextEn: altTextEn.trim(),
        altTextPt: altTextPt.trim(),
        credit: credit.trim() === "" ? null : credit.trim(),
        hasConsent: true,
      },
      {
        onSuccess: () => {
          showToast(t("admin:studioAdmin.landing.photos.saved"), "success");
          onClose();
        },
        onError: (cause) => setErrorKey(landingPhotoErrorKeyOf(cause)),
      },
    );
  }

  return (
    <Modal
      title={slotLabel}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={!isReady || put.isPending || undefined}
            aria-busy={put.isPending || undefined}
            onClick={submit}
          >
            {t("admin:studioAdmin.landing.photoDialog.saveCta")}
          </Button>
        </>
      }
    >
      <form
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <span className={css.fieldLabel}>
          {t("admin:studioAdmin.landing.photoDialog.imageLabel")}
        </span>
        <ImageUploadField
          value={pickedKey ?? photo?.url ?? ""}
          onChange={setPickedKey}
          kind="work-image"
          size={160}
          addLabel={t("admin:studioAdmin.landing.photos.addCta")}
          changeLabel={t("admin:studioAdmin.landing.photos.replaceCta")}
          placeholder={t("admin:studioAdmin.landing.photos.empty")}
        />
        <CountedField
          label={t("admin:studioAdmin.landing.photoDialog.altEnLabel")}
          helpText={t("admin:studioAdmin.landing.photoDialog.altHelp")}
          value={altTextEn}
          maxLength={STUDIO_LANDING_LIMITS.photoAltMaxLength}
          onChange={setAltTextEn}
        />
        <CountedField
          label={t("admin:studioAdmin.landing.photoDialog.altPtLabel")}
          value={altTextPt}
          maxLength={STUDIO_LANDING_LIMITS.photoAltMaxLength}
          onChange={setAltTextPt}
        />
        <CountedField
          label={t("admin:studioAdmin.landing.photoDialog.creditLabel")}
          value={credit}
          maxLength={STUDIO_LANDING_LIMITS.photoCreditMaxLength}
          onChange={setCredit}
        />
        <div className={css.consent}>
          <CheckLine
            checked={hasConsent}
            onChange={setHasConsent}
            title={t("admin:studioAdmin.landing.photoDialog.consent")}
          />
        </div>
        <Collapse isOpen={errorKey !== null}>
          <p className={css.error} role="alert">
            {errorKey ? t(errorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
