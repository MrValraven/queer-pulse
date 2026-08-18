import { useMemo } from "react";
import { LegalDocModal } from "./LegalDocModal";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { TERMS_TOC, buildTermsSections } from "./TermsPage.data";

interface TermsModalProps {
  onClose: () => void;
  /** Section id to scroll to on open, e.g. "eligibility". */
  initialAnchor?: string;
}

export function TermsModal({ onClose, initialAnchor }: TermsModalProps) {
  const { t } = useTranslation();
  const sections = useMemo(() => buildTermsSections(t), [t]);
  const toc = useMemo(
    () =>
      TERMS_TOC.map((item) => ({
        id: item.id,
        label: t(`marketing:${item.titleKey}`),
      })),
    [t],
  );

  return (
    <LegalDocModal
      eyebrow={t("marketing:legal.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:terms.title"
          components={{ em: <em /> }}
        />
      }
      plain={{
        title: t("marketing:legal.plainSummaryTitle"),
        text: t("marketing:terms.plain.text"),
      }}
      toc={toc}
      sections={sections}
      fullPageTo={routes.terms}
      initialAnchor={initialAnchor}
      onClose={onClose}
    />
  );
}
