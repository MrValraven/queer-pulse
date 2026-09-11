import type { ReactNode } from "react";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CATEGORIES } from "../../resources/library.data";
import { guideSlugFromTitle } from "./guideAnchors";
import {
  CHIP_FORMATS,
  chipForDraft,
  parseChipFormat,
  type ChipChoice,
} from "./guideCardChip";
import type { GuideDraft } from "./guideDraft";
import type { GuideValidationIssue } from "./guideValidation";
import { guideFieldId, type GuideLanguage } from "./guideWorkspace.data";
import styles from "./GuideRail.module.css";

function GuideField({
  id,
  label,
  hint,
  issue,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  issue?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label id={`${id}-label`} className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className={styles.fieldHint}>
          {hint}
        </p>
      )}
      {issue && (
        <p id={`${id}-error`} className={styles.fieldError}>
          {issue}
        </p>
      )}
    </div>
  );
}

/** `aria-describedby` for a field: its hint and its error, when present. */
function describedBy(id: string, hint?: string, issue?: string) {
  const ids = [hint && `${id}-hint`, issue && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/** The category and chip option lists, each with an extra row for a stored
 *  value that matches no known option. */
function useGuideDetailsOptions(draft: GuideDraft, storedMeta: string | null) {
  const { t } = useTranslation();
  const categoryOptions: { value: string; label: string }[] = CATEGORIES.filter(
    (category) => category.id !== "all",
  ).map((category) => ({
    value: category.id,
    label: t(category.labelKey),
  }));
  if (
    draft.category &&
    !categoryOptions.some((option) => option.value === draft.category)
  ) {
    categoryOptions.push({
      value: draft.category,
      label: t("admin:guideWorkspace.details.currentCategory", {
        category: draft.category,
      }),
    });
  }
  const chipOptions: { value: string; label: string }[] = CHIP_FORMATS.map(
    (format) => ({
      value: format,
      label: t(`admin:guideWorkspace.chip.format.${format}`),
    }),
  );
  if (
    draft.chipFormat === "keep" ||
    (storedMeta && parseChipFormat(storedMeta) === "keep")
  ) {
    chipOptions.unshift({
      value: "keep",
      label: t("admin:guideWorkspace.chip.keep", {
        chip: storedMeta ?? t("admin:guideWorkspace.chip.none"),
      }),
    });
  }
  return { categoryOptions, chipOptions };
}

export function GuideDetailsPanel({
  draft,
  language,
  isNew,
  storedMeta,
  issues,
  onChange,
}: {
  draft: GuideDraft;
  language: GuideLanguage;
  isNew: boolean;
  storedMeta: string | null;
  issues: GuideValidationIssue[];
  onChange: (changes: Partial<GuideDraft>) => void;
}) {
  const { t } = useTranslation();
  const isPortuguese = language === "pt";
  const issueFor = (targetId: string) => {
    const issue = issues.find((candidate) => candidate.targetId === targetId);
    return issue ? t(`admin:guideWorkspace.issue.${issue.code}`) : undefined;
  };
  const titleId = guideFieldId("title", language);
  const descriptionId = guideFieldId("description", language);
  const categoryId = guideFieldId("category");
  const chipId = guideFieldId("chip");
  const routePathId = guideFieldId("routePath");
  const slugId = guideFieldId("slug");

  const { categoryOptions, chipOptions } = useGuideDetailsOptions(
    draft,
    storedMeta,
  );
  const chip = chipForDraft(draft, storedMeta);

  function changeTitle(value: string) {
    if (isPortuguese) onChange({ titlePt: value });
    else if (isNew && !draft.isSlugLocked) {
      onChange({ title: value, slug: guideSlugFromTitle(value) });
    } else onChange({ title: value });
  }

  const titleIssue = issueFor(titleId);
  const descriptionIssue = issueFor(descriptionId);
  const slugIssue = issueFor(slugId);
  const routePathIssue = issueFor(routePathId);
  const categoryIssue = issueFor(categoryId);
  const chipIssue = issueFor(chipId);
  const slugHint = t("admin:guideWorkspace.details.slugHint");
  const routePathHint = t("admin:guideWorkspace.details.routePathHint");
  const chipHint = t("admin:guideWorkspace.chip.hint");

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>
        {t("admin:guideWorkspace.details.title")}
      </h2>

      <GuideField
        id={titleId}
        label={t(
          isPortuguese
            ? "admin:adminResourceGuides.field.titlePt"
            : "admin:adminResourceGuides.field.title",
        )}
        issue={titleIssue}
      >
        <input
          id={titleId}
          className={styles.input}
          value={isPortuguese ? draft.titlePt : draft.title}
          aria-invalid={Boolean(titleIssue) || undefined}
          aria-describedby={describedBy(titleId, undefined, titleIssue)}
          onChange={(event) => changeTitle(event.target.value)}
        />
      </GuideField>

      <GuideField
        id={descriptionId}
        label={t(
          isPortuguese
            ? "admin:adminResourceGuides.field.descriptionPt"
            : "admin:adminResourceGuides.field.description",
        )}
        issue={descriptionIssue}
      >
        <textarea
          id={descriptionId}
          className={styles.textarea}
          value={isPortuguese ? draft.descriptionPt : draft.description}
          aria-invalid={Boolean(descriptionIssue) || undefined}
          aria-describedby={describedBy(
            descriptionId,
            undefined,
            descriptionIssue,
          )}
          onChange={(event) =>
            onChange(
              isPortuguese
                ? { descriptionPt: event.target.value }
                : { description: event.target.value },
            )
          }
        />
      </GuideField>

      {isNew && (
        <GuideField
          id={slugId}
          label={t("admin:guideWorkspace.details.slug")}
          hint={slugHint}
          issue={slugIssue}
        >
          <input
            id={slugId}
            className={styles.input}
            value={draft.slug}
            spellCheck={false}
            aria-invalid={Boolean(slugIssue) || undefined}
            aria-describedby={describedBy(slugId, slugHint, slugIssue)}
            onChange={(event) =>
              onChange({ slug: event.target.value, isSlugLocked: true })
            }
          />
        </GuideField>
      )}

      <GuideField
        id={categoryId}
        label={t("admin:adminResourceGuides.field.category")}
        issue={categoryIssue}
      >
        <Select
          id={categoryId}
          labelledBy={`${categoryId}-label`}
          value={draft.category || null}
          options={categoryOptions}
          placeholder={t("admin:guideWorkspace.details.categoryPlaceholder")}
          invalid={Boolean(categoryIssue)}
          aria-describedby={describedBy(categoryId, undefined, categoryIssue)}
          onChange={(value) => onChange({ category: value ?? "" })}
        />
      </GuideField>

      <GuideField
        id={chipId}
        label={t("admin:adminResourceGuides.field.meta")}
        hint={chipHint}
        issue={chipIssue}
      >
        <Select
          id={chipId}
          labelledBy={`${chipId}-label`}
          value={draft.chipFormat}
          options={chipOptions}
          invalid={Boolean(chipIssue)}
          aria-describedby={describedBy(chipId, chipHint, chipIssue)}
          onChange={(value) =>
            onChange({ chipFormat: (value ?? "guide") as ChipChoice })
          }
        />
        <p className={styles.chipResult}>
          {t("admin:guideWorkspace.chip.result", {
            chip: chip ?? t("admin:guideWorkspace.chip.none"),
          })}
        </p>
      </GuideField>

      <GuideField
        id={routePathId}
        label={t("admin:adminResourceGuides.field.routePath")}
        hint={routePathHint}
        issue={routePathIssue}
      >
        <input
          id={routePathId}
          className={styles.input}
          value={draft.routePath}
          spellCheck={false}
          aria-invalid={Boolean(routePathIssue) || undefined}
          aria-describedby={describedBy(
            routePathId,
            routePathHint,
            routePathIssue,
          )}
          onChange={(event) => onChange({ routePath: event.target.value })}
        />
      </GuideField>
    </section>
  );
}
