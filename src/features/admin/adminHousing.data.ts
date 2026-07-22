import type { AdminJoinRequestDTO } from "./api/adminHousing.api";
import type { HousingCoopDTO } from "../economy/api/housingCoop.api";

/**
 * Admin housing demo fixtures. Deliberately empty: unlike public-facing demo
 * data (which populates a believable platform for a visitor to explore), the
 * admin panel's demo mode shows the honest "nothing to manage yet" empty
 * state rather than fabricating coops/join-requests as platform truth.
 */
export const ADMIN_COOPS_DEMO: HousingCoopDTO[] = [];

export const ADMIN_JOIN_REQUESTS_DEMO: AdminJoinRequestDTO[] = [];
