import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ManifestoBody,
  ManifestoSigners,
  ManifestoActions,
} from "./ManifestoSections";
import styles from "./ManifestoPage.module.css";

export function ManifestoPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const sign = () =>
    showToast(t("marketing:manifesto.toast.signed"), "success");

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:manifesto.meta.title")}
        description={t("marketing:manifesto.meta.description")}
      />
      <div className={styles.page}>
        <section className={styles.open}>
          <div className={styles.openInner}>
            <div className={styles.eyebrow}>
              {t("marketing:manifesto.hero.eyebrow")}
            </div>
            <h1 className={styles.title}>
              <Translation
                i18nKey="marketing:manifesto.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.attrib}>
              <Translation
                i18nKey="marketing:manifesto.hero.attrib"
                components={{ b: <b /> }}
              />
            </p>
          </div>
        </section>

        <ManifestoBody />
        <ManifestoSigners onSign={sign} />
        <ManifestoActions onSign={sign} />
      </div>
    </PageShell>
  );
}
