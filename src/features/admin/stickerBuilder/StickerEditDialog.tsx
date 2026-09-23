import { useState, type FormEvent } from "react";
import { Button, FormField, Modal } from "../../../shared/components/ui";
import type { AdminStickerResponse } from "../../../shared/contracts/contracts";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StickerEditDialog.module.css";

/** The backend's limits (`UpdateStickerDto`, `StickerKeywordsDto`). */
const LABEL_MAX_LENGTH = 80;
const KEYWORD_MAX_LENGTH = 40;
const KEYWORDS_MAX_COUNT = 24;

type KeywordLanguage = "en" | "pt";
const KEYWORD_LANGUAGES: KeywordLanguage[] = ["en", "pt"];

/** A comma-separated field as a keyword list: trimmed, empties dropped, and
 *  a repeat (ignoring case) kept once, in the spelling first typed. */
function parseKeywords(rawKeywords: string): string[] {
  const seenKeywords = new Set<string>();
  const keywords: string[] = [];
  for (const part of rawKeywords.split(",")) {
    const keyword = part.trim();
    const comparisonKey = keyword.toLocaleLowerCase();
    if (!keyword || seenKeywords.has(comparisonKey)) continue;
    seenKeywords.add(comparisonKey);
    keywords.push(keyword);
  }
  return keywords;
}

/**
 * Renames a sticker and edits its search keywords in both languages, in
 * place: the sticker keeps its id, art, order and cover status. Keywords are
 * typed as comma-separated text and previewed as chips, so the admin sees
 * exactly what gets saved. Mount it only while open; it closes itself once
 * `onSave` resolves true and stays open on false (the caller toasts the
 * error), so nothing typed is lost.
 */
export function StickerEditDialog({
  sticker,
  onSave,
  onClose,
}: {
  sticker: AdminStickerResponse;
  onSave: (body: {
    label: string;
    keywords: { en: string[]; pt: string[] };
  }) => Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [label, setLabel] = useState(sticker.label);
  const [rawKeywords, setRawKeywords] = useState<
    Record<KeywordLanguage, string>
  >({
    en: sticker.keywords.en.join(", "),
    pt: sticker.keywords.pt.join(", "),
  });
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedLabel = label.trim();
  const labelError =
    hasTriedSave && trimmedLabel.length === 0
      ? t("admin:stickerPacks.editSticker.errors.labelRequired")
      : trimmedLabel.length > LABEL_MAX_LENGTH
        ? t("admin:stickerPacks.editSticker.errors.labelTooLong")
        : undefined;
  const keywordsByLanguage = {
    en: parseKeywords(rawKeywords.en),
    pt: parseKeywords(rawKeywords.pt),
  };

  function keywordError(language: KeywordLanguage): string | undefined {
    const keywords = keywordsByLanguage[language];
    const tooLongKeywords = keywords.filter(
      (keyword) => keyword.length > KEYWORD_MAX_LENGTH,
    );
    if (tooLongKeywords.length > 0) {
      return t("admin:stickerPacks.editSticker.errors.keywordTooLong", {
        keywords: tooLongKeywords.join(", "),
      });
    }
    if (keywords.length > KEYWORDS_MAX_COUNT) {
      return t("admin:stickerPacks.editSticker.errors.tooManyKeywords", {
        total: keywords.length,
      });
    }
    return undefined;
  }

  const isValid =
    trimmedLabel.length > 0 &&
    trimmedLabel.length <= LABEL_MAX_LENGTH &&
    KEYWORD_LANGUAGES.every((language) => !keywordError(language));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasTriedSave(true);
    if (!isValid || isSaving) return;
    const isUnchanged =
      trimmedLabel === sticker.label &&
      KEYWORD_LANGUAGES.every(
        (language) =>
          keywordsByLanguage[language].join("\n") ===
          sticker.keywords[language].join("\n"),
      );
    if (isUnchanged) {
      onClose();
      return;
    }
    setIsSaving(true);
    const isSaved = await onSave({
      label: trimmedLabel,
      keywords: keywordsByLanguage,
    });
    if (isSaved) {
      onClose();
      return;
    }
    setIsSaving(false);
  }

  const formId = `sticker-edit-${sticker.id}`;

  return (
    <Modal
      title={t("admin:stickerPacks.editSticker.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={isSaving}>
            {isSaving
              ? t("admin:stickerPacks.editSticker.saving")
              : t("admin:stickerPacks.editSticker.save")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={styles.form}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className={styles.preview}>
          <img
            className={styles.previewImage}
            src={sticker.url}
            alt=""
            width={sticker.width}
            height={sticker.height}
          />
        </div>
        <FormField
          label={t("admin:stickerPacks.editSticker.label")}
          required
          error={labelError}
          labelAside={`${label.trim().length}/${LABEL_MAX_LENGTH}`}
        >
          <input
            type="text"
            value={label}
            maxLength={LABEL_MAX_LENGTH}
            autoComplete="off"
            onChange={(event) => setLabel(event.target.value)}
          />
        </FormField>
        {KEYWORD_LANGUAGES.map((language) => (
          <div key={language} className={styles.keywordGroup}>
            <FormField
              label={t(`admin:stickerPacks.editSticker.keywords.${language}`)}
              helper={t("admin:stickerPacks.editSticker.keywordsHelper")}
              error={keywordError(language)}
              labelAside={`${keywordsByLanguage[language].length}/${KEYWORDS_MAX_COUNT}`}
            >
              <input
                type="text"
                value={rawKeywords[language]}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) =>
                  setRawKeywords((current) => ({
                    ...current,
                    [language]: event.target.value,
                  }))
                }
              />
            </FormField>
            {keywordsByLanguage[language].length > 0 && (
              <ul className={styles.chips} aria-hidden>
                {keywordsByLanguage[language].map((keyword) => (
                  <li
                    key={keyword}
                    className={styles.chip}
                    data-invalid={
                      keyword.length > KEYWORD_MAX_LENGTH ? "true" : undefined
                    }
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
}
