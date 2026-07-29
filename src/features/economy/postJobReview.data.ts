/* Review-step summary rows for the Post-a-Job composer.
 *
 * `buildReviewRows` turns the live form state + posting company into the
 * labelled summary rows the review step lists (with the wizard step each row
 * jumps back to on "edit"). It's derived config, not static data, so it takes
 * the form and `t` at call time and reuses the canonical option lists here
 * rather than in the component body. */
import type { TFunction } from "../../shared/i18n/types";
import { CATEGORIES, COMMITMENTS, FORMATS, optionLabel } from "./postJob.data";
import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";

export interface ReviewRow {
  k: string;
  v: string;
  step: number;
  empty?: boolean;
}

export function buildReviewRows(
  form: PostJobForm,
  company: CompanyProfile,
  t: TFunction,
): ReviewRow[] {
  const { state, payLabel } = form;
  const dash = t("economy:postJob.step5.dash");
  const screeningCount = state.screening.filter(Boolean).length;

  return [
    {
      k: t("economy:postJob.field.title"),
      v: state.title || dash,
      step: 1,
      empty: !state.title,
    },
    {
      k: t("economy:postJob.field.category"),
      v: optionLabel(CATEGORIES, state.category, t),
      step: 0,
    },
    {
      k: t("economy:postJob.field.arrangement"),
      v: `${optionLabel(COMMITMENTS, state.commitment, t)} · ${optionLabel(FORMATS, state.format, t)}`,
      step: 0,
    },
    ...(state.seniority !== "Any level"
      ? [{ k: t("economy:postJob.field.level"), v: state.seniority, step: 0 }]
      : []),
    ...(form.needsCity
      ? [
          {
            k: t("economy:postJob.field.where"),
            v: state.city || dash,
            step: 0,
            empty: !state.city,
          },
        ]
      : []),
    {
      k: t("economy:postJob.field.description"),
      v: state.description
        ? state.description.slice(0, 90) +
          (state.description.length > 90 ? "…" : "")
        : dash,
      step: 1,
      empty: !state.description,
    },
    {
      k: t("economy:postJob.field.pay"),
      v: payLabel || t("economy:postJob.step5.notSpecified"),
      step: 2,
      empty: !payLabel,
    },
    ...(state.benefits.length
      ? [
          {
            k: t("economy:postJob.field.perks"),
            v: state.benefits.join(", "),
            step: 2,
          },
        ]
      : []),
    ...(state.inclusivity.length
      ? [
          {
            k: t("economy:postJob.field.thisSpaceIs"),
            v: state.inclusivity.join(", "),
            step: 3,
          },
        ]
      : []),
    ...(state.tags.length
      ? [
          {
            k: t("economy:postJob.field.skills"),
            v: state.tags.join(", "),
            step: 3,
          },
        ]
      : []),
    ...(screeningCount
      ? [
          {
            k: t("economy:postJob.field.screening"),
            v: t("economy:postJob.step5.questionCount", {
              count: screeningCount,
            }),
            step: 3,
          },
        ]
      : []),
    { k: t("economy:postJob.field.postingAs"), v: company.nameText, step: 3 },
    {
      k: t("economy:postJob.field.respondVia"),
      v: state.contacts.join(", ") || dash,
      step: 4,
      empty: !state.contacts.length,
    },
  ];
}
