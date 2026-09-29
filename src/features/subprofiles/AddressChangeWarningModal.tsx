import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiEyeOff,
  FiLink2,
  FiUnlock,
  FiUserX,
  FiUsers,
} from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AddressChangeKind } from "./subprofileAddressChange";

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
   *  the namespace outright (no forwarding). A plain rename releases the old
   *  handle WITH forwarding instead, which `changeKind === "rename"` covers
   *  with its own line, so this only gates the "back in the pool" item for
   *  every other kind of change. */
  releasesHandle: boolean;
  /** Which copy branch this pending change needs (PRD-427, ENG-447); see
   *  `addressChangeKindFor` in `subprofileAddressChange.ts`. */
  changeKind: AddressChangeKind;
  /** The saved counts the `"linkToUnlink"` branch names in its loss notice.
   *  Left out (or both zero), the notice speaks of followers and
   *  endorsements without numbers. */
  followerCount?: number;
  endorsementCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/** The loss that leads the `"linkToUnlink"` branch: the one consequence of
 *  any address change that cannot be undone, so it takes the warning notice
 *  and every recoverable consequence sits in the quieter list below. */
function UnlinkLossNotice({
  followerCount,
  endorsementCount,
  t,
}: {
  followerCount?: number;
  endorsementCount?: number;
  t: TFunction;
}) {
  const hasCounts =
    followerCount !== undefined &&
    endorsementCount !== undefined &&
    followerCount + endorsementCount > 0;
  return (
    <div className="notice warn">
      <FiUserX size={20} aria-hidden />
      <div className="warnbody">
        <b>
          {hasCounts
            ? t("subprofiles:addressWarning.unlinkLossTitleCounts", {
                followers: t("subprofiles:deleteConfirm.losingFollowers", {
                  count: followerCount,
                }),
                endorsements: t(
                  "subprofiles:deleteConfirm.losingEndorsements",
                  { count: endorsementCount },
                ),
              })
            : t("subprofiles:addressWarning.unlinkLossTitle")}
        </b>
        <p>{t("subprofiles:addressWarning.unlinkLossBody")}</p>
      </div>
    </div>
  );
}

/** The top notice for every branch but `"linkToUnlink"`. A rename keeps the
 *  page live and forwards the old address, so it reads as a neutral note of
 *  where the page goes. The other changes retire a live address and keep the
 *  warning. */
function AddressNotice({
  oldPath,
  newPath,
  isRename,
  t,
}: {
  oldPath: string;
  newPath: string | null;
  isRename: boolean;
  t: TFunction;
}) {
  if (isRename && newPath !== null) {
    return (
      <div className="notice">
        <FiArrowRight size={20} aria-hidden />
        <div className="warnbody">
          <b>
            {t("subprofiles:addressWarning.renameNoticeTitle", {
              to: newPath,
            })}
          </b>
        </div>
      </div>
    );
  }
  return (
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
  );
}

/**
 * "What breaks" confirmation shown before a PUBLISHED persona's address
 * actually changes: flipping linked and unlinked, or editing an already live
 * handle. Only ever mounted while open (self-contained, per repo convention).
 * The caller (`SubprofileLinkFields`) holds the pending change and applies or
 * reverts it on `onConfirm`/`onCancel`. A draft persona never triggers this:
 * nothing is live yet, so there is nothing to break.
 *
 * `changeKind` picks the copy:
 * - `"rename"`: the page stays published, right at its new address, so the
 *   top note is a neutral "your page moves here" and the list carries the
 *   OLD address's forwarding window before it finally dies (PRD-427).
 *   Nothing here is released to the pool the moment this confirms.
 * - `"linkToUnlink"`: the one direction that also drops followers and
 *   endorsements, so nothing left behind still ties the new pseudonymous
 *   address back to its owner (ENG-447's clean break). That permanent loss
 *   leads, in the warning notice, and the confirm is a danger button that
 *   names it. The server also drafts the persona on this switch, so the list
 *   says it goes back to draft until it is published again.
 * - `"other"`: the original generic copy (switching unlinked to linked, or a
 *   link switch still awaiting a typed handle).
 *
 * A released handle (every link switch) is held for its cooldown with no
 * forwarding: nobody, the owner included, can claim it until that lapses.
 */
export function AddressChangeWarningModal({
  title,
  oldPath,
  newPath,
  releasesHandle,
  changeKind,
  followerCount,
  endorsementCount,
  onConfirm,
  onCancel,
}: AddressChangeWarningModalProps) {
  const { t } = useTranslation();
  const isRename = changeKind === "rename";
  const isUnlink = changeKind === "linkToUnlink";

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("subprofiles:addressWarning.cancel")}
          </Button>
          <Button variant={isUnlink ? "danger" : "primary"} onClick={onConfirm}>
            {t(
              isUnlink
                ? "subprofiles:addressWarning.confirmUnlink"
                : "subprofiles:addressWarning.confirm",
            )}
          </Button>
        </>
      }
    >
      {isUnlink ? (
        <UnlinkLossNotice
          followerCount={followerCount}
          endorsementCount={endorsementCount}
          t={t}
        />
      ) : (
        <AddressNotice
          oldPath={oldPath}
          newPath={newPath}
          isRename={isRename}
          t={t}
        />
      )}

      <ul className="losing">
        {isRename ? (
          <li>
            <FiLink2 size={16} aria-hidden />
            {t("subprofiles:addressWarning.renameOldLinksForward", {
              path: oldPath,
            })}
          </li>
        ) : (
          <>
            <li>
              <FiLink2 size={16} aria-hidden />
              {t("subprofiles:addressWarning.oldLinksDie", { path: oldPath })}
            </li>
            {isUnlink && (
              <li>
                <FiEyeOff size={16} aria-hidden />
                {t("subprofiles:addressWarning.unlinkBackToDraft")}
              </li>
            )}
            {releasesHandle && (
              <li>
                <FiUnlock size={16} aria-hidden />
                {t("subprofiles:addressWarning.handleReleased")}
              </li>
            )}
          </>
        )}
        {!isUnlink && (
          <li>
            <FiUsers size={16} aria-hidden />
            {t("subprofiles:addressWarning.followersKept")}
          </li>
        )}
      </ul>
    </Modal>
  );
}
