import type {
  AdminGlossaryTermDTO,
  AdminResourceGuideDTO,
} from "./api/adminResourceGuides.api";

/**
 * Admin guide-editor demo fixtures.
 *
 * Deliberately empty, for the same reason `adminResourceListings.data.ts` is:
 * these are the highest-stakes pages on the platform, and a demo editor
 * showing invented health guidance with invented review dates would teach a
 * reviewer exactly the wrong thing about what the panel contains. The honest
 * "nothing to manage yet" empty state is what demo mode shows; live mode
 * reads the real, backfilled rows.
 */
export const ADMIN_RESOURCE_GUIDES_DEMO: AdminResourceGuideDTO[] = [];

export const ADMIN_GLOSSARY_TERMS_DEMO: AdminGlossaryTermDTO[] = [];
