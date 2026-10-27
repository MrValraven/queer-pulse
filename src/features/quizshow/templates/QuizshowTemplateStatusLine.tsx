import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowTemplateMeta } from "./quizshowTemplateResponse";
import styles from "./QuizshowTemplateDetails.module.css";

/** Says whether hosts can see the template, and who published it and when. */
export function QuizshowTemplateStatusLine({
  meta,
}: {
  meta: QuizshowTemplateMeta;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  let text = t("quizshow:templates.details.statusDraft");
  if (meta.status === "published" && meta.publishedAt !== null) {
    const date = format.date(new Date(meta.publishedAt), {
      dateStyle: "medium",
    });
    text =
      meta.publishedByName === null
        ? t("quizshow:templates.details.statusPublishedNameless", { date })
        : t("quizshow:templates.details.statusPublished", {
            date,
            name: meta.publishedByName,
          });
  } else if (meta.status === "published") {
    text = t("quizshow:templates.status.published");
  }
  return (
    <p role="status" className={styles.statusLine} data-status={meta.status}>
      {text}
    </p>
  );
}
