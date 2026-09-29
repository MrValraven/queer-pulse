import { useId } from "react";
import { FiEdit2, FiExternalLink, FiGlobe } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { glossaryTermToTerm } from "../resources/api/resources.adapters";
import { GlossaryTermCard, type Lang } from "../resources/GlossaryTermCard";
import type { Term } from "../resources/glossary.data";
import { AdminModal } from "./ui";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminGlossaryTermPreviewModal.module.css";

/** The public page's letter-block id for a term. Cards carry no id of their
 *  own, so this is the closest anchor; it mirrors `groupTermsIntoBlocks`,
 *  which buckets by the upper-cased first character of the term name. */
function glossaryLetterAnchor(termName: string): string {
  return termName.charAt(0).toUpperCase();
}

/** One language's card, labelled in the console's language and marked up
 *  with the term language so a screen reader pronounces it correctly. */
function PreviewPane({
  term,
  lang,
  label,
  notice,
}: {
  term: Term;
  lang: Lang;
  label: string;
  notice?: string;
}) {
  const labelId = useId();
  return (
    <section className={styles.pane} aria-labelledby={labelId}>
      <h4 id={labelId} className={styles.paneLabel}>
        {label}
      </h4>
      {notice && (
        <p className={styles.fallbackNotice}>
          <FiGlobe aria-hidden />
          {notice}
        </p>
      )}
      <div lang={lang} className={styles.cardFrame}>
        <GlossaryTermCard term={term} lang={lang} />
      </div>
    </section>
  );
}

/**
 * Shows one glossary term the way readers see it on `/resources/glossary`,
 * in both term languages. Glossary terms are public whatever their review
 * state, so this is what is live right now.
 *
 * The admin DTO goes through the public page's own adapter, so an untranslated
 * term renders the same English fallback a Portuguese reader gets, and the
 * card is the public `GlossaryTermCard` with the public stylesheet.
 */
export function AdminGlossaryTermPreviewModal({
  term,
  onClose,
  onEdit,
}: {
  term: AdminGlossaryTermDTO;
  onClose: () => void;
  onEdit: (term: AdminGlossaryTermDTO) => void;
}) {
  const { t } = useTranslation();
  const previewTerm = glossaryTermToTerm(term);
  const hasPortuguese = Boolean(term.definitionPt);

  return (
    <AdminModal
      wide
      eyebrow={term.slug}
      title={t("admin:adminGlossary.preview.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.close")}
          </Button>
          <Button
            variant="ghost"
            to={{
              pathname: routes.glossary,
              hash: glossaryLetterAnchor(term.term),
            }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(
              "admin:adminGlossary.preview.openInGlossaryAriaLabel",
            )}
          >
            <FiExternalLink aria-hidden />
            {t("admin:adminGlossary.preview.openInGlossaryCta")}
          </Button>
          <Button variant="primary" onClick={() => onEdit(term)}>
            <FiEdit2 aria-hidden />
            {t("admin:adminResourceGuides.row.editCta")}
          </Button>
        </>
      }
    >
      <p className={styles.intro}>{t("admin:adminGlossary.preview.intro")}</p>
      <PreviewPane
        term={previewTerm}
        lang="en"
        label={t("admin:adminGlossary.preview.englishLabel")}
      />
      <PreviewPane
        term={previewTerm}
        lang="pt"
        label={t("admin:adminGlossary.preview.portugueseLabel")}
        notice={
          hasPortuguese
            ? undefined
            : t("admin:adminGlossary.preview.fallbackNotice")
        }
      />
    </AdminModal>
  );
}
