import { useId, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ManagedListingItem } from "../marketing/listBusiness/api/managedListings.api";
import { FieldEditorShell } from "./FieldEditorShell";
import {
  runBySelectionOf,
  type RunByListingView,
  type RunBySelection,
} from "./runByListing";
import { RunByPicker } from "./steps/RunByField";
import type { RunBySaveOutcome } from "./useGatheringEditSave";
import styles from "./EditRunByModal.module.css";

/**
 * The manage overview's "Run by" editor, in the shell the other row editors
 * share. It lists the businesses the acting organiser runs and "No
 * business"; Save turns on once the pick differs from what is stored.
 *
 * A business the acting organiser does not run (a co-host editing a
 * gathering the host links to their own business) is shown read-only, and
 * nothing is sent, so it can be neither cleared nor replaced by accident.
 * The host is the exception: when their own business has closed for good it
 * is gone from their managed list but still stored, so the host sees it in
 * the picker beside "No business" and can clear it.
 * While the list of businesses is still loading (`isResolving`) the editor
 * decides nothing: an empty list then means "not known yet". A refusal from
 * the server keeps the editor open with the reason under the picker; any
 * other ending closes it.
 */
export function EditRunByModal({
  initial,
  items,
  isResolving = false,
  isHost = false,
  onClose,
  onSave,
}: {
  initial: RunByListingView | null;
  items: ManagedListingItem[];
  isResolving?: boolean;
  /** The acting user is the gathering's host. */
  isHost?: boolean;
  onClose: () => void;
  onSave: (selection: RunBySelection) => Promise<RunBySaveOutcome>;
}) {
  const { t } = useTranslation();
  const pickerId = useId();
  const errorId = `${pickerId}-error`;
  const managedItem = initial
    ? (items.find((item) => item.ref === initial.ref) ?? null)
    : null;
  const isStoredBusinessUnmanaged =
    !isResolving && initial !== null && managedItem === null;
  // A host's closed business: shown in the picker as the stored value.
  const storedItem: ManagedListingItem | null =
    isStoredBusinessUnmanaged && isHost && initial
      ? {
          id: initial.ref,
          ref: initial.ref,
          slug: initial.slug,
          name: initial.name,
          kind: "mobile",
          meetingPoint: null,
        }
      : null;
  const initialItem = managedItem ?? storedItem;
  const pickerItems = storedItem ? [storedItem, ...items] : items;
  const isReadOnly = isStoredBusinessUnmanaged && !isHost;
  // Null until the host touches the picker, so the shown value follows the
  // stored business once the managed list resolves and untouched never
  // counts as a change.
  const [pickedOverride, setPickedOverride] = useState<{
    item: ManagedListingItem | null;
  } | null>(null);
  const picked = pickedOverride ? pickedOverride.item : initialItem;
  const [isRefused, setIsRefused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isChanged =
    !isResolving &&
    !isReadOnly &&
    (picked?.ref ?? null) !== (initial?.ref ?? null);

  const save = async () => {
    if (!isChanged || isSaving) return;
    setIsSaving(true);
    const outcome = await onSave(runBySelectionOf(picked));
    setIsSaving(false);
    if (outcome === "refused") {
      setIsRefused(true);
      return;
    }
    if (outcome !== "failed") onClose();
  };

  return (
    <FieldEditorShell
      title={t("gatherings:manage.details.runBy")}
      sub={t("gatherings:manage.fieldEditor.runBySub")}
      isSaveEnabled={isChanged && !isSaving}
      onSave={() => void save()}
      onClose={onClose}
    >
      {isResolving ? (
        <p className={styles.readOnly} aria-busy="true">
          {initial?.name}
        </p>
      ) : isReadOnly && initial ? (
        <p className={styles.readOnly}>
          {t("gatherings:manage.fieldEditor.runByReadOnly", {
            name: initial.name,
          })}
        </p>
      ) : (
        <>
          <label htmlFor={pickerId} className="visuallyHidden">
            {t("gatherings:create.v2.who.runByLabel")}
          </label>
          <RunByPicker
            id={pickerId}
            describedBy={isRefused ? errorId : undefined}
            items={pickerItems}
            value={picked?.id ?? null}
            onChange={(item) => {
              setPickedOverride({ item });
              setIsRefused(false);
            }}
          />
          {isRefused && (
            <p id={errorId} className={styles.error} role="alert">
              <FiAlertCircle aria-hidden />
              {t("gatherings:create.v2.who.runByRefused")}
            </p>
          )}
        </>
      )}
    </FieldEditorShell>
  );
}
