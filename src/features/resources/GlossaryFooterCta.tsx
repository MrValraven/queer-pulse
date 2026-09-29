import type { ReactNode } from "react";
import styles from "./GlossaryPage.module.css";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";

interface GlossaryFooterCtaProps {
  footTitle: ReactNode;
  suggestEditLabel: string;
  onSuggestEdit: () => void;
}

/** The glossary's closing strip: "found a term we're missing or wrong
 *  about?" and the CTA that opens the suggest-an-edit intake. */
export function GlossaryFooterCta({
  footTitle,
  suggestEditLabel,
  onSuggestEdit,
}: GlossaryFooterCtaProps) {
  return (
    <section className={styles.foot}>
      <div className={styles.footInner}>
        <h3>{footTitle}</h3>
        <p>
          <Translation
            i18nKey="resources:glossary.foot.body"
            components={{ em: <em /> }}
          />
        </p>
        <Button variant="primary" onClick={onSuggestEdit}>
          {suggestEditLabel}
        </Button>
      </div>
    </section>
  );
}
