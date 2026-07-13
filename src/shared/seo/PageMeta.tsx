import { useDocumentMeta, type DocumentMeta } from "./useDocumentMeta";

export type PageMetaProps = DocumentMeta;

/**
 * Declarative per-route metadata. Render near the top of a page's JSX:
 *
 * ```tsx
 * <PageMeta
 *   title="The Magazine — QueerPulse"
 *   description="Essays, features and interviews from queer Lisbon."
 * />
 * ```
 *
 * Sets `document.title`, the description, canonical link, and the OG/Twitter
 * card, falling back to the neutral site defaults (see seo.data.ts) for
 * anything omitted. Renders nothing. See README.md for the SPA-crawler caveat.
 */
export function PageMeta(props: PageMetaProps): null {
  useDocumentMeta(props);
  return null;
}
