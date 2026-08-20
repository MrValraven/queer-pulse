import { apiGet } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";

/** GET /me/calendar-feed-token — mints the caller's signed calendar-feed
 *  token (backend `CalendarFeedTokenService`). Goes through the normal
 *  versioned API client like any other authenticated call. */
const getCalendarFeedToken = () =>
  apiGet<{ token: string }>("/me/calendar-feed-token");

/**
 * The full, pasteable "Subscribe to your feed" URL: `GET
 * /calendar/feed/:token`, unauthenticated and version-neutral (see
 * `CalendarFeedController`) — deliberately NOT built through `apiGet`/the
 * versioned client, since a calendar app fetches this URL directly, not via
 * this app's fetch wrapper (no cookies, no CSRF token, no `/v1` prefix).
 */
export async function getCalendarFeedUrl(): Promise<string> {
  const { token } = await getCalendarFeedToken();
  return `${API_BASE_URL}/calendar/feed/${token}`;
}
