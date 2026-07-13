import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Node request-interception server for LIVE-mode suites. Kept out of the global
 * setup file so demo-mode suites (the vast majority) never touch MSW: a suite
 * that wants it calls `server.listen()` / `resetHandlers()` / `close()` itself.
 */
export const server = setupServer(...handlers);
