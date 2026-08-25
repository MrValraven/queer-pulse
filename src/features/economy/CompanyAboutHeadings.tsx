import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Structural sub-headings inside each company's `about` block. They are UI
 * chrome (the same two labels repeat across every profile), not editorial
 * prose, so they are translated. Rendered as components because `about` is a
 * `ReactNode` mounted inside the React tree (CompanyTabs' AboutPane), which
 * lets these read the active locale via `useTranslation`.
 */
export function HowWeWorkHeading() {
  const { t } = useTranslation();
  return <h3>{t("economy:company.about.howWeWorkHeading")}</h3>;
}

export function WhatWeLookForHeading() {
  const { t } = useTranslation();
  return <h3>{t("economy:company.about.whatWeLookForHeading")}</h3>;
}
