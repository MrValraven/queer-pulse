import { useId, useState } from "react";
import { Button, FormField, Modal, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMMUNITY_RESOURCE_KINDS,
  type CommunityResourceKind,
} from "./api/communityResources.api";
import styles from "./CommunityResources.module.css";

/** What the caller gets back on save. `note` is sent as an empty string to
 *  clear one, which is how the backend reads "present but empty". */
export interface CommunityResourceDraft {
  title: string;
  url: string;
  note: string;
  kind: CommunityResourceKind;
}

const MAX_TITLE = 200;
const MAX_URL = 2048;
const MAX_NOTE = 1000;

/** Mirrors the backend's `@IsHttpUrl` protocol allowlist, so a `javascript:`
 *  or `mailto:` link is refused here with a sentence instead of a 400. The
 *  shelf renders this value as a real anchor for every member. */
function isAbsoluteWebUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Add or edit one shelf entry. One modal for both, because the fields are
 * identical and the only difference is what it opens with: `initial` present
 * means an edit.
 *
 * Validation matches the backend's DTO rather than being looser, so nothing a
 * staff member can submit here comes back as a 400.
 */
export function CommunityResourceFormModal({
  initial,
  isSaving,
  onSave,
  onClose,
}: {
  /** The row being edited, or undefined when adding a new one. */
  initial?: CommunityResourceDraft;
  isSaving: boolean;
  onSave: (draft: CommunityResourceDraft) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [kind, setKind] = useState<CommunityResourceKind>(
    initial?.kind ?? "link",
  );
  const [hasTriedSaving, setHasTriedSaving] = useState(false);
  const kindLabelId = useId();

  const titleError =
    hasTriedSaving && title.trim().length === 0
      ? t("communities:detail.resources.form.titleRequired")
      : undefined;
  const urlError = !hasTriedSaving
    ? undefined
    : url.trim().length === 0
      ? t("communities:detail.resources.form.urlRequired")
      : !isAbsoluteWebUrl(url.trim())
        ? t("communities:detail.resources.form.urlInvalid")
        : undefined;

  const save = () => {
    setHasTriedSaving(true);
    if (title.trim().length === 0) return;
    if (!isAbsoluteWebUrl(url.trim())) return;
    onSave({
      title: title.trim(),
      url: url.trim(),
      note: note.trim(),
      kind,
    });
  };

  return (
    <Modal
      title={t(
        initial
          ? "communities:detail.resources.form.editTitle"
          : "communities:detail.resources.form.addTitle",
      )}
      sub={t("communities:detail.resources.form.subtitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {t("communities:detail.resources.form.cancelCta")}
          </Button>
          <Button variant="primary" onClick={save} disabled={isSaving}>
            {t(
              isSaving
                ? "communities:detail.resources.form.savingCta"
                : "communities:detail.resources.form.saveCta",
            )}
          </Button>
        </>
      }
    >
      <FormField
        label={t("communities:detail.resources.form.titleLabel")}
        required
        error={titleError}
      >
        <input
          type="text"
          value={title}
          maxLength={MAX_TITLE}
          placeholder={t("communities:detail.resources.form.titlePlaceholder")}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("communities:detail.resources.form.urlLabel")}
        required
        error={urlError}
        helper={t("communities:detail.resources.form.urlHelper")}
      >
        <input
          type="url"
          inputMode="url"
          value={url}
          maxLength={MAX_URL}
          placeholder={t("communities:detail.resources.form.urlPlaceholder")}
          onChange={(event) => setUrl(event.target.value)}
        />
      </FormField>

      <div className={styles.kindField}>
        <div className={styles.kindLabel} id={kindLabelId}>
          {t("communities:detail.resources.form.kindLabel")}
        </div>
        <Select
          value={kind}
          labelledBy={kindLabelId}
          onChange={(next) =>
            setKind((next as CommunityResourceKind) ?? "link")
          }
          options={COMMUNITY_RESOURCE_KINDS.map((resourceKind) => ({
            value: resourceKind,
            label: t(`communities:detail.resources.kind.${resourceKind}`),
          }))}
        />
      </div>

      <FormField
        label={t("communities:detail.resources.form.noteLabel")}
        helper={t("communities:detail.resources.form.noteHelper")}
      >
        <textarea
          rows={3}
          value={note}
          maxLength={MAX_NOTE}
          placeholder={t("communities:detail.resources.form.notePlaceholder")}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
