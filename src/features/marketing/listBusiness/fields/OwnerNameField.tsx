import { useEffect, useRef, useState } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "./OwnerNameField.module.css";

/**
 * The name printed on the public listing. By default it IS the signed-in
 * member's account name: the input is read-only and the draft follows the
 * account, so a later account rename carries through. A different name is
 * opt-in through one quiet button under the field, which unlocks the input
 * with the whole value selected so typing replaces it. The same button, its
 * label swapped, goes back to the account name, and keyboard focus stays on it.
 *
 * A draft or saved listing that already carries a different name opens in
 * custom mode, so reopening it never overwrites what the owner chose. With no
 * account name at all (the admin console passes an empty one) the field is a
 * plain editable input with no toggle.
 *
 * `ANCHOR.ownerName` stays on the FormField wrapper in every mode: the
 * missing-field jump and the server's 422 routing both scroll to it.
 */
export function OwnerNameField({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const accountName = userName.trim();
  const hasAccountName = accountName !== "";

  const [isCustomName, setIsCustomName] = useState(() => {
    const savedName = draft.ownerName.trim();
    return savedName !== "" && savedName !== accountName;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldFocusInputRef = useRef(false);
  // The account name the draft was last kept in step with, so a rename can
  // be told apart from a name that arrived from somewhere else.
  const lastAccountNameRef = useRef(accountName);

  // Account mode keeps the draft equal to the account name. An empty seed or
  // the previous account name gets replaced; any other name was brought in by
  // a restored or resumed draft, so the field switches to custom mode and
  // keeps it.
  useEffect(() => {
    const previousAccountName = lastAccountNameRef.current;
    lastAccountNameRef.current = accountName;
    if (!hasAccountName || isCustomName) return;
    if (draft.ownerName === accountName) return;
    const currentName = draft.ownerName.trim();
    if (
      currentName === "" ||
      currentName === accountName ||
      currentName === previousAccountName
    ) {
      set({ ownerName: accountName });
      return;
    }
    setIsCustomName(true);
  }, [accountName, hasAccountName, isCustomName, draft.ownerName, set]);

  // Focus and select once the input is editable, after the click re-renders.
  useEffect(() => {
    if (!isCustomName || !shouldFocusInputRef.current) return;
    shouldFocusInputRef.current = false;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isCustomName]);

  const label = t("marketing:listBusiness.step4.ownerNameLabel");
  const placeholder = t("marketing:listBusiness.step4.ownerNamePlaceholder");

  if (!hasAccountName) {
    return (
      <FormField
        className={pageStyles.lbField}
        id={ANCHOR.ownerName}
        label={label}
        required
      >
        <input
          type="text"
          maxLength={50}
          placeholder={placeholder}
          value={draft.ownerName}
          onChange={(event) => set({ ownerName: event.target.value })}
        />
      </FormField>
    );
  }

  const toggleNameSource = () => {
    if (isCustomName) {
      setIsCustomName(false);
      set({ ownerName: accountName });
      return;
    }
    shouldFocusInputRef.current = true;
    setIsCustomName(true);
  };

  return (
    <div className={styles.nameField}>
      <FormField
        className={pageStyles.lbField}
        id={ANCHOR.ownerName}
        label={label}
        required
        helper={t(
          isCustomName
            ? "marketing:listBusiness.step4.ownerNameCustomHelper"
            : "marketing:listBusiness.step4.ownerNameFromAccount",
        )}
      >
        {isCustomName ? (
          <input
            ref={inputRef}
            type="text"
            maxLength={50}
            placeholder={placeholder}
            value={draft.ownerName}
            onChange={(event) => set({ ownerName: event.target.value })}
          />
        ) : (
          <input type="text" readOnly value={accountName} />
        )}
      </FormField>
      <button
        type="button"
        className={styles.sourceToggle}
        onClick={toggleNameSource}
      >
        {t(
          isCustomName
            ? "marketing:listBusiness.step4.ownerNameUseAccount"
            : "marketing:listBusiness.step4.ownerNameUseCustom",
        )}
      </button>
    </div>
  );
}
