import { currentUser } from "../../members/data/demoCurrentUser";

// Kept apart from the demo seed so `useCulturalViewerId` reads the demo
// viewer's id without loading the ideas, tasks and guides.

/** The demo viewer as a staff member: the id every demo write is by. */
export const DEMO_CULTURAL_VIEWER_ID = String(currentUser.id);
