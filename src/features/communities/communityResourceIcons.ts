import { FiBookOpen, FiFileText, FiLink } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { CommunityResourceKind } from "./api/communityResources.api";

/**
 * One icon per resource kind, so the shelf labels a row without guessing from
 * its URL. Its own module rather than an export beside a component, because a
 * file that exports both a component and a constant breaks Vite's fast refresh
 * for that file.
 */
export const RESOURCE_ICON: Record<CommunityResourceKind, IconType> = {
  link: FiLink,
  doc: FiFileText,
  guide: FiBookOpen,
};
