import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { Eyebrow } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ToolPage.module.css";

interface ToolPageProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: ReactNode;
  /** The input column. */
  form: ReactNode;
  /** The live document preview column (a <DocPreview>). */
  preview: ReactNode;
  /** Action buttons (Download PDF, Copy…) rendered under the form. */
  actions?: ReactNode;
}

/**
 * Shared chrome for the Economy document generators: marketing PageShell, a
 * Fraunces header with a "Back to Economy" link, and a two-pane
 * form | preview layout that stacks on mobile.
 */
export function ToolPage({
  eyebrow,
  title,
  subtitle,
  form,
  preview,
  actions,
}: ToolPageProps) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <Link to={routes.economy} className={styles.back}>
            <FiArrowLeft aria-hidden /> {t("economy:toolPage.backToEconomy")}
          </Link>
          <header className={styles.head}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.sub}>{subtitle}</p>
          </header>

          <div className={styles.layout}>
            <div className={styles.formCol}>
              {form}
              {actions && <div className={styles.actions}>{actions}</div>}
            </div>
            <div className={styles.previewCol}>{preview}</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
