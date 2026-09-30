import { apiGet } from "../../../shared/api/client";

/**
 * What erasing this account would strand, straight from the account module:
 * the communities the caller owns and their own live listings. Matches the
 * backend's `AccountDependenciesResponse` (`account-dependencies.response.ts`).
 *
 * Served under `/account` on purpose: that controller carries no active-member
 * guard, so a banned or suspended member on the delete-account page gets a real
 * answer where `GET /me/communities` and `GET /listings/mine` answer 403.
 */
export interface AccountDependenciesDTO {
  communities: { slug: string; name: string }[];
  listings: { ref: string; name: string }[];
}

export const getAccountDependencies = () =>
  apiGet<AccountDependenciesDTO>("/account/dependencies");
