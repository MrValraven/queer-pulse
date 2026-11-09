import type { JSX } from "react";
import { FiAlertTriangle, FiAperture, FiStar } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjGridSource } from "../top/VjRemoteTopRow";
import {
  VjHelpLegend,
  VjHelpMarker,
  VjHelpThumbMarker,
  type VjHelpLegendItem,
} from "../top/VjHelpLegend";

const VJ_LEGEND_ICON_PROPS = {
  "aria-hidden": true,
  focusable: false,
  fill: "none",
} as const;

export interface VjGridHelpLegendProps {
  source: VjGridSource;
  /** How many of the pack's clips couldn't load: the "See why" line explains the summary over the grid. */
  failedCount: number;
  /** The first clip's thumbnail stands for a tile; null while the pack shows no clip. */
  firstClipThumbnailUrl: string | null;
}

function useVjGridLegendItems({
  source,
  failedCount,
  firstClipThumbnailUrl,
}: VjGridHelpLegendProps): VjHelpLegendItem[] {
  const { t } = useTranslation();
  if (source === "generators") {
    return [
      {
        id: "generatorTile",
        marker: (
          <VjHelpMarker icon={<FiAperture {...VJ_LEGEND_ICON_PROPS} />} />
        ),
        text: t("vj:help.generatorTile"),
      },
    ];
  }
  const items: VjHelpLegendItem[] = [];
  if (failedCount > 0) {
    items.push({
      id: "clipFailures",
      marker: (
        <VjHelpMarker
          icon={<FiAlertTriangle {...VJ_LEGEND_ICON_PROPS} />}
          label={t("vj:remote.failures.seeWhy")}
        />
      ),
      text: t("vj:help.clipFailures"),
    });
  }
  if (firstClipThumbnailUrl !== null) {
    items.push(
      {
        id: "clipTile",
        marker: <VjHelpThumbMarker thumbnailUrl={firstClipThumbnailUrl} />,
        text: t("vj:help.clipTile"),
      },
      {
        id: "favoriteClip",
        marker: <VjHelpMarker icon={<FiStar {...VJ_LEGEND_ICON_PROPS} />} />,
        text: t("vj:help.favoriteClip"),
      },
    );
  }
  return items;
}

/**
 * One legend over the whole grid while help captions are on, shared by
 * every tile: a tile's tap and hold and its star for a pack, the
 * generator tiles for the generators, and the "See why" line while some
 * clips couldn't load.
 */
export function VjGridHelpLegend(props: VjGridHelpLegendProps): JSX.Element {
  const items = useVjGridLegendItems(props);
  return <VjHelpLegend items={items} placement="before" />;
}
