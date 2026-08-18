import { useMemo } from "react";
import { LegalDocModal } from "./LegalDocModal";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PRIVACY_TOC, buildPrivacySections } from "./privacy.data";

interface PrivacyModalProps {
  onClose: () => void;
}

export function PrivacyModal({ onClose }: PrivacyModalProps) {
  const { t } = useTranslation();
  const sections = useMemo(() => buildPrivacySections(t), [t]);
  const toc = useMemo(
    () =>
      PRIVACY_TOC.map((item) => ({
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
          i18nKey="marketing:privacy.title"
          components={{ em: <em /> }}
        />
      }
      plain={{
        title: t("marketing:legal.plainSummaryTitle"),
        text: t("marketing:privacy.plain.text"),
      }}
      toc={toc}
      sections={sections}
      fullPageTo={routes.privacy}
      onClose={onClose}
    />
  );
}
