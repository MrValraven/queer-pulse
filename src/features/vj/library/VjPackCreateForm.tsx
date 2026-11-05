import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { ApiError } from "../../../shared/api/client";
import { VJ_LIMITS, type VjPackDTO } from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCreateVjPack } from "../api/useVjPackMutations";
import { VjReasonLine } from "../VjReasonLine";
import styles from "./VjPacks.module.css";

/** A blank name never leaves the browser; it reads like the server's own
 *  refusal, so the reason line names it the same way. */
const BLANK_NAME_REFUSAL = new ApiError(400, "VJ_PACK_NAME_REQUIRED", {
  statusCode: 400,
  code: "VJ_PACK_NAME_REQUIRED",
});

export interface VjPackNameFormProps {
  initialName: string;
  submitLabel: string;
  placeholder?: string;
  isPending: boolean;
  /** The server's refusal for the last save, shown under the field. */
  refusal: unknown;
  onSubmit: (name: string) => void;
}

/** A pack name field and its save button, shared by Create pack and Rename
 *  pack. It takes focus when it opens. */
export function VjPackNameForm({
  initialName,
  submitLabel,
  placeholder,
  isPending,
  refusal,
  onSubmit,
}: VjPackNameFormProps) {
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
      <FormField label={t("vj:packs.create.label")}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          placeholder={placeholder}
          maxLength={VJ_LIMITS.packNameMax}
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            setIsBlankRefused(false);
          }}
        />
      </FormField>
      <VjReasonLine error={isBlankRefused ? BLANK_NAME_REFUSAL : refusal} />
      <Button
        type="submit"
        size="sm"
        className={styles.nameSubmit}
        aria-disabled={isPending ? "true" : undefined}
      >
        {submitLabel}
      </Button>
    </form>
  );
}

/**
 * "New pack" opens a name field under it. A created pack toasts, folds the
 * field away and hands the pack to `onCreated`, which selects it.
 */
export function VjPackCreateForm({
  onCreated,
}: {
  onCreated: (pack: VjPackDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createPack = useCreateVjPack();
  const [isOpen, setIsOpen] = useState(false);
  const [refusal, setRefusal] = useState<unknown>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    setRefusal(null);
    setIsOpen((wasOpen) => !wasOpen);
  };

  const create = async (name: string) => {
    setRefusal(null);
    try {
      const pack = await createPack.mutateAsync({ name });
      showToast(t("vj:packs.toast.created", { name: pack.name }), "success");
      setIsOpen(false);
      // The field that held focus folds away; focus goes back to its opener.
      openerRef.current?.focus({ preventScroll: true });
      onCreated(pack);
    } catch (cause) {
      setRefusal(cause);
    }
  };

  return (
    <div className={styles.create}>
      <Button
        ref={openerRef}
        variant="quiet"
        size="sm"
        className={styles.createOpen}
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <FiPlus aria-hidden="true" fill="none" focusable="false" />
        {t("vj:packs.create.open")}
      </Button>
      <Collapse isOpen={isOpen}>
        <VjPackNameForm
          initialName=""
          submitLabel={t("vj:packs.create.submit")}
          placeholder={t("vj:packs.create.placeholder")}
          isPending={createPack.isPending}
          refusal={refusal}
          onSubmit={(name) => void create(name)}
        />
      </Collapse>
    </div>
  );
}
