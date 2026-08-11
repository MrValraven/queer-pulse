import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { buildEditorRailGroups, type EditorPaneKey } from "./editorRail.data";
import { estimateEditorReadiness } from "./subprofileDraftReadiness";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SideReadinessRing } from "./SideReadinessRing";

/**
 * The editor's grouped left nav — global `.ed-rail`/`.rail-head`/`.rail-n`
 * classes from `persona-editor.css` (Task 1), never a CSS module. It opens
 * with a `.rail-back` link to the dashboard (matching the design's
 * "‹ Your personas" rail head), then the grouped panes. Plain `<button>`s per
 * entry give native keyboard operability (Tab + Enter/Space) for free; the
 * active entry gets `aria-current="page"`, which the CSS keys its solid-fill
 * active state off of. The Publish entry renders the draft-readiness `.ring`
 * in place of an icon (the design's "Get it live" row). Collapses to a
 * horizontal scroller ≤760px via the CSS's own `@container` rule — nothing
 * here needs to branch on viewport width.
 */
export function EditorRail({
  subprofile,
  activePane,
  backTo,
  onSelect,
}: {
  subprofile: SubprofileView;
  activePane: EditorPaneKey;
  backTo: string;
  onSelect: (pane: EditorPaneKey) => void;
}) {
  const { t } = useTranslation();
  const editor = useSubprofileEditorContext();
  const groups = buildEditorRailGroups(subprofile);
  // The rail's "Get it live" ring tracks the LIVE editor snapshot (unsaved
  // edits included), matching the Publish pane's ring — `buildEditorRailGroups`
  // seeds it off the saved persona, so override with the live count here.
  const liveReadiness = estimateEditorReadiness(editor);

  return (
    <nav className="ed-rail" aria-label={t("subprofiles:editorRail.navLabel")}>
      <Link to={backTo} className="rail-back">
        <FiChevronLeft size={16} aria-hidden />
        {t("subprofiles:editorRail.backLink")}
      </Link>
      {groups.map((group) => (
        <Fragment key={group.headingKey}>
          <p className="rail-head">{t(group.headingKey)}</p>
          {group.entries.map((entry) => {
            const Icon = entry.icon;
            const isActive = entry.key === activePane;
            // Only the Publish entry carries a `ring`; render the live count.
            const ring = entry.ring ? liveReadiness : null;
            return (
              <button
                key={entry.key}
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
                {t(entry.labelKey)}
                {entry.badge !== undefined && (
                  <span className="rail-n">{entry.badge}</span>
                )}
              </button>
            );
          })}
        </Fragment>
      ))}
    </nav>
  );
}
