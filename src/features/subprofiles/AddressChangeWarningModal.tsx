import type { ReactNode } from "react";
import { FiAlertTriangle, FiLink2, FiUnlock, FiUsers } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface AddressChangeWarningModalProps {
  /** Caller-composed heading — switching link mode and editing an already-
   *  published address use different copy, so the title stays their call. */
  title: ReactNode;
  /** The path this persona is live at right now. */
  oldPath: string;
  /** The path it will live at once the pending change is confirmed. */
  newPath: string;
  /** True when this change frees a previously-claimed global `@handle` back
   *  to the namespace (relinking, or editing the handle while unlinked) — a
   *  linked→linked slug edit never claims/releases a handle at all. */
  releasesHandle: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * "What breaks" confirmation shown before a PUBLISHED persona's address
 * actually changes — either by flipping linked↔unlinked or by editing an
 * already-live slug/handle. Only ever mounted while open (self-contained,
 * per repo convention); the caller (`SubprofileLinkFields`) holds the
 * pending value and only commits it into the shared meta-editor state on
 * `onConfirm` — `onCancel` leaves that state untouched, i.e. the visible
 * revert already happened by never applying the change in the first place.
 * A draft/unpublished persona never triggers this — nothing is live yet, so
 * there's nothing to break.
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
            {t("subprofiles:addressWarning.noticeBody", {
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
