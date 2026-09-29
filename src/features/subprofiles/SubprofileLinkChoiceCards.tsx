import { FiLock } from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import type { LinkVisibility } from "./api/subprofiles.api";
import { LINK_HELP_KEY, LINK_TO_LABEL_KEY } from "./subprofileEditor.data";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { pathFor } from "./subprofileAddressChange";

/** The linked/unlinked `.choice` card pair of the Address pane. Split out of
 *  `SubprofileLinkFields` to keep that pane under the line cap;
 *  `linkChoiceLocked`/`showLinkLockHint` come from `linkChoiceLockState` (see
 *  there for the product rule they encode). */
export function SubprofileLinkChoiceCards({
  editor,
  creatorSlug,
  linkChoiceLocked,
  showLinkLockHint,
  onSelect,
  t,
}: {
  editor: SubprofileMetaEditor;
  /** Undefined while the persona's creator is still resolving. */
  creatorSlug: string | undefined;
  linkChoiceLocked: boolean;
  showLinkLockHint: boolean;
  onSelect: (target: LinkVisibility) => void;
  t: TFunction;
}) {
  // Each card previews the address it would give. The selected card shows the
  // typed handle; the other starts empty, since a switch clears the handle.
  // Availability lives on the handle field below, so the cards carry no status.
  function handleFor(mode: LinkVisibility) {
    return editor.link === mode ? editor.handle : "";
  }
  function addressFor(mode: LinkVisibility) {
    return pathFor(mode, creatorSlug ?? "…", editor.slug, handleFor(mode));
  }
  // The note explains the derived default, so it shows only while the linked
  // card previews that default (no typed handle on it).
  const shouldShowLinkedNote = Boolean(creatorSlug) && !handleFor("linked");

  return (
    <div className="choices">
      <button
        type="button"
        className="choice"
        aria-pressed={editor.link === "linked"}
        disabled={linkChoiceLocked}
        onClick={() => onSelect("linked")}
      >
        <b>{t(LINK_TO_LABEL_KEY.linked)}</b>
        <p>{t(LINK_HELP_KEY.linked)}</p>
        <code>{addressFor("linked")}</code>
        {shouldShowLinkedNote && (
          <p className="handlestate idle">
            {t("subprofiles:newModal.linkedAddressNote", {
              creator: creatorSlug,
            })}
          </p>
        )}
        {showLinkLockHint && (
          <p className="choiceLockHint">
            <FiLock aria-hidden />
            {t("subprofiles:link.creatorOnlyHint")}
          </p>
        )}
      </button>
      <button
        type="button"
        className="choice"
        aria-pressed={editor.link === "unlinked"}
        onClick={() => onSelect("unlinked")}
      >
        <b>{t(LINK_TO_LABEL_KEY.unlinked)}</b>
        <p>{t(LINK_HELP_KEY.unlinked)}</p>
        <code>{addressFor("unlinked")}</code>
        <p className="handlestate idle">
          {t("subprofiles:newModal.standaloneNote")}
        </p>
      </button>
    </div>
  );
}
