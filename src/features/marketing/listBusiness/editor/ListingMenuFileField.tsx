import { useId, useRef, useState } from "react";
import { FiFileText, FiImage, FiUpload } from "react-icons/fi";
import { Button, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ImageProcessingError } from "../../../members/api/uploadProcessing";
import {
  emptyMenuDraft,
  isMenuLinkValid,
  MENU_LINK_MAX,
} from "../listingMenu.data";
import {
  MENU_FILE_ACCEPT,
  MENU_FILE_MAX_LABEL,
  MenuFileUploadError,
  useUploadListingMenuFile,
} from "../useUploadListingMenuFile";
import type { ListingForm } from "../useListingForm";
import styles from "./ListingMenu.module.css";

/**
 * The owner's full menu as a PDF or a photo, and a link to the menu on their
 * own site. Either, both or neither.
 */
export function ListingMenuFileField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const uploadMenuFile = useUploadListingMenuFile();
  const inputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const menu = form.draft.menu ?? emptyMenuDraft();
  const isPdf = menu.file?.contentType === "application/pdf";

  async function handlePick(file: File | undefined) {
    if (!file) return;
    setErrorMessage(null);
    setIsUploading(true);
    try {
      form.setMenuFile(await uploadMenuFile(file));
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        setErrorMessage(t(error.i18nKey, error.values));
      } else if (error instanceof MenuFileUploadError) {
        setErrorMessage(
          t(`marketing:listBusiness.menu.fileError.${error.code}`, {
            max: MENU_FILE_MAX_LABEL,
          }),
        );
      } else {
        setErrorMessage(t("marketing:listBusiness.menu.fileError.upload"));
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.fileBlock} aria-labelledby={headingId} role="group">
      <h3 id={headingId} className={styles.fileHeading}>
        {t("marketing:listBusiness.menu.fileHeading")}
      </h3>
      <p className={styles.fileHint}>
        {t("marketing:listBusiness.menu.fileHint")}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={MENU_FILE_ACCEPT}
        className="visuallyHidden"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void handlePick(event.target.files?.[0])}
      />

      {menu.file ? (
        <div className={styles.fileRow}>
          {isPdf ? <FiFileText aria-hidden /> : <FiImage aria-hidden />}
          <span className={styles.fileName}>{menu.file.fileName}</span>
          <Button
            variant="ghost"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {t("marketing:listBusiness.menu.fileReplaceCta")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => form.setMenuFile(null)}
            disabled={isUploading}
          >
            {t("marketing:listBusiness.menu.fileRemoveCta")}
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <FiUpload aria-hidden />{" "}
          {isUploading
            ? t("marketing:listBusiness.menu.fileUploading")
            : t("marketing:listBusiness.menu.fileAddCta")}
        </Button>
      )}
      {errorMessage && (
        <p className={styles.fileError} role="alert">
          {errorMessage}
        </p>
      )}

      <FormField
        className={styles.linkField}
        label={t("marketing:listBusiness.menu.linkLabel")}
        helper={t("marketing:listBusiness.menu.linkHint")}
        error={
          isMenuLinkValid(menu.link)
            ? undefined
            : t("marketing:listBusiness.menu.linkError")
        }
      >
        <input
          type="url"
          inputMode="url"
          maxLength={MENU_LINK_MAX}
          placeholder={t("marketing:listBusiness.menu.linkPlaceholder")}
          value={menu.link}
          onChange={(event) => form.setMenuLink(event.target.value)}
        />
      </FormField>
    </div>
  );
}
