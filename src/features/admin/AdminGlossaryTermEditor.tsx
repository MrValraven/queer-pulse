import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import {
  useCreateGlossaryTerm,
  useUpdateGlossaryTerm,
} from "./api/useAdminResourceGuideMutations";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";
import { slugifyGlossaryTerm } from "./adminGlossary.utils";
import styles from "./AdminGlossaryPage.module.css";

const FORM_ID = "admin-glossary-term-form";

interface GlossaryTermDraft {
  slug: string;
  term: string;
  definition: string;
  definitionPt: string;
  category: string;
}

function draftFromTerm(term: AdminGlossaryTermDTO | null): GlossaryTermDraft {
  return {
    slug: term?.slug ?? "",
    term: term?.term ?? "",
    definition: term?.definition ?? "",
    definitionPt: term?.definitionPt ?? "",
    category: term?.category ?? "",
  };
}

/**
 * Write one glossary term, in both languages (PRD-264).
 *
 * Until this existed the only way to add or correct a term was a SQL
 * statement, which is why the seeded Portuguese definitions were never
 * finished: the public page falls back to the English text when
 * `definitionPt` is null, so an untranslated term looks translated and nobody
 * had a surface that showed the gap.
 *
 * The slug is editable only while creating. Changing a live term's slug would
 * break every link into it, and the same reasoning keeps the review stamp on
 * its own modal: a typo fix must never reset a term's freshness clock.
 */
export function AdminGlossaryTermEditor({
  term,
  onClose,
}: {
  term: AdminGlossaryTermDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createTerm = useCreateGlossaryTerm();
  const updateTerm = useUpdateGlossaryTerm();
  const [draft, setDraft] = useState<GlossaryTermDraft>(() =>
    draftFromTerm(term),
  );
  const [hasEditedSlug, setHasEditedSlug] = useState(term !== null);

  const isCreating = term === null;
  const isSaving = createTerm.isPending || updateTerm.isPending;

  function change(changes: Partial<GlossaryTermDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function changeTermName(name: string) {
    change(
      hasEditedSlug
        ? { term: name }
        : { term: name, slug: slugifyGlossaryTerm(name) },
    );
  }

  function handleError(error: unknown) {
    showToast(
      describeError(
        t("admin:adminGlossary.error.save"),
        error,
        t("shared:apiError.tryAgainTail"),
      ),
      "error",
    );
  }

  function handleSaved(message: string) {
    showToast(message, "info");
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    const body = {
      term: draft.term.trim(),
      definition: draft.definition.trim(),
      definitionPt: draft.definitionPt.trim(),
      category: draft.category.trim(),
    };
    if (isCreating) {
      createTerm.mutate(
        { ...body, slug: draft.slug.trim() },
        {
          onSuccess: () =>
            handleSaved(
              t("admin:adminGlossary.toast.created", { term: body.term }),
            ),
          onError: handleError,
        },
      );
      return;
    }
    updateTerm.mutate(
      { id: term.id, body },
      {
        onSuccess: () =>
          handleSaved(
            t("admin:adminGlossary.toast.saved", { term: body.term }),
          ),
        onError: handleError,
      },
    );
  }

  return (
    <AdminModal
      wide
      eyebrow={isCreating ? undefined : term.slug}
      title={t(
        isCreating
          ? "admin:adminGlossary.editor.createTitle"
          : "admin:adminGlossary.editor.editTitle",
      )}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={isSaving}
          >
            {t(
              isCreating
                ? "admin:adminGlossary.editor.createCta"
                : "admin:adminGlossary.editor.saveCta",
            )}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="glossary-term">
          {t("admin:adminGlossary.field.term")}
        </label>
        <input
          id="glossary-term"
          className={styles.textInput}
          value={draft.term}
          onChange={(event) => changeTermName(event.target.value)}
          required
        />

        {isCreating && (
          <>
            <label className={styles.fieldLabel} htmlFor="glossary-slug">
              {t("admin:adminGlossary.field.slug")}
            </label>
            <input
              id="glossary-slug"
              className={styles.textInput}
              value={draft.slug}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              onChange={(event) => {
                setHasEditedSlug(true);
                change({ slug: event.target.value });
              }}
              required
            />
            <p className={styles.fieldHint}>
              {t("admin:adminGlossary.field.slugHint")}
            </p>
          </>
        )}

        <label className={styles.fieldLabel} htmlFor="glossary-category">
          {t("admin:adminGlossary.field.category")}
        </label>
        <input
          id="glossary-category"
          className={styles.textInput}
          value={draft.category}
          onChange={(event) => change({ category: event.target.value })}
        />
        <p className={styles.fieldHint}>
          {t("admin:adminGlossary.field.categoryHint")}
        </p>

        <label className={styles.fieldLabel} htmlFor="glossary-definition">
          {t("admin:adminGlossary.field.definition")}
        </label>
        <textarea
          id="glossary-definition"
          className={styles.textarea}
          value={draft.definition}
          onChange={(event) => change({ definition: event.target.value })}
          required
        />

        <label className={styles.fieldLabel} htmlFor="glossary-definition-pt">
          {t("admin:adminGlossary.field.definitionPt")}
        </label>
        <textarea
          id="glossary-definition-pt"
          className={styles.textarea}
          value={draft.definitionPt}
          onChange={(event) => change({ definitionPt: event.target.value })}
        />
        <p className={styles.fieldHint}>
          {t("admin:adminGlossary.field.definitionPtHint")}
        </p>
      </form>
    </AdminModal>
  );
}
