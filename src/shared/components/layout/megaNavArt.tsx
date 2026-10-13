import type { ReactNode } from "react";
import {
  AboutArt,
  CommunityArt,
  CultureArt,
  ResourcesArt,
  WorkArt,
} from "./megaNavArtIcons";

export const MEGA_NAV_ART: Record<string, ReactNode> = {
  Community: <CommunityArt />,
  Resources: <ResourcesArt />,
  Culture: <CultureArt />,
  Work: <WorkArt />,
  About: <AboutArt />,
};
