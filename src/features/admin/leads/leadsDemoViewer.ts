import { currentUser } from "../../members/data/demoCurrentUser";

// Kept apart from the 468-line seed so `useLeadViewerId` reads the demo
// viewer's id without loading the demo leads.

/** The demo viewer as a staff member: the same id `viewerAuthor` writes. */
export const DEMO_LEAD_VIEWER_ID = String(currentUser.id);
