import type { ReactNode } from "react";
import {
  AboutArt,
  CommunityArt,
  CultureArt,
  LisbonArt,
  ResourcesArt,
  WorkArt,
} from "./megaNavArtIcons";

export const MEGA_NAV_ART: Record<string, ReactNode> = {
  Community: <CommunityArt />,
  Lisbon: <LisbonArt />,
  Resources: <ResourcesArt />,
  Culture: <CultureArt />,
  Work: <WorkArt />,
  About: <AboutArt />,
};
