import { useRef, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { initialsFromName } from "../../shared/lib/initials";
import { AdminAvatar, type AvatarTone } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import { useUpdateInviteQuota } from "./api/useAdminInvites";
import type { AdminInviteQuotaMemberDTO } from "./api/adminInvites.api";
import { describeInviteQuotaSaveError } from "./adminInviteQuotaErrors";
import {
  AdminInviteQuotaLimitEditor,
  type InviteQuotaSavingAction,
} from "./AdminInviteQuotaLimitEditor";
import {
  AdminInviteQuotaLimitValue,
  AdminInviteQuotaUsage,
} from "./AdminInviteQuotaFigures";
import styles from "./AdminInviteQuotaModal.module.css";

const AVATAR_TONES: AvatarTone[] = ["plum", "coral", "jade", "violet", "amber"];

/** A steady avatar tint per member, so a face without a photo keeps its
 *  colour from one search to the next. */
function avatarToneForSlug(slug: string): AvatarTone {
  let slugHash = 0;
  for (const character of slug) {
    slugHash = (slugHash * 31 + character.charCodeAt(0)) % 997;
  }
  return AVATAR_TONES[slugHash % AVATAR_TONES.length] ?? "plum";
}

/** The toast a settled save shows, naming the member and the new limit. */
function savedToastFor(
  quota: number | null,
  memberName: string,
  t: TFunction,
): string {
  if (quota === null) {
    return t("admin:adminInvites.quota.toast.usingDefault", {
      name: memberName,
    });
  }
  // A limit of 0 reads as a stop, which no plural form says well.
  if (quota === 0) {
    return t("admin:adminInvites.quota.toast.savedZero", { name: memberName });
  }
  return t("admin:adminInvites.quota.toast.saved", {
    name: memberName,
    count: quota,
  });
}

/**
 * One member in the invite limits list: who they are, this month's usage
 * against their limit, the limit and where it comes from, and a direct-verb
 * button that folds the limit editor open under the row. The save runs on
 * the row's own mutation, so its pending state and any failure stay here.
 *
 * The success toast and the editor close run from the mutation's own
 * `onSuccess` (see `useUpdateInviteQuota`), so they still run when the live
 * refetch drops this row; the modal then moves focus to the search field.
 */
export function AdminInviteQuotaRow({
  member,
  defaultMonthlyQuota,
}: {
  member: AdminInviteQuotaMemberDTO;
  /** The platform default the list's page reports, before any bonus. */
  defaultMonthlyQuota: number;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const demoPortrait = useDemoPortrait();
  const [isEditing, setIsEditing] = useState(false);
  const rowRef = useRef<HTMLLIElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const hasOverride = member.inviteMonthlyQuota !== null;

  function handleSaved({ quota }: { quota: number | null }) {
    showToast(savedToastFor(quota, member.name, t), "success");
    setIsEditing(false);
    // Hand focus back to the row's button while it still sits in this row
    // (or fell to the page). Once the row has left the list the ref is
    // empty, and the modal has already moved focus to the search field.
    const activeElement = document.activeElement;
    const isFocusInRow = rowRef.current?.contains(activeElement) ?? false;
    if (isFocusInRow || activeElement === document.body) {
      editButtonRef.current?.focus();
    }
  }

  const updateInviteQuota = useUpdateInviteQuota({ onSaved: handleSaved });

  const savingAction: InviteQuotaSavingAction = updateInviteQuota.isPending
    ? updateInviteQuota.variables?.quota === null
      ? "useDefault"
      : "save"
    : null;
  const isSaving = savingAction !== null;
  const serverError = updateInviteQuota.isError
    ? describeInviteQuotaSaveError(updateInviteQuota.error, member.name, t)
    : null;

  function closeEditor() {
    setIsEditing(false);
    // The editor is folding away and inert, so hand focus back to the
    // button that opened it.
    editButtonRef.current?.focus();
  }

  function handleToggleEditor() {
    if (isSaving) return;
    if (isEditing) {
      closeEditor();
      return;
    }
    updateInviteQuota.reset();
    setIsEditing(true);
  }

  function handleSave(quota: number | null) {
    updateInviteQuota.mutate({ slug: member.slug, quota });
  }

  return (
    <li
      ref={rowRef}
      data-member-slug={member.slug}
      className={styles.row}
      data-editing={isEditing || undefined}
      aria-busy={isSaving || undefined}
    >
      <div className={styles.memberCell}>
        <AdminAvatar
          initials={initialsFromName(member.name, "?")}
          tone={avatarToneForSlug(member.slug)}
          size="md"
          // Their own photo in live mode; the name-keyed registry only
          // stands in for demo fixtures, which have no `avatarUrl`.
          src={member.avatarUrl ?? demoPortrait(member.name)}
          alt=""
        />
        <div className={styles.memberText}>
          <span className={styles.memberName} title={member.name}>
            {member.name}
          </span>
          <span className={styles.memberMeta}>
            {t("admin:adminInvites.quota.sentTotal", {
              count: member.sentTotal,
            })}
          </span>
        </div>
      </div>
      <AdminInviteQuotaUsage
        sentThisMonth={member.sentThisMonth}
        monthlyLimit={member.monthlyLimit}
        // An older backend leaves the field out; only an explicit `false`
        // reads as paused.
        isPaused={member.hasInviteAccess === false}
      />
      <AdminInviteQuotaLimitValue member={member} />
      <div className={styles.actionCell}>
        <Button
          ref={editButtonRef}
          variant="quiet"
          size="sm"
          aria-expanded={isEditing}
          aria-disabled={isSaving || undefined}
          aria-label={t(
            hasOverride
              ? "admin:adminInvites.quota.editLimitAria"
              : "admin:adminInvites.quota.setLimitAria",
            { name: member.name },
          )}
          onClick={handleToggleEditor}
        >
          <FiEdit2 aria-hidden />
          {hasOverride
            ? t("admin:adminInvites.quota.editLimitCta")
            : t("admin:adminInvites.quota.setLimitCta")}
        </Button>
      </div>
      <Collapse isOpen={isEditing} className={styles.editorSlot}>
        <AdminInviteQuotaLimitEditor
          member={member}
          defaultMonthlyQuota={defaultMonthlyQuota}
          savingAction={savingAction}
          serverError={serverError}
          onSave={handleSave}
          onCancel={closeEditor}
        />
      </Collapse>
    </li>
  );
}
