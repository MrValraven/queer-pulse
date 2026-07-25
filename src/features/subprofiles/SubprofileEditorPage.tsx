import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Badge, EmptyState, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { useSubprofile } from "./api/useSubprofile";
import { STATUS_BADGE } from "./mySubprofiles.data";
import { SubprofileMetaForm } from "./SubprofileMetaForm";
import { SubprofileSocialLinksEditor } from "./SubprofileSocialLinksEditor";
import { SubprofileAffiliationsEditor } from "./SubprofileAffiliationsEditor";
import { SubprofileSectionEditor } from "./SubprofileSectionEditor";
import { SubprofilePublishPanel } from "./SubprofilePublishPanel";
import styles from "./SubprofileEditor.module.css";

const DASHBOARD = "/account/subprofiles";

/**
 * The owner editor for one subprofile: meta form, a section editor per section
 * the kind exposes, and the publish surface. Reads the persona by its route id;
 * B4 registers `/account/subprofiles/:id/edit`.
 */
export function SubprofileEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: subprofile, isLoading } = useSubprofile(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className={styles.stateWrap} role="status" aria-live="polite">
          <Spinner />
          <span>{t("subprofiles:editor.loading")}</span>
        </div>
      </AppShell>
    );
  }

  if (!subprofile) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.container}>
            <EmptyState
              title={t("subprofiles:editor.notFoundTitle")}
              description={t("subprofiles:editor.notFoundDescription")}
              action={{
                label: t("subprofiles:editor.notFoundAction"),
                to: DASHBOARD,
              }}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  const status = STATUS_BADGE[subprofile.status];

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to={DASHBOARD} className={styles.backLink}>
            <FiArrowLeft size={16} aria-hidden />{" "}
            {t("subprofiles:editor.backLink")}
          </Link>

          <div className={styles.header}>
            <h1 className={styles.headTitle}>
              {subprofile.displayName || t("subprofiles:mine.untitled")}
            </h1>
            <div className={styles.headMeta}>
              <Badge tone="ghost">{t(KIND_LABEL_KEYS[subprofile.kind])}</Badge>
              <Badge tone={status.tone} dot>
                {t(status.labelKey)}
              </Badge>
            </div>
          </div>

          <SubprofileMetaForm subprofile={subprofile} />

          <SubprofileSocialLinksEditor subprofile={subprofile} />

          <SubprofileAffiliationsEditor subprofile={subprofile} />

          {subprofile.sections.map((section) => (
            <SubprofileSectionEditor
              key={section.section}
              subprofileId={subprofile.id}
              section={section}
            />
          ))}

          <SubprofilePublishPanel subprofile={subprofile} />
        </div>
      </div>
    </AppShell>
  );
}
