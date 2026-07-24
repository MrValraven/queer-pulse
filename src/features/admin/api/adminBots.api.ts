import { apiGet, apiPatch, apiPut } from "../../../shared/api/client";
import {
  getProfile,
  type ProfileDTO,
  type SocialLinkDTO,
  type UpdateProfileDTO,
} from "../../members/api/members.api";

/**
 * Admin surface for editing platform system ("bot") accounts (`/admin/bots`,
 * admin-only). Mirrors the backend's `AdminBotsController`. Every write targets
 * a `:userId` the backend asserts is `isSystem === true`, so these can never
 * reach a real member. The list summary carries only name + avatar, so the
 * editor reads full current values through the public profile endpoint.
 */

/** One system account, as returned by `GET /admin/bots` (mirrors `AdminBotSummary`). */
export interface AdminBotSummaryDTO {
  userId: string;
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export const getAdminBots = () => apiGet<AdminBotSummaryDTO[]>("/admin/bots");

/** Current values to pre-fill the editor. The house account is a real member
 *  account, so its full profile is the public one. */
export const getBotProfile = (slug: string): Promise<ProfileDTO> =>
  getProfile(slug);

/** PATCH the core identity fields. Returns the saved profile. */
export const updateBotProfile = (userId: string, dto: UpdateProfileDTO) =>
  apiPatch<ProfileDTO>(`/admin/bots/${userId}`, dto);

/** Change the account handle. 409 when the username is already taken. */
export const updateBotUsername = (userId: string, username: string) =>
  apiPut<ProfileDTO>(`/admin/bots/${userId}/username`, { username });

/** Full-replace the account's social links. */
export const replaceBotSocials = (userId: string, items: SocialLinkDTO[]) =>
  apiPut<ProfileDTO>(`/admin/bots/${userId}/socials`, { items });
