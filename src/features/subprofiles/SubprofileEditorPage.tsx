import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Badge, EmptyState, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { useSubprofile } from "./api/useSubprofile";
import { STATUS_BADGE } from "./mySubprofiles.data";
import type { EditorPaneKey } from "./editorRail.data";
import { EditorRail } from "./EditorRail";
import { EditorPaneRouter } from "./EditorPaneRouter";
import { EditorSavebar } from "./EditorSavebar";
import { EditorPreview } from "./EditorPreview";
import styles from "./SubprofileEditor.module.css";

const DASHBOARD = "/account/subprofiles";

/**
 * The owner editor for one subprofile — "Editor A": a left section rail, a
 * routed pane per rail entry, and a docked preview slot (mounted by Task 6).
 * This component stays a thin orchestrator: fetch + loading/not-found states,
 * `activePane`/`previewOpen` state, and the `.ed-shell` > `.ed` layout skeleton.
 * All pane-selection/rendering logic lives in `EditorRail`/`EditorPaneRouter`;
 * every reparented panel (meta form, socials, section editors, affiliations,
 * owners, publish) is unchanged from before this rewrite — only WHERE they
 * mount changed, not what they do.
 */
export function SubprofileEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: subprofile, isLoading } = useSubprofile(id);
  const [activePane, setActivePane] = useState<EditorPaneKey>("identity");
  const [previewOpen, setPreviewOpen] = useState(true);

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
              <div className="ed" data-preview={previewOpen ? "on" : "off"}>
                <EditorRail
                  subprofile={subprofile}
                  activePane={activePane}
                  backTo={DASHBOARD}
                  onSelect={setActivePane}
                />

                <div className="ed-main">
                  {/* Keyed on the persona id (not just `activePane`) so the
                      shared `useSubprofileMetaEditor` instance inside
                      `EditorPaneRouter` re-initializes when the route lands
                      on a DIFFERENT persona without a full page remount —
                      mirrors the old `SubprofileMetaForm key={subprofile.id}`
                      this replaced. */}
                  <EditorPaneRouter key={subprofile.id} pane={activePane} subprofile={subprofile} />
                  <EditorSavebar
                    previewOpen={previewOpen}
                    onTogglePreview={() => setPreviewOpen((open) => !open)}
                  />
                </div>

                <div className="ed-preview">
                  {previewOpen && <EditorPreview subprofile={subprofile} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
