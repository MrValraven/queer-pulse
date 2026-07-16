import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Badge, EmptyState, Spinner } from "../../shared/components/ui";
import { KIND_LABELS } from "./subprofile-kinds";
import { useSubprofile } from "./api/useSubprofile";
import { STATUS_BADGE } from "./mySubprofiles.data";
import { SubprofileMetaForm } from "./SubprofileMetaForm";
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
  const { id } = useParams();
  const { data: subprofile, isLoading } = useSubprofile(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className={styles.stateWrap} role="status" aria-live="polite">
          <Spinner />
          <span>Loading your persona…</span>
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
              title="We couldn't find that persona"
              description="It may have been removed, or the link isn't quite right."
              action={{ label: "Back to your subprofiles", to: DASHBOARD }}
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
            <FiArrowLeft size={16} aria-hidden /> Your subprofiles
          </Link>

          <div className={styles.header}>
            <h1 className={styles.headTitle}>
              {subprofile.displayName || "Untitled persona"}
            </h1>
            <div className={styles.headMeta}>
              <Badge tone="ghost">{KIND_LABELS[subprofile.kind]}</Badge>
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
            </div>
          </div>

          <SubprofileMetaForm subprofile={subprofile} />

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
