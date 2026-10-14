import { ApiError } from "../../shared/api/client";
import type { StudioErrorCode } from "../studio/api/studio.types";

// Shared by the Studio discovery console's hooks. No demo data lives here,
// so importing it statically keeps the console's chunk free of demo seeds.

/** Every console mutation and search: the console shows its own toast. */
export const STUDIO_ADMIN_SILENT_META = { silentError: true } as const;

const STATUS_MESSAGE: Record<409 | 422, string> = {
  409: "Conflict",
  422: "Unprocessable Entity",
};

/** The refusal the server sends for a Studio code, so a demo write shows the
 *  same message the live console would. */
export function studioAdminDemoRefusal(
  code: StudioErrorCode,
  status: 409 | 422 = 409,
): ApiError {
  const message = STATUS_MESSAGE[status];
  return new ApiError(status, message, { statusCode: status, code, message });
}
