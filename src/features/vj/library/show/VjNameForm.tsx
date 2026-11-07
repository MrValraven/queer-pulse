import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ApiError } from "../../../../shared/api/client";
import { Button, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../../VjReasonLine";
import styles from "./VjShowParts.module.css";

type VjBlankNameCode = "VJ_SCENE_NAME_REQUIRED" | "VJ_SETLIST_NAME_REQUIRED";

/** A blank name never leaves the browser; it reads like the server's own
 *  refusal, so the reason line names it the same way. */
const BLANK_NAME_REFUSALS: Record<VjBlankNameCode, ApiError> = {
  VJ_SCENE_NAME_REQUIRED: new ApiError(400, "VJ_SCENE_NAME_REQUIRED", {
    statusCode: 400,
    code: "VJ_SCENE_NAME_REQUIRED",
  }),
  VJ_SETLIST_NAME_REQUIRED: new ApiError(400, "VJ_SETLIST_NAME_REQUIRED", {
    statusCode: 400,
    code: "VJ_SETLIST_NAME_REQUIRED",
  }),
};

export interface VjNameFormProps {
  label: string;
  initialName: string;
  submitLabel: string;
  maxLength: number;
  /** The refusal a blank name reads as, before any request. */
  blankCode: VjBlankNameCode;
  isPending: boolean;
  /** The server's refusal for the last save, shown under the field. */
  refusal: unknown;
  onSubmit: (name: string) => void;
  onCancel?: () => void;
  /** The Cancel button's words; "Cancel" when left out. */
  cancelLabel?: string;
  /** Extra fields between the name and the buttons (the scene's pack). */
  children?: ReactNode;
}

/**
 * A name field, its reason line and its buttons, shared by the scene edit,
 * New set list and Rename set list forms. It takes focus when it opens; Escape
 * in the field cancels when the form can be cancelled.
 */
export function VjNameForm({
  label,
  initialName,
  submitLabel,
  maxLength,
  blankCode,
  isPending,
  refusal,
  onSubmit,
  onCancel,
  cancelLabel,
  children,
}: VjNameFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [isBlankRefused, setIsBlankRefused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    const trimmedName = name.trim();
    if (trimmedName === "") {
      setIsBlankRefused(true);
      inputRef.current?.focus();
      return;
    }
    setIsBlankRefused(false);
    onSubmit(trimmedName);
  };

  return (
    <form className={styles.nameForm} onSubmit={handleSubmit} noValidate>
      <FormField label={label}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          maxLength={maxLength}
          autoComplete="off"
          enterKeyHint="done"
          onChange={(event) => {
            setName(event.target.value);
            setIsBlankRefused(false);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || onCancel === undefined) return;
            event.preventDefault();
            onCancel();
          }}
        />
      </FormField>
      <VjReasonLine
        error={isBlankRefused ? BLANK_NAME_REFUSALS[blankCode] : refusal}
      />
      {children}
      <div className={styles.formActions}>
        <Button
          type="submit"
          size="sm"
          aria-disabled={isPending ? "true" : undefined}
        >
          {submitLabel}
        </Button>
        {onCancel === undefined ? null : (
          <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
            {cancelLabel ?? t("vj:libraryScenes.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
