import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPressKitList, type PressRowVM } from "./AdminPressKitList";
import {
  buildContactInput,
  pressValueFromContact,
} from "./adminPressKitFields.utils";
import {
  useAdminPressContacts,
  useCreatePressContact,
  useDeletePressContact,
  useReorderPressContacts,
  useUpdatePressContact,
} from "./api/useAdminPressKit";
import type { AdminPressContactDTO } from "./api/pressKit.api";

/** Maps a contact DTO to the presentational row VM — heading is the person's
 *  name, sub line is their role and languages. */
function contactToRowVM(contact: AdminPressContactDTO): PressRowVM {
  return {
    id: contact.id,
    active: contact.active,
    title: contact.name,
    sub: [contact.role, contact.languages].filter(Boolean).join(" · "),
    avatarUrl: contact.avatarUrl,
    seed: pressValueFromContact(contact),
  };
}

/** The "Team" tab: wires the contact hooks into the shared
 *  `AdminPressKitList`, handling create/edit/reorder/toggle/delete + toasts. */
export function AdminPressContactList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { contacts, isLoading, isError, refetch } = useAdminPressContacts();
  const createContact = useCreatePressContact();
  const updateContact = useUpdatePressContact();
  const deleteContact = useDeletePressContact();
  const reorderContacts = useReorderPressContacts();

  return (
    <AdminPressKitList
      kind="team"
      rows={contacts.map(contactToRowVM)}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      creating={createContact.isPending}
      deleting={deleteContact.isPending}
      onCreate={(value, done) =>
        createContact.mutate(buildContactInput(value), {
          onSuccess: () => {
            showToast(t("admin:pressKit.add.team.toast"));
            done();
          },
          onError: () => showToast(t("admin:pressKit.add.team.error")),
        })
      }
      onSaveEdit={(id, value, done) =>
        updateContact.mutate(
          { id, patch: buildContactInput(value) },
          {
            onSuccess: () => {
              showToast(t("admin:pressKit.editor.savedToast"));
              done();
            },
            onError: () => showToast(t("admin:pressKit.editor.saveError")),
          },
        )
      }
      onToggleActive={(row) =>
        updateContact.mutate(
          { id: row.id, patch: { active: !row.active } },
          {
            onError: () =>
              showToast(t("admin:pressKit.list.activeToggleError")),
          },
        )
      }
      onReorder={(orderedIds) =>
        reorderContacts.mutate(
          { orderedIds },
          { onError: () => showToast(t("admin:pressKit.list.reorderError")) },
        )
      }
      onDelete={(id) =>
        deleteContact.mutate(
          { id },
          {
            onSuccess: () => showToast(t("admin:pressKit.remove.toast")),
            onError: () => showToast(t("admin:pressKit.remove.error")),
          },
        )
      }
    />
  );
}
