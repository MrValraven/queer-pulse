import { useState } from "react";
import { FiLayers, FiPlus } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, EmptyState, Modal, Spinner } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofiles } from "./api/useSubprofiles";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { MySubprofileRow } from "./MySubprofileRow";
import { NewSubprofileModal } from "./NewSubprofileModal";
import styles from "./MySubprofilesPage.module.css";

const MAX_SUBPROFILES = 12;

/**
 * Owner dashboard: every persona this member runs, with its state at a glance,
 * a create flow, and per-row edit / delete. Wrapped in `AppShell` (logged-in).
 */
export function MySubprofilesPage() {
  const { t } = useTranslation();
  const { data: subprofiles, isLoading } = useSubprofiles();
  const { remove } = useSubprofileMutations();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubprofileView | null>(null);

  const list = subprofiles ?? [];
  const atCap = list.length >= MAX_SUBPROFILES;

  async function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.displayName || t("subprofiles:mine.defaultName");
    try {
      await remove.mutateAsync(deleteTarget.id);
      showToast(t("subprofiles:mine.toastDeleted", { name }), "info");
    } catch {
      showToast(t("subprofiles:mine.toastDeleteError"), "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headText}>
              <h1 className={styles.title}>
                <Translation
                  i18nKey="subprofiles:mine.title"
                  components={{ em: <em /> }}
                />
              </h1>
              <p className={styles.sub}>{t("subprofiles:mine.sub")}</p>
            </div>
            {list.length > 0 && (
              <Button
                variant="primary"
                onClick={() => setCreating(true)}
                disabled={atCap}
              >
                <FiPlus size={16} aria-hidden /> {t("subprofiles:mine.newCta")}
              </Button>
            )}
          </header>

          {atCap && (
            <p className={styles.count}>{t("subprofiles:mine.atCap")}</p>
          )}

          {isLoading ? (
            <div role="status" aria-live="polite">
              <Spinner />
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<FiLayers />}
              title={t("subprofiles:mine.emptyTitle")}
              description={t("subprofiles:mine.emptyDescription")}
              action={{
                label: t("subprofiles:mine.emptyCta"),
                onClick: () => setCreating(true),
              }}
            />
          ) : (
            <div className={styles.list}>
              {list.map((sp) => (
                <MySubprofileRow
                  key={sp.id}
                  subprofile={sp}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {creating && <NewSubprofileModal onClose={() => setCreating(false)} />}

      {deleteTarget && (
        <Modal
          title={t("subprofiles:mine.deleteModalTitle")}
          sub={t("subprofiles:mine.deleteModalSub", {
            name:
              deleteTarget.displayName ||
              t("subprofiles:mine.deleteModalDefaultName"),
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("subprofiles:mine.deleteModalKeep")}
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={remove.isPending}
              >
                {remove.isPending
                  ? t("subprofiles:mine.deleteModalDeleting")
                  : t("subprofiles:mine.deleteModalConfirm")}
              </Button>
            </>
          }
        >
          <p>{t("subprofiles:mine.deleteModalBody")}</p>
        </Modal>
      )}
    </AppShell>
  );
}
