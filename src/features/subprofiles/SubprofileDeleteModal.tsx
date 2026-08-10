import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAtSign, FiGrid, FiUserCheck, FiUsers } from "react-icons/fi";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMembers } from "./api/useSubprofileMembers";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { isContentSection } from "./subprofile-kinds";
import styles from "./SubprofileDeleteModal.module.css";

/**
 * Type-to-confirm delete for the editor's Publish pane. Mirrors the
 * dashboard's (`MySubprofilesPage`) co-owner-aware delete copy/logic — the
 * same `useSubprofileMembers` shared-delete detection feeding
 * `deleteModalBodyShared` vs. `deleteModalBody`, and the same
 * `useSubprofileMutations().remove` call — but additionally requires typing
 * the persona's display name before Delete enables, and spells out exactly
 * what's lost (`.losing`, the global "what breaks" list) rather than a plain
 * confirm. Deleting removes the persona for every co-owner, not just the
 * signed-in one. On success, there's no editor left to return to, so this
 * navigates back to the dashboard (unlike the dashboard's own delete, which
 * just stays on the grid).
 */
export function SubprofileDeleteModal({
  subprofile,
  onClose,
}: {
  subprofile: SubprofileView;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { remove } = useSubprofileMutations();
  const { data: members } = useSubprofileMembers(subprofile.id);
  const [typedName, setTypedName] = useState("");

  const coOwnerCount = members?.length ?? 0;
  const isSharedDelete = coOwnerCount > 1;
  const requiredName =
    subprofile.displayName.trim() || t("subprofiles:mine.deleteModalDefaultName");
  const nameMatches = typedName.trim() === requiredName;

  const itemCount = subprofile.sections
    .filter((section) => isContentSection(section.section))
    .reduce((total, section) => total + section.items.length, 0);
  const releasesHandle =
    subprofile.linkVisibility === "unlinked" &&
    subprofile.status === "published" &&
    Boolean(subprofile.handle);

  async function confirmDelete() {
    try {
      await remove.mutateAsync(subprofile.id);
      showToast(t("subprofiles:mine.toastDeleted", { name: requiredName }), "info");
      void navigate(routes.subprofilesDashboard);
    } catch {
      showToast(t("subprofiles:mine.toastDeleteError"), "error");
    }
  }

  return (
    <Modal
      title={t("subprofiles:mine.deleteModalTitle")}
      sub={t("subprofiles:mine.deleteModalSub", { name: requiredName })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("subprofiles:mine.deleteModalKeep")}
          </Button>
          <Button
            variant="danger"
            onClick={() => void confirmDelete()}
            disabled={remove.isPending || !nameMatches}
          >
            {remove.isPending
              ? t("subprofiles:mine.deleteModalDeleting")
              : t("subprofiles:mine.deleteModalConfirm")}
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <p>
          {isSharedDelete
            ? t("subprofiles:mine.deleteModalBodyShared", {
                name: requiredName,
                n: coOwnerCount,
              })
            : t("subprofiles:mine.deleteModalBody")}
        </p>

        <ul className={`losing ${styles.losing}`}>
          <li>
            <FiGrid size={15} aria-hidden />
            {t("subprofiles:deleteConfirm.losingItems", { count: itemCount })}
          </li>
          <li>
            <FiUserCheck size={15} aria-hidden />
            {t("subprofiles:deleteConfirm.losingEndorsements", {
              count: subprofile.endorsementCount,
            })}
          </li>
          <li>
            <FiUsers size={15} aria-hidden />
            {t("subprofiles:deleteConfirm.losingFollowers", {
              count: subprofile.followerCount,
            })}
          </li>
          {releasesHandle && (
            <li>
              <FiAtSign size={15} aria-hidden />
              {t("subprofiles:deleteConfirm.losingHandle", {
                handle: subprofile.handle ?? "",
              })}
            </li>
          )}
        </ul>

        <FormField
          label={t("subprofiles:deleteConfirm.typeLabel", { name: requiredName })}
          helper={t("subprofiles:deleteConfirm.typeHelper")}
        >
          <input
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            placeholder={requiredName}
            autoComplete="off"
            spellCheck={false}
          />
        </FormField>
      </div>
    </Modal>
  );
}
