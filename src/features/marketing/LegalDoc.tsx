import { type ReactNode } from "react";
import { PageShell } from "../../shared/components/layout";
import styles from "./LegalDoc.module.css";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}
export interface LegalDocProps {
  /** Built-in header eyebrow. Ignored when a custom `hero` is supplied. */
  eyebrow?: string;
  /** Built-in header title. Ignored when a custom `hero` is supplied. */
  title?: ReactNode;
  /** Built-in header meta line(s). Ignored when a custom `hero` is supplied. */
  meta?: string[];
  plain?: { title: string; text: string };
  toc?: { id: string; label: string }[];
  /** Prose section list. Rendered only when `body` is not supplied. */
  sections?: LegalSection[];
  contact?: { text: ReactNode; email: string };
  related?: ReactNode;
  /**
   * Custom hero rendered above the doc chrome, in place of the built-in
   * `eyebrow`/`title`/`meta` header — e.g. a `<PageHero>`. Lets an interactive
   * doc (the cookie consent center) keep its own hero while still reusing the
   * shared page/wrap/section scaffold below.
   */
  hero?: ReactNode;
  /**
   * Raw main-content slot rendered in place of the prose `sections` map (so
   * interactive widgets aren't forced through the prose `.sBody` styling).
   */
  body?: ReactNode;
  /**
   * Sticky companion column. When present the doc body becomes a two-column
   * layout (content + aside); when absent it stays a single narrow column.
   */
  aside?: ReactNode;
}

export function LegalDoc({
  eyebrow,
  title,
  meta,
  plain,
  toc,
  sections,
  contact,
  related,
  hero,
  body,
  aside,
}: LegalDocProps) {
  const { t } = useTranslation();
  const showHeader = !hero && (eyebrow || title || (meta && meta.length > 0));
  return (
    <PageShell>
      {hero}
      <div
        className={[styles.page, hero && styles.hasHero]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[`wrap`, styles.wrap, aside && styles.withAside]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.docMain}>
            {(showHeader || plain) && (
              <div className={styles.header}>
                {eyebrow && <div className={styles.eye}>{eyebrow}</div>}
                {title && <h1 className={styles.title}>{title}</h1>}
                {meta && meta.length > 0 && (
                  <div className={styles.meta}>
                    {meta.map((entry) => (
                      <span key={entry}>{entry}</span>
                    ))}
                  </div>
                )}
                {plain && (
                  <div className={styles.plain}>
                    <div className={styles.plainTitle}>{plain.title}</div>
                    <div className={styles.plainText}>{plain.text}</div>
                  </div>
                )}
              </div>
            )}

            {toc && toc.length > 0 && (
              <div className={styles.toc}>
                <div className={styles.tocTitle}>
                  {t("marketing:legal.toc.title")}
                </div>
                <div className={styles.tocLinks}>
                  {toc.map((item) => (
                    <a key={item.id} href={`#${item.id}`}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {body ??
              sections?.map((section) => (
                <div
                  className={styles.section}
                  id={section.id}
                  key={section.id}
                >
                  <div className={styles.sTitle}>{section.title}</div>
                  <div className={styles.sBody}>{section.body}</div>
                </div>
              ))}

            {contact && (
              <div className={styles.contact}>
                <div className={styles.contactText}>{contact.text}</div>
                <Button href={`mailto:${contact.email}`} variant="ghost-dark">
                  {t("marketing:legal.contact.emailCta")}
                </Button>
              </div>
            )}
          </div>

          {aside}
        </div>
      </div>
      {related}
    </PageShell>
  );
}
