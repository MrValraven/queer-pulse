import type { ReactNode } from "react";
import { PageShell } from "../../../../shared/components/layout/PageShell";
import { PageMeta } from "../../../../shared/seo/PageMeta";
import type { AudienceId } from "./audiences.data";
import styles from "./AudiencePageFrame.module.css";

/**
 * The marketing shell around an audience page. The pages are unlisted, so
 * every one of them is `noIndex`; `data-audience` lets a page's own styles
 * and the tests find which audience is on screen.
 */
export function AudiencePageFrame({
  audience,
  metaTitle,
  metaDescription,
  className,
  children,
}: {
  audience: AudienceId;
  metaTitle: string;
  metaDescription: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <PageMeta title={metaTitle} description={metaDescription} noIndex />
      <div
        data-audience={audience}
        className={[styles.frame, className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </PageShell>
  );
}
