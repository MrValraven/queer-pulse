import type { IconType } from "react-icons";
import { FiDisc, FiGlobe, FiInstagram, FiYoutube } from "react-icons/fi";
import {
  SiBandcamp,
  SiFacebook,
  SiMixcloud,
  SiSoundcloud,
  SiSpotify,
  SiTiktok,
  SiX,
} from "react-icons/si";

export type LeadLinkPlatformId =
  | "instagram"
  | "tiktok"
  | "soundcloud"
  | "spotify"
  | "bandcamp"
  | "youtube"
  | "facebook"
  | "x"
  | "residentAdvisor"
  | "mixcloud"
  | "website";

/** A platform a lead's link can point at, spotted from the link's host. */
export interface LeadLinkPlatform {
  id: LeadLinkPlatformId;
  /** The hosts that count as this platform, with any subdomain of each. */
  hosts: readonly string[];
  labelKey: string;
  icon: IconType;
}

/** Every platform with known hosts, in the order the hosts are tried.
 *  Resident Advisor has no brand glyph in react-icons, so it shows a disc. */
export const LEAD_LINK_PLATFORMS: readonly LeadLinkPlatform[] = [
  {
    id: "instagram",
    hosts: ["instagram.com"],
    labelKey: "admin:leads.platform.instagram",
    icon: FiInstagram,
  },
  {
    id: "tiktok",
    hosts: ["tiktok.com"],
    labelKey: "admin:leads.platform.tiktok",
    icon: SiTiktok,
  },
  {
    id: "soundcloud",
    hosts: ["soundcloud.com"],
    labelKey: "admin:leads.platform.soundcloud",
    icon: SiSoundcloud,
  },
  {
    id: "spotify",
    hosts: ["spotify.com"],
    labelKey: "admin:leads.platform.spotify",
    icon: SiSpotify,
  },
  {
    id: "bandcamp",
    hosts: ["bandcamp.com"],
    labelKey: "admin:leads.platform.bandcamp",
    icon: SiBandcamp,
  },
  {
    id: "youtube",
    hosts: ["youtube.com", "youtu.be"],
    labelKey: "admin:leads.platform.youtube",
    icon: FiYoutube,
  },
  {
    id: "facebook",
    hosts: ["facebook.com", "fb.com"],
    labelKey: "admin:leads.platform.facebook",
    icon: SiFacebook,
  },
  {
    id: "x",
    hosts: ["x.com", "twitter.com"],
    labelKey: "admin:leads.platform.x",
    icon: SiX,
  },
  {
    id: "residentAdvisor",
    hosts: ["ra.co", "residentadvisor.net"],
    labelKey: "admin:leads.platform.residentAdvisor",
    icon: FiDisc,
  },
  {
    id: "mixcloud",
    hosts: ["mixcloud.com"],
    labelKey: "admin:leads.platform.mixcloud",
    icon: SiMixcloud,
  },
];

/** The platform of any link whose host matches none above, or that does not
 *  parse as a link. */
export const LEAD_WEBSITE_PLATFORM: LeadLinkPlatform = {
  id: "website",
  hosts: [],
  labelKey: "admin:leads.platform.website",
  icon: FiGlobe,
};
