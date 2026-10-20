import { apiDelete, apiGet, apiPut } from "../../../shared/api/client";
import type {
  EarlyAccessFeaturesDTO,
  EarlyAccessGrantDTO,
  EarlyAccessRosterDTO,
  MemberEarlyAccessDTO,
} from "./adminEarlyAccess.types";

// Admin early access (Moderator + Admin on the server; only admins reach the
// member drawer that grants). `featureKey` stays a plain string on the wire:
// the server answers 404 "Early access feature not found." for a key it does
// not hold in early access.

const memberPath = (memberId: string) =>
  `/admin/members/${encodeURIComponent(memberId)}/early-access`;
const memberFeaturePath = (memberId: string, featureKey: string) =>
  `${memberPath(memberId)}/${encodeURIComponent(featureKey)}`;
const featurePath = (featureKey: string) =>
  `/admin/early-access/${encodeURIComponent(featureKey)}`;

/** One entry per feature in early access (registry order), each with the
 *  member's grant or null. */
export const getMemberEarlyAccess = (memberId: string) =>
  apiGet<MemberEarlyAccessDTO>(memberPath(memberId));
/** Idempotent: granting twice answers the existing grant. */
export const grantMemberEarlyAccess = (memberId: string, featureKey: string) =>
  apiPut<EarlyAccessGrantDTO>(memberFeaturePath(memberId, featureKey));
/** Idempotent: revoking someone without a grant is a 204 too. */
export const revokeMemberEarlyAccess = (memberId: string, featureKey: string) =>
  apiDelete<void>(memberFeaturePath(memberId, featureKey));
/** Every feature in early access with its grant count. */
export const getEarlyAccessFeatures = () =>
  apiGet<EarlyAccessFeaturesDTO>("/admin/early-access");
/** Who holds one feature, newest first, at most `limit` rows of `total`. */
export const getEarlyAccessRoster = (featureKey: string) =>
  apiGet<EarlyAccessRosterDTO>(featurePath(featureKey));
