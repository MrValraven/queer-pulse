import type { QuizshowTemplateStatus } from "../../../shared/contracts/quizshow";
import type { AdminTone } from "../ui";

/** The page heading's DOM id: focus lands here after a delete takes its row away. */
export const QUIZSHOW_TEMPLATES_HEADING_ID = "admin-quizshow-templates-heading";

/** Static keys for the loading rows. */
export const TEMPLATE_SKELETON_ROW_KEYS = [
  "first",
  "second",
  "third",
  "fourth",
] as const;

export const TEMPLATE_STATUS_LABEL_KEYS: Record<
  QuizshowTemplateStatus,
  string
> = {
  draft: "quizshow:templates.status.draft",
  published: "quizshow:templates.status.published",
};

export const TEMPLATE_STATUS_TONES: Record<QuizshowTemplateStatus, AdminTone> =
  {
    draft: "ghost",
    published: "jade",
  };
