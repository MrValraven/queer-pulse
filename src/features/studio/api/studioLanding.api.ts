import { API_VERSION_PREFIX } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import type {
  StudioLandingDTO,
  StudioLandingPreviewStreamDTO,
} from "./studioLanding.types";

/** The one code the stream route answers for every unavailable preview. */
const PREVIEW_UNAVAILABLE_CODE = "studio_landing_preview_unavailable";

/** Why a public landing request failed, in the words the listen section
 *  names. "playback" is raised by the player when the audio element itself
 *  fails; no request produces it. */
export type StudioLandingListenReason =
  "unavailable" | "offline" | "rateLimited" | "server" | "playback";

export class StudioLandingRequestError extends Error {
  readonly reason: StudioLandingListenReason;
  readonly status: number | null;
  readonly code: string | null;

  constructor(
    reason: StudioLandingListenReason,
    status: number | null,
    code: string | null,
  ) {
    super(
      `Studio landing request failed with reason ${reason}` +
        (status === null ? " (no response)" : ` (HTTP ${status})`) +
        (code === null ? "" : ` and code ${code}`),
    );
    this.name = "StudioLandingRequestError";
    this.reason = reason;
    this.status = status;
    this.code = code;
  }
}

/** Maps an answer to its reason. A null status is a network failure: it reads
 *  "offline" while the browser reports no connection, "server" otherwise. */
export function landingRequestReasonOf(
  status: number | null,
  code: string | null,
  isOnline: boolean,
): StudioLandingListenReason {
  if (status === null) return isOnline ? "server" : "offline";
  if (status === 404 && code === PREVIEW_UNAVAILABLE_CODE) return "unavailable";
  if (status === 429) return "rateLimited";
  return "server";
}

function isBrowserOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

async function codeOf(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "code" in body) {
      const { code } = body;
      return typeof code === "string" ? code : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * A public read. It skips the shared api client on purpose: that client
 * attaches the CSRF header and the session cookies, and these routes take
 * neither (`credentials: "omit"`, no custom header, so no CORS preflight).
 */
async function requestPublic<Answer>(
  path: string,
  signal?: AbortSignal,
): Promise<Answer> {
  const url = `${API_BASE_URL}${API_VERSION_PREFIX}${path}`;
  let response: Response;
  try {
    response = await fetch(url, { credentials: "omit", signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new StudioLandingRequestError(
      landingRequestReasonOf(null, null, isBrowserOnline()),
      null,
      null,
    );
  }
  if (!response.ok) {
    const code = await codeOf(response);
    throw new StudioLandingRequestError(
      landingRequestReasonOf(response.status, code, isBrowserOnline()),
      response.status,
      code,
    );
  }
  try {
    return (await response.json()) as Answer;
  } catch {
    throw new StudioLandingRequestError("server", response.status, null);
  }
}

/** GET /v1/studio/landing, credentials omitted, no custom header. */
export function fetchStudioLanding(
  signal?: AbortSignal,
): Promise<StudioLandingDTO> {
  return requestPublic<StudioLandingDTO>("/studio/landing", signal);
}

/** GET /v1/studio/landing/previews/:id/stream, credentials omitted. */
export function fetchStudioLandingPreviewStream(
  previewId: string,
  signal?: AbortSignal,
): Promise<StudioLandingPreviewStreamDTO> {
  return requestPublic<StudioLandingPreviewStreamDTO>(
    `/studio/landing/previews/${encodeURIComponent(previewId)}/stream`,
    signal,
  );
}
