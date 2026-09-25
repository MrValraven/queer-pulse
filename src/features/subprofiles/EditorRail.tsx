import { Fragment } from "react";
import { FiChevronsLeft } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EditorPaneKey, EditorRailGroup } from "./editorRail.data";
import { estimateEditorReadiness } from "./subprofileDraftReadiness";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SideReadinessRing } from "./SideReadinessRing";

/**
 * The editor's grouped left nav — global `.ed-rail`/`.rail-head`/`.rail-n`
 * classes from `persona-editor.css` (Task 1), never a CSS module. It lists
 * the grouped panes, then closes with a `.rail-foot` row under a hairline:
 * the collapse toggle, drawn as a labelled row like the entries above it.
 * The way back to the dashboard sits beside the page title, in the gutter on
 * wide screens (`SubprofileEditorPage`). Plain `<button>`s per
 * entry give native keyboard operability (Tab + Enter/Space) for free; the
 * active entry gets `aria-current="page"`, which the CSS keys its solid-fill
 * active state off of. The Publish entry renders the draft-readiness `.ring`
 * in place of an icon (the design's "Get it live" row). Hidden outright ≤760px
 * by the CSS's own `@media` rule, where `EditorPaneSwitcher` navigates instead
 * — nothing here needs to branch on viewport width.
 *
 * `groups` is built once by `SubprofileEditorShell` and shared with the mobile
 * `EditorPaneSwitcher`, so the two navigations always offer the same entries in
 * the same order with the same badges.
 *
 * `isCollapsed` folds the rail to an icon strip. The fold is ALL CSS, keyed off
 * `data-rail` on the `.ed` grid: the column narrows while labels, group
 * headings and badges fade out in place (`.rail-label`, still in the DOM and
 * the accessibility tree, so each control keeps its accessible name) and the
 * icons glide to the strip's centre. Nothing here swaps classes or elements
 * with the state, because a remounted or reclassed node snaps to its end
 * state instead of transitioning. For the same reason every control is ALWAYS
 * wrapped in its tooltip, switched off while the rail is wide: a wrapper that
 * came and went would remount the button (and drop keyboard focus to the
 * page), and the toggle keeps one chevron that the CSS turns around.
 */
export function EditorRail({
  groups,
  activePane,
  isCollapsed,
  onSelect,
  onToggleCollapse,
}: {
  groups: EditorRailGroup[];
  activePane: EditorPaneKey;
  isCollapsed: boolean;
  onSelect: (pane: EditorPaneKey) => void;
  onToggleCollapse: () => void;
}) {
  const { t } = useTranslation();
  const editor = useSubprofileEditorContext();
  // The rail's "Get it live" ring tracks the LIVE editor snapshot (unsaved
  // edits included), matching the Publish pane's ring — `buildEditorRailGroups`
  // seeds it off the saved persona, so override with the live count here.
  const liveReadiness = estimateEditorReadiness(editor);
  const toggleLabel = isCollapsed
    ? t("subprofiles:editorRail.expand")
    : t("subprofiles:editorRail.collapse");

  return (
    <nav className="ed-rail" aria-label={t("subprofiles:editorRail.navLabel")}>
      {groups.map((group) => (
        <Fragment key={group.headingKey}>
          <p className="rail-head">
            <span className="rail-label">{t(group.headingKey)}</span>
          </p>
          {group.entries.map((entry) => {
            const Icon = entry.icon;
            const isActive = entry.key === activePane;
            const label = t(entry.labelKey);
            // Only the Publish entry carries a `ring`; render the live count.
            const ring = entry.ring ? liveReadiness : null;
            return (
              <Tooltip
                key={entry.key}
                label={label}
                placement="right"
                isDisabled={!isCollapsed}
              >
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onSelect(entry.key)}
                >
                  {ring ? (
                    <SideReadinessRing
                      readyCount={ring.readyCount}
                      totalCount={ring.totalCount}
                    />
                  ) : (
                    <Icon size={16} aria-hidden />
                  )}
                  <span className="rail-label">{label}</span>
                  {entry.badge !== undefined && (
                    <span className="rail-label rail-n">{entry.badge}</span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </Fragment>
      ))}
      <div className="rail-foot">
        <Tooltip
          label={toggleLabel}
          placement="right"
          isDisabled={!isCollapsed}
        >
          <button
            type="button"
            className="rail-toggle"
            aria-label={toggleLabel}
            onClick={onToggleCollapse}
          >
            <FiChevronsLeft size={16} aria-hidden />
            <span className="rail-label">
              {t("subprofiles:editorRail.collapseShort")}
            </span>
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}
