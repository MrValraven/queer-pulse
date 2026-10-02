import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofilePageBody } from "./SubprofilePageBody";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { PersonaViewMode } from "./personaSkinRender";
import { PreviewDeviceToggle } from "./PreviewDeviceToggle";
import type { PreviewDevice } from "./usePreviewFit";
import { useEditorPreviewView } from "./useEditorPreviewView";
import { usePreviewChapterFocus } from "./usePreviewChapterFocus";

/** No-op: the tree is fully inert in `mode="preview"` (Task 3), so these
 *  handlers exist only to satisfy `SubprofilePageBody`'s prop contract and
 *  are never actually invoked by anything the preview renders. */
function noop() {}

const PREVIEW_MODE: PersonaViewMode = "preview";

/**
 * The docked live preview's contents, mounted as the direct children of the
 * `.ed-preview` sticky column `SubprofileEditorPage` already lays out (that
 * outer element owns the sticky/height/flex-column shell; `.ed-prev-bar` and
 * `.ed-prev-scroll` below are its flex children, per `persona-editor.css`).
 *
 * Reuses the exact same `SubprofilePageBody` tree the public persona page
 * renders, "never lies" because it's the same renderer. Its derived state
 * (the saved persona overlaid with the in-progress editor state, the
 * resolved skin and showcase data, the "Open live" href) is built by
 * `useEditorPreviewView`, shared with nothing else today but kept as its own
 * hook so this component stays a render.
 *
 * The page lays itself out at the chosen device's real width and is zoomed
 * down to the dock (`usePreviewFit`, inside the hook above), so Desktop shows
 * the true laptop layout. It sits in a card (the frame) that hugs it, and on
 * a device switch the card morphs between the phone's and the laptop's
 * outline.
 * The Mobile / Desktop switch shows only when the viewport has room for the
 * wider Desktop dock (`canPreviewDesktop`, decided by the shell).
 *
 * While Page blocks is open the preview follows the chapter on screen: it
 * scrolls to that chapter's blocks and rings them (`usePreviewChapterFocus`),
 * and an empty list chapter says it shows once it has something in it.
 */
export function EditorPreview({
  subprofile,
  device,
  canPreviewDesktop,
  onDeviceChange,
}: {
  subprofile: SubprofileView;
  device: PreviewDevice;
  canPreviewDesktop: boolean;
  onDeviceChange: (device: PreviewDevice) => void;
}) {
  const { t } = useTranslation();
  const {
    scrollRef,
    frameRef,
    pageRef,
    skin,
    layoutName,
    data,
    skinStyle,
    liveHref,
    isDraftHref,
  } = useEditorPreviewView(subprofile, device);
  const focus = usePreviewChapterFocus({ scrollRef, pageRef });

  return (
    <>
      <div className="ed-prev-bar">
        <span className="ed-prev-label">
          {/* A no-break space ends the lead: flex drops a plain one between
              the two spans, and screen readers need the words apart. */}
          <span className="ed-prev-label-lead">
            {`${t("subprofiles:editorPreview.label")} ·\u00a0`}
          </span>
          <span className="ed-prev-label-layout">{layoutName}</span>
        </span>
        {canPreviewDesktop && (
          <PreviewDeviceToggle device={device} onChange={onDeviceChange} />
        )}
        {liveHref && (
          <Button
            variant="ghost"
            size="sm"
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* A draft's page answers its owners alone, so it opens as the
                draft page it is. */}
            {t(
              isDraftHref
                ? "subprofiles:editorPreview.openDraftPage"
                : "subprofiles:editorPreview.openLive",
            )}{" "}
            <FiExternalLink aria-hidden />
          </Button>
        )}
      </div>
      <div className="ed-prev-scroll" ref={scrollRef}>
        {/* An empty list chapter has nothing on the page to point at, so the
            preview says where it will appear instead of staying silent. */}
        {focus.chapter && focus.isChapterEmpty && (
          <p className="ed-prev-note" role="status">
            {t("subprofiles:editorPreview.chapterEmpty", {
              title: t(focus.chapter.titleKey),
            })}
          </p>
        )}
        {/* `usePreviewFit` writes the page's layout width and `zoom` onto
            `.ed-prev-page`, morphs the card's width during a device swap,
            and stamps the swap's phase on the scroller, so the fade, the
            morph and the width change of a Mobile / Desktop switch add no
            render of the page tree. */}
        <div ref={frameRef} className="ed-prev-frame">
          <div ref={pageRef} className="ed-prev-page">
            <SubprofilePageBody
              data={data}
              skin={skin}
              mode={PREVIEW_MODE}
              skinVars={skinStyle}
              onAction={noop}
              onOpenWorkAt={noop}
              onOpenWorkItem={noop}
              onOpenGalleryPhoto={noop}
              onOpenPoem={noop}
            />
          </div>
        </div>
      </div>
    </>
  );
}
