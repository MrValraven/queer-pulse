import { Fragment } from "react";
import { FiCheck } from "react-icons/fi";
import { ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EditorPaneKey, EditorRailGroup } from "./editorRail.data";
import { estimateEditorReadiness } from "./subprofileDraftReadiness";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SideReadinessRing } from "./SideReadinessRing";

/**
 * The mobile pane picker: the desktop rail's whole grouped nav, presented in a
 * bottom sheet. Opened from `EditorPaneSwitcher`'s centre button.
 *
 * It renders the SAME `EditorRailGroup[]` the rail does (built once in
 * `SubprofileEditorShell` and handed to both), so the two navigations cannot
 * drift: same group headings, same order, same item-count badges, same live
 * readiness ring on "Get it live".
 *
 * `ModalSheet` brings the sheet mechanics with it — drag-down dismiss, scrim
 * dismiss, Escape via the shared modal stack, and the body portal that keeps
 * the scrim anchored to the viewport rather than to the editor's contained
 * `.ed-shell`.
 */
export function EditorPaneSheet({
  groups,
  activePane,
  onSelect,
  onClose,
}: {
  groups: EditorRailGroup[];
  activePane: EditorPaneKey;
  onSelect: (pane: EditorPaneKey) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const editor = useSubprofileEditorContext();
  // Same override the rail applies: the groups were built off the SAVED
  // persona, but the ring must track the live editor snapshot so it reads the
  // same as the Publish pane's own ring while edits are still unsaved.
  const liveReadiness = estimateEditorReadiness(editor);

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("subprofiles:editorSwitch.title")}
    >
      <p className="ed-panes-title">{t("subprofiles:editorSwitch.title")}</p>
      <nav
        className="ed-panes"
        aria-label={t("subprofiles:editorRail.navLabel")}
      >
        {groups.map((group) => (
          <Fragment key={group.headingKey}>
            <p className="ed-panes-head">{t(group.headingKey)}</p>
            {group.entries.map((entry) => {
              const Icon = entry.icon;
              const isActive = entry.key === activePane;
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
                    <Icon size={17} aria-hidden />
                  )}
                  <span className="ed-panes-label">{t(entry.labelKey)}</span>
                  {entry.badge !== undefined && (
                    <span className="ed-panes-n">{entry.badge}</span>
                  )}
                  {/* The active row already reads as current to AT through
                      `aria-current`; this tick is the visual echo of it, so it
                      is decorative rather than another announced label. */}
                  {isActive && <FiCheck size={16} aria-hidden />}
                </button>
              );
            })}
          </Fragment>
        ))}
      </nav>
    </ModalSheet>
  );
}
