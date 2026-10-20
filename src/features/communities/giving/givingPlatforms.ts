import type { IconType } from "react-icons";
import {
  FiClipboard,
  FiCreditCard,
  FiHeart,
  FiLink,
  FiSmartphone,
} from "react-icons/fi";
import {
  SiBuymeacoffee,
  SiGofundme,
  SiLiberapay,
  SiOpencollective,
  SiPaypal,
} from "react-icons/si";
import type { CommunityGivingMethodDTO } from "../api/communityGiving.api";
import {
  parseHttpsUrl,
  stripLeadingWww,
} from "../../forum/funding/fundingLink";
import {
  SOCIAL_PLATFORMS,
  socialPlatform,
} from "../../../shared/social/socialPlatforms";

/** A known place to give money, named and drawn from a link's host. Brand
 *  labels are proper names and stay untranslated. */
export interface GivingPlatform {
  key: string;
  label: string;
  icon: IconType;
}

interface GivingPlatformEntry extends GivingPlatform {
  hosts: string[];
}

/** Checked in order before the social registry. Ko-fi and Patreon take their
 *  icon from the social registry so the two never draw them differently. */
const GIVING_PLATFORM_ENTRIES: GivingPlatformEntry[] = [
  {
    key: "patreon",
    label: "Patreon",
    icon: socialPlatform("patreon").icon,
    hosts: ["patreon.com"],
  },
  {
    key: "kofi",
    label: "Ko-fi",
    icon: socialPlatform("kofi").icon,
    hosts: ["ko-fi.com"],
  },
  {
    key: "paypal",
    label: "PayPal",
    icon: SiPaypal,
    hosts: ["paypal.me", "paypal.com"],
  },
  {
    key: "gofundme",
    label: "GoFundMe",
    icon: SiGofundme,
    hosts: ["gofundme.com"],
  },
  {
    key: "opencollective",
    label: "Open Collective",
    icon: SiOpencollective,
    hosts: ["opencollective.com"],
  },
  {
    key: "liberapay",
    label: "Liberapay",
    icon: SiLiberapay,
    hosts: ["liberapay.com"],
  },
  {
    key: "buymeacoffee",
    label: "Buy Me a Coffee",
    icon: SiBuymeacoffee,
    hosts: ["buymeacoffee.com"],
  },
  { key: "ppl", label: "PPL", icon: FiHeart, hosts: ["ppl.pt"] },
  {
    key: "googleforms",
    label: "Google Forms",
    icon: FiClipboard,
    hosts: ["forms.gle", "docs.google.com"],
  },
];

/** Social registry entries that carry a link prefix, keyed by its bare host,
 *  as the fallback after the giving table. */
const SOCIAL_PLATFORM_ENTRIES: GivingPlatformEntry[] = SOCIAL_PLATFORMS.flatMap(
  (platform) =>
    platform.hrefPrefix
      ? [
          {
            key: platform.key,
            label: platform.label,
            icon: platform.icon,
            hosts: [
              stripLeadingWww(
                new URL(platform.hrefPrefix).hostname.toLowerCase(),
              ),
            ],
          },
        ]
      : [],
);

function isHostOf(host: string, entryHost: string): boolean {
  return host === entryHost || host.endsWith(`.${entryHost}`);
}

function toPlatform(entry: GivingPlatformEntry): GivingPlatform {
  return { key: entry.key, label: entry.label, icon: entry.icon };
}

/** The link's bare host (lowercase, one leading "www." removed), or null
 *  when the value is no https link. */
export function givingLinkHost(url: string): string | null {
  const parsed = parseHttpsUrl(url);
  return parsed ? stripLeadingWww(parsed.hostname.toLowerCase()) : null;
}

/** The platform a link points at, matched on its host or a subdomain. */
export function givingPlatformForUrl(url: string): GivingPlatform | null {
  const host = givingLinkHost(url);
  if (host === null) return null;
  const entry =
    GIVING_PLATFORM_ENTRIES.find((candidate) =>
      candidate.hosts.some((entryHost) => isHostOf(host, entryHost)),
    ) ??
    SOCIAL_PLATFORM_ENTRIES.find((candidate) =>
      candidate.hosts.some((entryHost) => isHostOf(host, entryHost)),
    );
  return entry ? toPlatform(entry) : null;
}

/** The row title: the owner's label, else the platform name, the host or
 *  the raw link; "MB WAY" and "IBAN" for the two copy kinds. */
export function givingMethodTitle(
  method: Pick<CommunityGivingMethodDTO, "kind" | "label" | "value">,
): string {
  const trimmedLabel = method.label?.trim() ?? "";
  if (trimmedLabel) return trimmedLabel;
  if (method.kind === "mbway") return "MB WAY";
  if (method.kind === "iban") return "IBAN";
  return (
    givingPlatformForUrl(method.value)?.label ??
    givingLinkHost(method.value) ??
    method.value
  );
}

/** The row icon: the platform's mark or a plain link for links, a phone for
 *  MB WAY, a card for IBAN. */
export function givingMethodIcon(
  method: Pick<CommunityGivingMethodDTO, "kind" | "value">,
): IconType {
  if (method.kind === "mbway") return FiSmartphone;
  if (method.kind === "iban") return FiCreditCard;
  return givingPlatformForUrl(method.value)?.icon ?? FiLink;
}
