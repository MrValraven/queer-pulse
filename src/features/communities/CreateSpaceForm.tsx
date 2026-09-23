import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import type { AccessTier, CreateSubcommunityBody } from "./api/communities.api";
import { useCreateSubcommunity } from "./api/useCreateSubcommunity";
import { handleFromName, toFinalHandle, toHandleDraft } from "./spaceHandle";
import {
  SpaceBasicsFields,
  type SpaceBasicsField,
  type SpaceBasicsValues,
} from "./SpaceBasicsFields";
import { SpaceTierPicker } from "./SpaceTierPicker";
import { SpaceRulesField } from "./SpaceRulesField";
import styles from "./CreateSpaceForm.module.css";

const EMPTY_BASICS: SpaceBasicsValues = {
  name: "",
  handle: "",
  tagline: "",
  purpose: "",
};

/** The four basics in the order they sit on screen. */
const BASICS_ORDER: readonly SpaceBasicsField[] = [
  "name",
  "handle",
  "tagline",
  "purpose",
];

/**
 * Whether a basics field holds something the backend will accept. The
 * address is judged as it will be sent, so one that finalizes to nothing
 * counts as missing.
 */
function isBasicsFieldFilled(
  basics: SpaceBasicsValues,
  field: SpaceBasicsField,
): boolean {
  const value =
    field === "handle" ? toFinalHandle(basics.handle) : basics[field].trim();
  return value.length > 0;
}

/**
 * The backend suffixes a taken handle itself, so its one 409 here means
 * platform staff turned "Allow spaces" off for this community. No field on
 * the form can fix that, so the toast names the cause.
 */
function isSpacesNotAllowedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 409 &&
    (error.data as { code?: string } | undefined)?.code ===
      "SUBCOMMUNITIES_NOT_ALLOWED"
  );
}

interface CreateSpaceFormProps {
  parentSlug: string;
  parentName: string;
  /** The parent's own tier: a space may never sit more open than it. */
  parentTier: AccessTier;
  /** Called with the new space's slug once the server confirms it exists. */
  onCreated: (slug: string) => void;
  /** Closes the form and drops the draft: Cancel always, Escape only while
   *  nothing has been entered yet. */
  onCancel?: () => void;
}

/**
 * Founds a space under `parentSlug`, mirroring the fields `StartCommunity`
 * collects across a whole wizard, in one card a moderator fills top to
 * bottom. `rules` here are the space's own additions; the parent's rules
 * inherit down automatically and are never re-typed here.
 */
export function CreateSpaceForm({
  parentSlug,
  parentName,
  parentTier,
  onCreated,
  onCancel,
}: CreateSpaceFormProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const create = useCreateSubcommunity(parentSlug);
  const titleId = useId();
  const footerHintId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const handleInputRef = useRef<HTMLInputElement>(null);
  const taglineInputRef = useRef<HTMLInputElement>(null);
  const purposeInputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [basics, setBasics] = useState<SpaceBasicsValues>(EMPTY_BASICS);
  // Until the moderator types an address of their own, it follows the name.
  const [isHandleEdited, setIsHandleEdited] = useState(false);
  const [accessTier, setAccessTier] = useState<AccessTier>(parentTier);
  const [rules, setRules] = useState<string[]>([]);

  // The host mounts this form only once a moderator asks for it, so mount is
  // the moment to put them in the first field.
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const changeBasics = (field: SpaceBasicsField, value: string) => {
    if (field === "handle") {
      const handle = toHandleDraft(value);
      // Clearing the address hands it back to the name.
      setIsHandleEdited(handle.length > 0);
      setBasics((current) => ({ ...current, handle }));
      return;
    }
    const shouldSyncHandle = field === "name" && !isHandleEdited;
    setBasics((current) => ({
      ...current,
      [field]: value,
      ...(shouldSyncHandle ? { handle: handleFromName(value) } : {}),
    }));
  };

  const reset = () => {
    setBasics(EMPTY_BASICS);
    setIsHandleEdited(false);
    setAccessTier(parentTier);
    setRules([]);
  };

  const isPending = create.isPending;
  const hasRequiredFields = BASICS_ORDER.every((field) =>
    isBasicsFieldFilled(basics, field),
  );
  const canSubmit = hasRequiredFields && !isPending;
  const isDirty =
    Object.values(basics).some((value) => value.length > 0) ||
    rules.length > 0 ||
    accessTier !== parentTier;

  // Escape closes an untouched form, unless a control inside already handled
  // the key. Once anything is entered, Escape leaves the draft alone and
  // Cancel is the one way to discard it. Listening on the document runs
  // after React's own handlers, so a child that called preventDefault or
  // stopPropagation on the key is respected.
  useEffect(() => {
    if (!onCancel || isPending || isDirty) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (event.isComposing) return;
      if (!formRef.current?.contains(event.target as Node)) return;
      event.preventDefault();
      onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, isPending, isDirty]);

  const cancel = () => {
    if (isPending) return;
    onCancel?.();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isPending) return;
    // The submit stays focusable while fields are missing, so an early press
    // lands here and takes the moderator to the first field still empty.
    const firstEmptyField = BASICS_ORDER.find(
      (field) => !isBasicsFieldFilled(basics, field),
    );
    if (firstEmptyField) {
      const fieldRefs = {
        name: nameInputRef,
        handle: handleInputRef,
        tagline: taglineInputRef,
        purpose: purposeInputRef,
      };
      fieldRefs[firstEmptyField].current?.focus();
      return;
    }
    const body: CreateSubcommunityBody = {
      handle: toFinalHandle(basics.handle),
      name: basics.name.trim(),
      tagline: basics.tagline.trim(),
      purpose: basics.purpose.trim(),
      accessTier,
      rules: rules.map((rule) => rule.trim()).filter((rule) => rule.length > 0),
    };
    create.mutate(body, {
      onSuccess: (detail) => {
        showToast(t("communities:spaces.mod.created"), "success");
        reset();
        onCreated(detail.slug);
      },
      onError: (error) => {
        const messageKey = isSpacesNotAllowedError(error)
          ? "communities:spaces.mod.notAllowed"
          : "communities:spaces.mod.createError";
        showToast(t(messageKey), "error");
      },
    });
  };

  return (
    <form
      ref={formRef}
      className={styles.card}
      aria-labelledby={titleId}
      onSubmit={onSubmit}
    >
      <div className={styles.cardHead}>
        <h3 id={titleId} className={styles.cardTitle}>
          {t("communities:spaces.mod.create")}
        </h3>
      </div>

      <SpaceBasicsFields
        values={basics}
        onChange={changeBasics}
        nameInputRef={nameInputRef}
        handleInputRef={handleInputRef}
        taglineInputRef={taglineInputRef}
        purposeInputRef={purposeInputRef}
      />

      <SpaceTierPicker
        value={accessTier}
        onChange={setAccessTier}
        parentTier={parentTier}
        parentName={parentName}
      />

      <SpaceRulesField
        legend={t("communities:spaces.mod.form.rules")}
        hint={t("communities:spaces.mod.form.rulesHint", { name: parentName })}
        rules={rules}
        onChange={setRules}
      />

      <div className={styles.footer}>
        {!hasRequiredFields && (
          <p id={footerHintId} className={styles.footerHint}>
            {t("communities:spaces.mod.form.requiredHint")}
          </p>
        )}
        <div className={styles.footerActions}>
          {onCancel && (
            // aria-disabled keeps focus on Cancel while the request runs, where
            // a real `disabled` would drop it to the page body.
            <Button variant="ghost" onClick={cancel} aria-disabled={isPending}>
              {t("communities:spaces.mod.form.cancel")}
            </Button>
          )}
          {/* aria-disabled keeps the submit in the tab order, so the hint it
              points at is heard and an early press can move focus. */}
          <Button
            type="submit"
            variant="primary"
            aria-disabled={!canSubmit}
            aria-describedby={hasRequiredFields ? undefined : footerHintId}
          >
            {isPending
              ? t("communities:spaces.mod.form.creating")
              : t("communities:spaces.mod.form.submit")}
          </Button>
        </div>
      </div>
    </form>
  );
}
