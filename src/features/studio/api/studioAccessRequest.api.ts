import { apiDelete, apiPost } from "../../../shared/api/client";
import type {
  CreateStudioAccessRequestBody,
  StudioAccessRequestStateDTO,
} from "./studioLanding.types";

// The member's own place on the "waiting for Studio" list. A member without a
// grant asks once; asking again answers 409 `studio_access_request_exists`,
// and a member who already holds a grant gets 409
// `studio_access_already_granted`.

export const createStudioAccessRequest = (
  body: CreateStudioAccessRequestBody,
) => apiPost<StudioAccessRequestStateDTO>("/studio/access-requests", body);

export const cancelStudioAccessRequest = () =>
  apiDelete<void>("/studio/access-requests/me");
