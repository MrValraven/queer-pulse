import type { IconType } from "react-icons";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FiMessageSquare } from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import { currentUser } from "../members/data/members";

export const SENDER_NAME = `${currentUser.first} ${currentUser.last}`;

export const INVITE_CODE = "QP-7F3K-2026";

/** The app's own origin so links open the running instance — `localhost:5173` in
 *  dev, the production domain once deployed. Falls back to production off-browser. */
const FALLBACK_ORIGIN = "https://queerpulse.com";
const appOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : FALLBACK_ORIGIN;
/** Origin without its scheme, for the human-readable URL field (e.g. `localhost:5173`). */
const appHost = () => appOrigin().replace(/^https?:\/\//, "");

/** Bare domain of the running app — `queerpulse.com` in prod, `localhost:5173` in dev. */
export const INVITE_DOMAIN = appHost();
/** Short, human-readable link for a code, shown in the URL field and preview card. */
export const inviteUrlFor = (code: string) => `${appHost()}/invite/${code}`;
/** The actual link copied / shared for a code — points at the running origin. */
export const inviteFullUrlFor = (code: string) =>
  `${appOrigin()}/invite/${code}`;
/** Preview link shown before the invite is persisted (uses the sample code). */
export const INVITE_URL = inviteUrlFor(INVITE_CODE);
export const INVITE_FULL_URL = inviteFullUrlFor(INVITE_CODE);

/** Description shown in the preview card when the member hasn't written a note.
 *  Chrome — authored by the platform, not the member — so it routes through `t()`. */
export function defaultVouch(t: TFunction): string {
  return t("auth:invite.link.defaultVouch");
}

/** Composed when sharing so the message always carries the link. */
export function buildShareMessage(
  t: TFunction,
  senderFirst: string,
  fullUrl: string,
): string {
  return t("auth:invite.link.shareMessage", { senderFirst, url: fullUrl });
}

export interface ShareTarget {
  key: string;
  label: string;
  Icon: IconType;
  /** Builds the share-intent URL from an already-composed message. */
  build: (message: string) => string;
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    Icon: FaWhatsapp,
    build: (message) => `https://wa.me/?text=${encodeURIComponent(message)}`,
  },
  {
    key: "x",
    label: "X",
    Icon: FaXTwitter,
    build: (message) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(message)}`,
  },
  {
    key: "messages",
    label: "Messages",
    Icon: FiMessageSquare,
    build: (message) => `sms:&body=${encodeURIComponent(message)}`,
  },
];
