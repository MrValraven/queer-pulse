import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { focusControl } from "../../shared/lib/focusFirstError";
import {
  STUDIO_CLAIM_LIMITS,
  type StudioClaimantRole,
} from "./api/studioSafety.types";
import { useFileStudioClaim } from "./api/useStudioClaims";
import { studioClaimsPath } from "./studioClaimPaths";
import {
  EMPTY_CLAIM_DRAFT,
  claimBodyOf,
  claimDraftErrors,
  claimSubmitErrorKeyOf,
  type StudioClaimDraft,
} from "./studioClaimDraft";
import css from "./StudioClaimPages.module.css";

const ROLE_LABEL_KEY: Record<StudioClaimantRole, string> = {
  rights_holder: "studio:claims.form.role.rightsHolder",
  authorised: "studio:claims.form.role.authorised",
};

/** An error line in a FormField's slot: the icon beside the words. */
function ErrorText({ text }: { text: string }) {
  return (
    <span className={css.errorText}>
      <FiAlertCircle aria-hidden />
      {text}
    </span>
  );
}

/** A field's error outside FormField, in the same look, folding in. */
function ErrorLine({ id, text }: { id: string; text: string | undefined }) {
  return (
    <Collapse isOpen={text !== undefined}>
      <p id={id} className={css.error}>
        <FiAlertCircle aria-hidden />
        {text}
      </p>
    </Collapse>
  );
}

/** "Who are you to this work?": two radio cards, required. */
function ClaimRoleField({
  role,
  error,
  firstRadioRef,
  onChange,
}: {
  role: StudioClaimantRole | null;
  error: string | undefined;
  firstRadioRef: RefObject<HTMLInputElement | null>;
  onChange: (role: StudioClaimantRole) => void;
}) {
  const { t } = useTranslation();
  const errorId = useId();
  return (
    <fieldset className={css.fieldset}>
      <legend className={css.legend}>
        {t("studio:claims.form.roleLegend")}{" "}
        <span className={css.required} aria-hidden>
          *
        </span>
      </legend>
      <div className={css.choices}>
        {(["rights_holder", "authorised"] as const).map((option, index) => (
          <label
            key={option}
            className={[css.choice, role === option && css.choiceChecked]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              ref={index === 0 ? firstRadioRef : undefined}
              type="radio"
              name="claimant-role"
              value={option}
              required
              checked={role === option}
              aria-describedby={error ? errorId : undefined}
              onChange={() => onChange(option)}
            />
            {t(ROLE_LABEL_KEY[option])}
          </label>
        ))}
      </div>
      <ErrorLine id={errorId} text={error} />
    </fieldset>
  );
}

/** The copyright claim (spec 8): who the member is to the work, the
 *  original, a link, the details, the good-faith statement, "Send claim".
 *  Errors show after the first press, and focus lands on the first field
 *  that needs the member; nothing is sent twice. */
export function StudioClaimForm({ trackId }: { trackId: string | null }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reducedMotion } = useMotionPrefs();
  const navigate = useNavigate();
  const fileClaim = useFileStudioClaim();
  const goodFaithErrorId = useId();
  const roleRef = useRef<HTMLInputElement>(null);
  const originalWorkRef = useRef<HTMLInputElement>(null);
  const originalLinkRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const goodFaithRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<StudioClaimDraft>(EMPTY_CLAIM_DRAFT);
  const [hasTried, setHasTried] = useState(false);
  const errors = hasTried ? claimDraftErrors(draft) : {};
  const fieldError = (field: keyof StudioClaimDraft) =>
    errors[field] ? t(errors[field]) : undefined;
  const fieldErrorNode = (field: keyof StudioClaimDraft) => {
    const text = fieldError(field);
    return text === undefined ? undefined : <ErrorText text={text} />;
  };
  const alertKey =
    hasTried && trackId === null
      ? "studio:claims.form.error.pickTrack"
      : fileClaim.error
        ? claimSubmitErrorKeyOf(fileClaim.error)
        : null;

  function change(patch: Partial<StudioClaimDraft>) {
    setDraft((previous) => ({ ...previous, ...patch }));
    if (fileClaim.error) fileClaim.reset();
  }

  function focusFirstInvalid() {
    const nextErrors = claimDraftErrors(draft);
    const fieldsInOrder = [
      { isInvalid: Boolean(nextErrors.claimantRole), element: roleRef.current },
      {
        isInvalid: Boolean(nextErrors.originalWork),
        element: originalWorkRef.current,
      },
      {
        isInvalid: Boolean(nextErrors.originalLink),
        element: originalLinkRef.current,
      },
      { isInvalid: Boolean(nextErrors.details), element: detailsRef.current },
      {
        isInvalid: Boolean(nextErrors.isGoodFaith),
        element: goodFaithRef.current,
      },
    ];
    const firstInvalid = fieldsInOrder.find((field) => field.isInvalid);
    if (firstInvalid) focusControl(firstInvalid.element, { reducedMotion });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fileClaim.isPending) return;
    setHasTried(true);
    const body = claimBodyOf(draft);
    if (!body) {
      focusFirstInvalid();
      return;
    }
    if (trackId === null) return;
    fileClaim.mutate(
      { trackId, body },
      {
        onSuccess: (claim) => {
          showToast(t("studio:claims.form.sent"), "success");
          void navigate(studioClaimsPath(claim.id));
        },
      },
    );
  }

  return (
    <form className={css.form} onSubmit={submit} noValidate>
      <ClaimRoleField
        role={draft.claimantRole}
        error={fieldError("claimantRole")}
        firstRadioRef={roleRef}
        onChange={(role) => change({ claimantRole: role })}
      />
      <FormField
        label={t("studio:claims.form.originalWork.label")}
        error={fieldErrorNode("originalWork")}
        required
      >
        <input
          ref={originalWorkRef}
          type="text"
          value={draft.originalWork}
          maxLength={STUDIO_CLAIM_LIMITS.originalWorkMax}
          onChange={(event) => change({ originalWork: event.target.value })}
        />
      </FormField>
      <FormField
        label={t("studio:claims.form.originalLink.label")}
        helper={t("studio:claims.form.originalLink.hint")}
        error={fieldErrorNode("originalLink")}
      >
        <input
          ref={originalLinkRef}
          type="url"
          inputMode="url"
          value={draft.originalLink}
          maxLength={STUDIO_CLAIM_LIMITS.originalLinkMax}
          onChange={(event) => change({ originalLink: event.target.value })}
        />
      </FormField>
      <FormField
        label={t("studio:claims.form.details.label")}
        helper={t("studio:claims.form.details.hint")}
        error={fieldErrorNode("details")}
        required
      >
        <textarea
          ref={detailsRef}
          rows={6}
          value={draft.details}
          maxLength={STUDIO_CLAIM_LIMITS.detailsMax}
          onChange={(event) => change({ details: event.target.value })}
        />
      </FormField>
      <label className={css.goodFaith}>
        <input
          ref={goodFaithRef}
          type="checkbox"
          required
          checked={draft.isGoodFaith}
          aria-invalid={errors.isGoodFaith ? true : undefined}
          aria-describedby={errors.isGoodFaith ? goodFaithErrorId : undefined}
          onChange={(event) => change({ isGoodFaith: event.target.checked })}
        />
        {t("studio:claims.form.goodFaith")}
      </label>
      <ErrorLine id={goodFaithErrorId} text={fieldError("isGoodFaith")} />
      <Collapse isOpen={alertKey !== null}>
        <p className={css.error} role="alert">
          <FiAlertCircle aria-hidden />
          {alertKey ? t(alertKey) : null}
        </p>
      </Collapse>
      <div>
        <Button
          type="submit"
          variant="primary"
          className={css.submit}
          aria-disabled={fileClaim.isPending || undefined}
        >
          {t(
            fileClaim.isPending
              ? "studio:claims.form.sending"
              : "studio:claims.form.submit",
          )}
        </Button>
      </div>
    </form>
  );
}
