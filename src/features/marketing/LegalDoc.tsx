import { type ReactNode } from "react";
import { PageShell } from "../../shared/components/layout";
import styles from "./LegalDoc.module.css";
import { Button } from "../../shared/components/ui";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}
export interface LegalDocProps {
  eyebrow: string;
  title: ReactNode;
  meta: string[];
  plain?: { title: string; text: string };
  toc: { id: string; label: string }[];
  sections: LegalSection[];
  contact: { text: ReactNode; email: string };
}

export function LegalDoc({
  eyebrow,
  title,
  meta,
  plain,
  toc,
  sections,
  contact,
}: LegalDocProps) {
  return (
    <PageShell>
      <div className={styles.page}>
        <div className={`wrap ${styles.wrap}`}>
          <div className={styles.header}>
            <div className={styles.eye}>{eyebrow}</div>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.meta}>
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            {plain && (
              <div className={styles.plain}>
                <div className={styles.plainTitle}>{plain.title}</div>
                <div className={styles.plainText}>{plain.text}</div>
              </div>
            )}
          </div>

          {toc.length > 0 && (
            <div className={styles.toc}>
              <div className={styles.tocTitle}>Contents</div>
              <div className={styles.tocLinks}>
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`}>
                    {t.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {sections.map((s) => (
            <div className={styles.section} id={s.id} key={s.id}>
              <div className={styles.sTitle}>{s.title}</div>
              <div className={styles.sBody}>{s.body}</div>
            </div>
          ))}

          <div className={styles.contact}>
            <div className={styles.contactText}>{contact.text}</div>
            <Button href={`mailto:${contact.email}`} variant="ghost-dark">
              Email us →
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
