import type { IconType } from "react-icons";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FiMessageSquare } from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import {
  appHost,
  inviteFullUrlFor,
  inviteUrlFor,
} from "../../shared/lib/inviteUrl";

export const INVITE_CODE = "QP-7F3K-2026";

/** Bare domain of the running app — `queerpulse.com` in prod, `localhost:5173` in dev. */
export const INVITE_DOMAIN = appHost();
// Link construction lives in shared/lib/inviteUrl so there is exactly one place
// that knows the invite path, and it reads it from the route map. Re-exported
// here because this module is the invite feature's established entry point.
export { inviteUrlFor, inviteFullUrlFor };

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
