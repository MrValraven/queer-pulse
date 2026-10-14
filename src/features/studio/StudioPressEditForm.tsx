import { useEffect, useId, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioPressKitView } from "./api/studio.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import { STUDIO_PRESS } from "./api/studio.types";
import { useSaveStudioPressKit } from "./api/useStudioPressKit";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { studioPressPath } from "./studioPaths";
import {
  bodyFromPressForm,
  formFromOwner,
  hasStudioPressKitFormErrors,
  savedTrackOptions,
  studioPressKitFormErrors,
  type PressTrackListStatus,
  type PressTrackOption,
  type StudioPressKitForm,
  type StudioPressKitFormErrors,
} from "./studioPressEdit";
import { StudioPressQuotesField } from "./StudioPressQuotesField";
import { StudioPressTrackPicker } from "./StudioPressTrackPicker";
import s from "./creator.module.css";
import styles from "./StudioPressEdit.module.css";

type PatchForm = (next: Partial<StudioPressKitForm>) => void;

/** The scheme itself, the same in every language. */
const CONTACT_PLACEHOLDER = "mailto:";

/** An error line under its field, folding in and out. */
function FieldError({ id, errorKey }: { id: string; errorKey?: string }) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={errorKey !== undefined}>
      <p id={id} className={s.fieldError}>
        {errorKey ? t(errorKey) : ""}
      </p>
    </Collapse>
  );
}

/** Pitch and press bio, each counted against its limit. */
function PressTextFields({
  form,
  errors,
  bioPlaceholder,
  patch,
}: {
  form: StudioPressKitForm;
  errors: StudioPressKitFormErrors;
  bioPlaceholder: string;
  patch: PatchForm;
}) {
  const { t } = useTranslation();
  const pitchId = useId();
  const pitchErrorId = useId();
  const bioId = useId();
  const bioErrorId = useId();
  return (
    <>
      <div className={s.field}>
        <label htmlFor={pitchId}>{t("studio:pressEdit.pitchLabel")}</label>
        <input
          id={pitchId}
          type="text"
          value={form.pitch}
          maxLength={STUDIO_PRESS.pitchMax}
          aria-invalid={errors.pitch ? true : undefined}
          aria-describedby={errors.pitch ? pitchErrorId : undefined}
          onChange={(event) => patch({ pitch: event.target.value })}
        />
        <p className={s.fieldCount}>
          {t("studio:pressEdit.count", {
            count: form.pitch.length,
            max: STUDIO_PRESS.pitchMax,
          })}
        </p>
        <FieldError id={pitchErrorId} errorKey={errors.pitch} />
      </div>
      <div className={s.field}>
        <label htmlFor={bioId}>{t("studio:pressEdit.bioLabel")}</label>
        <textarea
          id={bioId}
          rows={6}
          value={form.pressBio}
          maxLength={STUDIO_PRESS.bioMax}
          placeholder={bioPlaceholder}
          aria-invalid={errors.pressBio ? true : undefined}
          aria-describedby={errors.pressBio ? bioErrorId : undefined}
          onChange={(event) => patch({ pressBio: event.target.value })}
        />
        <p className={s.fieldCount}>
          {t("studio:pressEdit.count", {
            count: form.pressBio.length,
            max: STUDIO_PRESS.bioMax,
          })}
        </p>
        <FieldError id={bioErrorId} errorKey={errors.pressBio} />
        <p className={s.fhint}>{t("studio:pressEdit.bioHint")}</p>
      </div>
    </>
  );
}

/** The press contact: a https:// page or a mailto: address. The hint line
 *  turns into the error line when the value is refused. */
function PressContactField({
  value,
  errorKey,
  patch,
}: {
  value: string;
  errorKey?: string;
  patch: PatchForm;
}) {
  const { t } = useTranslation();
  const contactId = useId();
  const contactHintId = useId();
  return (
    <div className={s.field}>
      <label htmlFor={contactId}>{t("studio:pressEdit.contactLabel")}</label>
      <input
        id={contactId}
        type="text"
        inputMode="url"
        autoComplete="off"
        value={value}
        maxLength={STUDIO_PRESS.contactMax}
        placeholder={CONTACT_PLACEHOLDER}
        aria-invalid={errorKey ? true : undefined}
        aria-describedby={contactHintId}
        onChange={(event) => patch({ contact: event.target.value })}
      />
      <p id={contactHintId} className={errorKey ? s.fieldError : s.fhint}>
        {t(errorKey ?? "studio:pressEdit.contactHint")}
      </p>
    </div>
  );
}

const NO_ERRORS: StudioPressKitFormErrors = { quotes: [] };

export function StudioPressEditForm({
  pressKit,
  trackOptions,
  trackStatus,
  tracksLoadState,
  onRefreshTracks,
}: {
  pressKit: StudioPressKitView;
  /** The persona's playable tracks, from its numbers. */
  trackOptions: PressTrackOption[];
  trackStatus: PressTrackListStatus;
  tracksLoadState: StudioLoadState;
  /** Reads the persona's tracks again, after the server refused a pick. */
  onRefreshTracks: () => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const save = useSaveStudioPressKit();
  const formRef = useRef<HTMLDivElement>(null);
  // Each blocked Save asks once more, so a second press still moves focus.
  const [invalidFocusRequest, setInvalidFocusRequest] = useState(0);
  const [form, setForm] = useState<StudioPressKitForm>(() =>
    formFromOwner(pressKit.owner),
  );
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [refusalKey, setRefusalKey] = useState<string | null>(null);
  // After a refusal only a fresh read of the tracks says what still plays.
  const [isTrustingFreshTracks, setIsTrustingFreshTracks] = useState(false);
  const [isRefreshingTracks, setIsRefreshingTracks] = useState(false);
  const errors = studioPressKitFormErrors(form);
  const shownErrors = shouldShowErrors ? errors : NO_ERRORS;
  const subprofileId = pressKit.artist.id;
  const statsIds = new Set(trackOptions.map((option) => option.id));
  // A failed fresh read keeps the saved names on screen.
  const knownOptions =
    isTrustingFreshTracks && trackStatus === "ready"
      ? trackOptions
      : [
          ...trackOptions,
          ...savedTrackOptions(pressKit).filter(
            (option) => !statsIds.has(option.id),
          ),
        ];
  const shownTrackStatus = isRefreshingTracks ? "loading" : trackStatus;

  useEffect(() => {
    if (invalidFocusRequest > 0)
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
  }, [invalidFocusRequest]);

  const patch: PatchForm = (next) => {
    setStatusKey(null);
    if (next.featuredTrackIds) setRefusalKey(null);
    setForm((previous) => ({ ...previous, ...next }));
  };

  async function refreshAfterRefusal() {
    setIsTrustingFreshTracks(true);
    setIsRefreshingTracks(true);
    try {
      await onRefreshTracks();
    } finally {
      setIsRefreshingTracks(false);
    }
  }

  async function submit() {
    if (save.isPending) return;
    if (hasStudioPressKitFormErrors(errors)) {
      setShouldShowErrors(true);
      setInvalidFocusRequest((request) => request + 1);
      return;
    }
    setErrorKey(null);
    setRefusalKey(null);
    try {
      await save.mutateAsync({ subprofileId, body: bodyFromPressForm(form) });
      setShouldShowErrors(false);
      setStatusKey("studio:pressEdit.savedStatus");
    } catch (error) {
      if (studioErrorCodeOf(error) === "studio_press_track_not_allowed") {
        setRefusalKey(studioErrorMessageKeyOf(error));
        await refreshAfterRefusal();
      } else setErrorKey(studioErrorMessageKeyOf(error));
    }
  }

  return (
    <div ref={formRef} className={`${s.card} ${styles.form}`}>
      <div className={s.cardH}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey="studio:pressEdit.heading"
            values={{ name: pressKit.artist.name }}
            components={{ em: <em /> }}
          />
        </h2>
        <div className={s.cardSub}>{t("studio:pressEdit.sub")}</div>
      </div>
      <PressTextFields
        form={form}
        errors={shownErrors}
        bioPlaceholder={pressKit.artist.bio ?? ""}
        patch={patch}
      />
      <fieldset className={styles.group}>
        <legend className={styles.legend}>
          {t("studio:pressEdit.tracksLegend")}
        </legend>
        <StudioPressTrackPicker
          trackIds={form.featuredTrackIds}
          options={knownOptions}
          addableOptions={trackOptions.filter(
            (option) => !form.featuredTrackIds.includes(option.id),
          )}
          status={shownTrackStatus}
          tracksLoadState={tracksLoadState}
          refusalKey={refusalKey}
          onChange={(featuredTrackIds) => patch({ featuredTrackIds })}
        />
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>
          {t("studio:pressEdit.quotesLegend")}
        </legend>
        <StudioPressQuotesField
          quotes={form.quotes}
          errors={shownErrors.quotes}
          onChange={(quotes) => patch({ quotes })}
        />
      </fieldset>
      <PressContactField
        value={form.contact}
        errorKey={shownErrors.contact}
        patch={patch}
      />
      <div className={s.stepNav}>
        <Button
          onClick={() => void submit()}
          aria-disabled={save.isPending || undefined}
        >
          {save.isPending
            ? t("studio:pressEdit.saving")
            : t("studio:pressEdit.saveCta")}
        </Button>
        <Button variant="ghost" to={studioPressPath(subprofileId)}>
          {t("studio:pressEdit.viewCta")} <FiArrowRight aria-hidden />
        </Button>
        <p className={s.saveStatus} role="status">
          {statusKey ? t(statusKey) : ""}
        </p>
      </div>
      <div role="alert">
        <Collapse isOpen={errorKey !== null}>
          <p className={styles.lineError}>{errorKey ? t(errorKey) : ""}</p>
        </Collapse>
      </div>
    </div>
  );
}
