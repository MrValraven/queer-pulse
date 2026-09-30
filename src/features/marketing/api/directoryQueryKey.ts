/**
 * Root react-query key for every directory query. Its own module so a caller
 * that only invalidates the directory (listing mutations under the always-mounted
 * DirectoryListingsProvider) can import it without `useDirectory.ts`, whose
 * demo branch pulls the `DIRECTORY_PLACES` fixture and the member registry into
 * first paint. `useDirectory.ts` re-exports it for existing importers.
 */
export const DIRECTORY_KEY = "directory";
