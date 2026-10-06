import { useState } from "react";
import {
  Button,
  ReferenceDigestModal,
  Reveal,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { manifestoAssurances } from "./Manifesto.data";
import {
  MANIFESTO_DIGESTS,
  type ManifestoDigestId,
} from "./manifestoDigests.data";
import styles from "./Manifesto.module.css";

export function Manifesto() {
  const { t } = useTranslation();
  // "Where we stand" and "How we keep this safe" open a digest of their page in
  // place, so a visitor reading the landing page keeps their spot; the dialog's
  // footer button is the way out to the full page.
  const [openDigestId, setOpenDigestId] = useState<ManifestoDigestId | null>(
    null,
  );

  return (
    <section className={styles.manifesto} id="about">
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <Reveal className={styles.label}>
              {t("homepage:manifesto.label")}
            </Reveal>
            <Reveal as="h2" className={styles.lead} delay={60}>
              <Translation
                i18nKey="homepage:manifesto.lead"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.body} delay={120}>
              {t("homepage:manifesto.body1")}
            </Reveal>
            <Reveal as="p" className={styles.body} delay={160}>
              {t("homepage:manifesto.body2")}
            </Reveal>
            <Reveal as="p" className={styles.body} delay={200}>
              {t("homepage:manifesto.body3")}
            </Reveal>
            <Reveal as="p" className={styles.body} delay={220}>
              <Translation
                i18nKey="homepage:manifesto.body4"
                components={{
                  a: (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label -- <button> is an element template; <Translation> clones it with the link text at render time.
                    <button
                      type="button"
                      className={`${styles.bodyLinkButton} ${styles.bodyLink}`}
                      onClick={() => setOpenDigestId("stand")}
                    />
                  ),
                }}
              />
            </Reveal>
            <Reveal as="p" className={styles.highlight} delay={240}>
              {t("homepage:manifesto.highlight")}
            </Reveal>
            <Reveal className={styles.actions} delay={280}>
              <Button
                variant="ghost-dark"
                onClick={() => setOpenDigestId("safety")}
              >
                {t("homepage:manifesto.safetyCta")}
              </Button>
            </Reveal>
          </div>

          <ul className={styles.assurances}>
            {manifestoAssurances.map((item, index) => (
              <Reveal
                as="li"
                key={item.titleKey}
                className={styles.assurance}
                delay={index * 70}
              >
                <span className={styles.icon} aria-hidden>
                  {item.icon}
                </span>
                <div className={styles.copy}>
                  <div className={styles.name}>{t(item.titleKey)}</div>
                  <p className={styles.desc}>{t(item.descriptionKey)}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
      {openDigestId && (
        <ReferenceDigestModal
          topic={MANIFESTO_DIGESTS[openDigestId]}
          onClose={() => setOpenDigestId(null)}
        />
      )}
    </section>
  );
}
