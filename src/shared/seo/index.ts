export { PageMeta, type PageMetaProps } from "./PageMeta";
export { useDocumentMeta, type DocumentMeta } from "./useDocumentMeta";
export { SITE_ORIGIN, defaultMeta, toAbsoluteUrl } from "./seo.data";
export { JsonLd, type JsonLdProps } from "./JsonLd";
export {
  buildOrganizationSchema,
  buildFaqSchema,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
  buildPersonProfileSchema,
  type FaqEntry,
  type BreadcrumbStep,
  type MedicalWebPageInput,
  type PersonProfileInput,
} from "./jsonLd.data";
