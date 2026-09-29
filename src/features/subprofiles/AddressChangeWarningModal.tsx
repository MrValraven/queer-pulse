import type { ReactNode } from "react";
import { FiAlertTriangle, FiLink2, FiUnlock, FiUsers } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface AddressChangeWarningModalProps {
  /** Caller-composed heading. Switching link mode and editing an already
   *  published address use different copy, so the title stays their call. */
  title: ReactNode;
  /** The path this persona is live at right now. */
  oldPath: string;
  /** The path it will live at once the pending change is confirmed, or null
   *  when it only gets one after the owner chooses a handle (a switch to
   *  standalone, or a cleared standalone handle). */
  newPath: string | null;
  /** True when this change frees a previously claimed global handle back to
   *  the namespace. Every address change does today, since each persona's one
   *  address is its handle. */
  releasesHandle: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * "What breaks" confirmation shown before a PUBLISHED persona's address
 * actually changes: flipping linked and unlinked, or editing an already live
 * handle. Only ever mounted while open (self-contained, per repo convention).
 * The caller (`SubprofileLinkFields`) holds the pending change and applies or
 * reverts it on `onConfirm`/`onCancel`. A draft persona never triggers this:
 * nothing is live yet, so there is nothing to break.
 */
export function AddressChangeWarningModal({
  title,
  oldPath,
  newPath,
  releasesHandle,
  onConfirm,
  onCancel,
}: AddressChangeWarningModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("subprofiles:addressWarning.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {t("subprofiles:addressWarning.confirm")}
          </Button>
        </>
      }
    >
      <div className="notice warn">
        <FiAlertTriangle size={20} aria-hidden />
        <div className="warnbody">
          <b>{t("subprofiles:addressWarning.noticeTitle")}</b>
          <p>
            {newPath === null
              ? t("subprofiles:addressWarning.noticeBodyNewHandle", {
                  from: oldPath,
                })
              : t("subprofiles:addressWarning.noticeBody", {
                  from: oldPath,
                  to: newPath,
                })}
          </p>
        </div>
      </div>

      <ul className="losing">
        <li>
          <FiLink2 size={16} aria-hidden />
          {t("subprofiles:addressWarning.oldLinksDie", { path: oldPath })}
        </li>
        {releasesHandle && (
          <li>
            <FiUnlock size={16} aria-hidden />
            {t("subprofiles:addressWarning.handleReleased")}
          </li>
        )}
        <li>
          <FiUsers size={16} aria-hidden />
          {t("subprofiles:addressWarning.followersKept")}
        </li>
      </ul>
    </Modal>
  );
}
