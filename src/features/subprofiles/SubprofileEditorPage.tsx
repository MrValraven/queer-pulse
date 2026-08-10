import { useParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Badge, EmptyState, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { useSubprofile } from "./api/useSubprofile";
import { STATUS_BADGE } from "./mySubprofiles.data";
import { SubprofileEditorShell } from "./SubprofileEditorShell";
import styles from "./SubprofileEditor.module.css";

const DASHBOARD = "/account/subprofiles";

/**
 * The owner editor for one subprofile — "Editor A": a left section rail, a
 * routed pane per rail entry, and a docked live preview. This component stays
 * a thin orchestrator: fetch + loading/not-found states and the page header;
 * the `.ed` grid interior (rail/panes/savebar/preview) plus its per-persona
 * `activePane`/`previewOpen`/editor state all live in `SubprofileEditorShell`,
 * mounted `key`ed on the persona id so it re-initializes across personas.
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
        <div className="wrap">
          <div className={styles.container}>
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
          </div>

          <div className={styles.shellWrap}>
            <div className="ed-shell">
              {/* Keyed on the persona id so the shell's `useSubprofileMetaEditor`
                  instance (shared between the form panes and the preview) and
                  its `activePane`/`previewOpen` state re-initialize when the
                  route lands on a DIFFERENT persona without a full page remount. */}
              <SubprofileEditorShell key={subprofile.id} subprofile={subprofile} backTo={DASHBOARD} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
