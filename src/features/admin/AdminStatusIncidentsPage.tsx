import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { describeError } from "../../shared/api/errorMessage";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { useAdminStatusIncidents } from "./api/useAdminStatusIncidents";
import { useResolveStatusIncident } from "./api/useAdminStatusIncidentMutations";
import { AdminStatusIncidentRows } from "./AdminStatusIncidentRows";
import { AdminStatusIncidentForm } from "./AdminStatusIncidentForm";
import type { AdminStatusIncidentDTO } from "./api/adminStatusIncidents.api";
import styles from "./AdminStatusIncidentsPage.module.css";

type EditorMode =
  { kind: "create" } | { kind: "edit"; incident: AdminStatusIncidentDTO };

/**
 * `/admin/status-incidents` — where an operator writes up what is going wrong
 * for the public status page to show (ID-16).
 *
 * This is the only admin surface whose output is read by people with NO
 * session, so the header says so: the platform sends no email, and a member who
 * cannot sign in has nowhere else to find out whether the fault is theirs.
 * Guarded `@Roles(Moderator, Admin)` on the backend, because an incident is
 * often first spotted by whoever is working the queue at 2am.
 */
export function AdminStatusIncidentsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { data, isLoading, isError, error } = useAdminStatusIncidents();
  const resolveIncident = useResolveStatusIncident();
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;
  const incidents = data ?? [];

  function handleResolve(incident: AdminStatusIncidentDTO) {
    resolveIncident.mutate(incident.id, {
      onSuccess: () =>
        showToast(t("system:statusAdmin.toast.resolved"), "success"),
      onError: (mutationError) =>
        showToast(
          describeError(
            t("system:statusAdmin.error.resolve"),
            mutationError,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        ),
    });
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="system:statusAdmin.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("system:statusAdmin.breadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("system:statusAdmin.eyebrow")}
          title={
            <Translation
              i18nKey="system:statusAdmin.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("system:statusAdmin.headerSub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setEditorMode({ kind: "create" })}
            >
              {t("system:statusAdmin.newCta")}
            </Button>
          }
        />
      </FadeIn>

      {demoMode && (
        <p className={styles.notice}>{t("system:statusAdmin.demoNotice")}</p>
      )}

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={78}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <p className={styles.notice}>
          {isForbidden
            ? t("system:statusAdmin.forbidden")
            : t("system:statusAdmin.loadError")}
        </p>
      ) : incidents.length === 0 ? (
        <p className={styles.notice}>{t("system:statusAdmin.empty")}</p>
      ) : (
        <AdminStatusIncidentRows
          incidents={incidents}
          onEdit={(incident) => setEditorMode({ kind: "edit", incident })}
          onResolve={handleResolve}
          isResolving={resolveIncident.isPending}
        />
      )}

      {editorMode && (
        <AdminStatusIncidentForm
          incident={editorMode.kind === "edit" ? editorMode.incident : null}
          onClose={() => setEditorMode(null)}
        />
      )}
    </AdminShell>
  );
}
