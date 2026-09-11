import { WHATSAPP_SHARE_BASE_URL } from "./shareKit.data";

/**
 * The WhatsApp share link for a gathering: the title on the first line and
 * the link on the second, so the chat preview picks the URL up on its own.
 */
export function whatsAppShareUrl(title: string, url: string): string {
  const message = [title.trim(), url].filter(Boolean).join("\n");
  return `${WHATSAPP_SHARE_BASE_URL}${encodeURIComponent(message)}`;
}

/** File name for the downloaded story image. */
export function storyImageFileName(slug: string): string {
  return `${slug}-story.png`;
}

/** File name for the downloaded calendar file. */
export function calendarFileName(slug: string): string {
  return `${slug}.ics`;
}
