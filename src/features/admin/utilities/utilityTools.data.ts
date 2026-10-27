import type { IconType } from "react-icons";
import { FiFileText } from "react-icons/fi";
import { routes } from "../../../app/routeMap";

export interface UtilityTool {
  readonly id: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly to: string;
  readonly icon: IconType;
}

/** The tools the Utilities hub lists, in display order. */
export const UTILITY_TOOLS: readonly UtilityTool[] = [
  {
    id: "pdf",
    nameKey: "admin:utilities.tools.pdf.name",
    descriptionKey: "admin:utilities.tools.pdf.description",
    to: routes.adminUtilitiesPdf,
    icon: FiFileText,
  },
];
