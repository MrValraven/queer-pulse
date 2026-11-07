import { FiFilm, FiList } from "react-icons/fi";
import { Tabs } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjLibraryView } from "./useVjLibraryView";

/** The `idPrefix` the tab row and its panels share (`tabPanelProps`). The
 *  library mounts one tab row, so a fixed prefix is unique on the page. */
export const VJ_LIBRARY_VIEW_TABS_ID = "vj-library-view";

/**
 * The library's section switch: Clips (packs, the clip grid, uploads) and
 * Scenes and set lists. The shared pill tablist carries the roles and the
 * arrow, Home and End keys; the page renders the matching panel.
 */
export function VjLibraryViewTabs({
  view,
  onChange,
  className,
}: {
  view: VjLibraryView;
  onChange: (view: VjLibraryView) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <Tabs
      className={className}
      idPrefix={VJ_LIBRARY_VIEW_TABS_ID}
      label={t("vj:libraryView.label")}
      active={view}
      onChange={(tabId) => onChange(tabId === "show" ? "show" : "clips")}
      tabs={[
        {
          id: "clips",
          label: t("vj:libraryView.clips"),
          icon: <FiFilm aria-hidden />,
        },
        {
          id: "show",
          label: t("vj:libraryView.show"),
          icon: <FiList aria-hidden />,
        },
      ]}
    />
  );
}
