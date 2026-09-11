/**
 * Static values for the share kit on the published-gathering screen.
 */

/** The neighbourhood value the wizard stores for an online gathering. The
 *  payload builder (`formToCreateEventDto`) reads the same literal. */
export const ONLINE_HOOD_VALUE = "Online";

/** The "Other in Lisbon" neighbourhood. It names no place of its own, so the
 *  share text leaves it out and the story image falls back to the city. */
export const GENERIC_HOOD_LABEL_KEY = "gatherings:create.hood.otherInLisbon";

/** WhatsApp's universal share link; the message follows, URL-encoded. */
export const WHATSAPP_SHARE_BASE_URL = "https://wa.me/?text=";

/** How long the "copy this link yourself" toast stays up when the clipboard
 *  refuses, long enough to select the URL inside it. */
export const COPY_FALLBACK_TOAST_MS = 12000;

export const CALENDAR_MIME_TYPE = "text/calendar;charset=utf-8";
export const STORY_IMAGE_MIME_TYPE = "image/png";

/** Identifies the generator in the .ics file. */
export const CALENDAR_PRODUCT_ID = "-//QueerPulse//Gatherings//EN";
export const CALENDAR_UID_DOMAIN = "queerpulse.app";
