import { useEffect, useRef } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EditorPaneKey, EditorRailGroup } from "./editorRail.data";
import { EditorPaneSheet } from "./EditorPaneSheet";
import type { EditorPaneState } from "./useEditorPane";

/**
 * The mobile replacement for the desktop rail (`EditorRail` is hidden ≤760px).
 *
 * A sticky bar carrying three controls: step back a pane, the current pane's
 * name under its group heading, step forward a pane. Tapping the name opens
 * `EditorPaneSheet` with the full grouped list. So the common move — work down
 * the editor in order — is one tap, and jumping anywhere is two.
 *
 * This replaced a horizontal scroller that held the back link, all four group
 * headings and every pane button in one sideways strip: nothing showed where
 * you were in the editor, the strip scrolled away and never came back, and the
 * active pill was routinely off-screen.
 *
 * Rendered only under the JS mobile check in `SubprofileEditorShell`, which is
 * the SAME 760px viewport cut the CSS uses to hide the rail (a `@media` rule
 * there, deliberately not the `@container` query the rest of the editor's
 * breakpoints use — a container query resolves against `.ed-shell`'s inline
 * size, which is narrower than the viewport, so the two would disagree in a
 * band of widths that showed neither the rail nor this bar).
 */
export function EditorPaneSwitcher({
  groups,
  pane,
}: {
  groups: EditorRailGroup[];
  pane: EditorPaneState;
}) {
  const { t } = useTranslation();
  const {
    activePane,
    paneKeys,
    selectPane,
    isPickerOpen,
    openPicker,
    closePicker,
  } = pane;
  // Zero-height marker directly above the sticky bar. Scrolling THIS into view
  // is what puts the bar back at its resting position; the bar itself is
  // `position: sticky`, so once it is stuck its own box already sits where
  // `scrollIntoView` would put it and scrolling to it does nothing.
  const anchorRef = useRef<HTMLDivElement>(null);

  const activeIndex = paneKeys.indexOf(activePane);
  const previousPane = activeIndex > 0 ? paneKeys[activeIndex - 1] : null;
  const nextPane =
    activeIndex >= 0 && activeIndex < paneKeys.length - 1
      ? paneKeys[activeIndex + 1]
      : null;

  const activeGroup = groups.find((group) =>
    group.entries.some((entry) => entry.key === activePane),
  );
  const activeEntry = activeGroup?.entries.find(
    (entry) => entry.key === activePane,
  );

  /**
   * A pane change only rewrites the query string, and `ScrollManager` treats
   * that as re-filtering the page you are already on — it deliberately leaves
   * the scroll offset alone (see `isSameRouteQueryChange`). That is right for a
   * filter and wrong here: the owner lands halfway down a form they have not
   * seen. So the switcher scrolls itself back up on the way in.
   *
   * Flagged per deliberate choice rather than fired for every `activePane`
   * change, so Back is left alone — there `ScrollManager` restores the offset
   * the owner left that pane at, which is exactly what Back should do.
   */
  const pendingScrollRef = useRef(false);
  const goToPane = (target: EditorPaneKey) => {
    pendingScrollRef.current = true;
    selectPane(target);
  };

  // Deferred to an effect rather than run in the handler above because a choice
  // made in the sheet unmounts it in the same commit, and `useScrollLock`'s
  // cleanup restores the offset the sheet froze. Cleanups run before new
  // passive effects, so by the time this fires the body is free again and the
  // scroll sticks.
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    // `instant`, not the default: `html { scroll-behavior: smooth }` in base.css
    // would otherwise animate the whole outgoing pane past the owner.
    anchorRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [activePane, isPickerOpen]);

  return (
    <>
      <div ref={anchorRef} className="ed-switch-anchor" aria-hidden />
      <nav
        className="ed-switch"
        aria-label={t("subprofiles:editorRail.navLabel")}
      >
        <button
          type="button"
          className="ed-switch-step"
          onClick={() => previousPane && goToPane(previousPane)}
          disabled={!previousPane}
          aria-label={t("subprofiles:editorSwitch.previous")}
        >
          <FiChevronLeft size={20} aria-hidden />
        </button>

        <button
          type="button"
          className="ed-switch-current"
          onClick={openPicker}
          aria-expanded={isPickerOpen}
          aria-haspopup="dialog"
        >
          <span className="ed-switch-group">
            {activeGroup ? t(activeGroup.headingKey) : null}
          </span>
          <span className="ed-switch-name">
            {activeEntry ? t(activeEntry.labelKey) : null}
            <FiChevronDown size={16} aria-hidden />
          </span>
        </button>

        <button
          type="button"
          className="ed-switch-step"
          onClick={() => nextPane && goToPane(nextPane)}
          disabled={!nextPane}
          aria-label={t("subprofiles:editorSwitch.next")}
        >
          <FiChevronRight size={20} aria-hidden />
        </button>
      </nav>

      {isPickerOpen && (
        <EditorPaneSheet
          groups={groups}
          activePane={activePane}
          onSelect={goToPane}
          onClose={closePicker}
        />
      )}
    </>
  );
}
