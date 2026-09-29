import { initialsFromName } from "../../shared/lib/initials";
import { foldForSearch } from "../connect/connectionsFilter";
import type { AdminModeratorCandidateDTO } from "./api/adminCommunities.api";

/** Most candidates the add-moderator picker shows at once. Matches the
 *  backend's `MODERATOR_CANDIDATE_LIMIT`: a full answer means "search to
 *  narrow" (ENG-492). */
export const MODERATOR_CANDIDATE_LIMIT = 25;

/** Longest search the server accepts (`MODERATOR_CANDIDATE_SEARCH_MAX_LENGTH`
 *  on the backend query DTO); a longer one answers 400. */
export const MODERATOR_CANDIDATE_SEARCH_MAX_LENGTH = 100;

/** How long the picker waits after the last keystroke before searching. */
export const MODERATOR_CANDIDATE_SEARCH_DEBOUNCE_MS = 250;

const DEMO_FIRST_NAMES = [
  "Ana",
  "João",
  "Inês",
  "Beatriz",
  "Tomás",
  "Conceição",
  "Rafael",
  "Marta",
  "Luís",
  "Sofia",
];

const DEMO_LAST_NAMES = ["Almeida", "Gonçalves", "Simões", "Brandão"];

/** Folds a name into a handle: "João Simões" becomes "joao-simoes". */
function toDemoSlug(name: string): string {
  return foldForSearch(name).replace(/\s+/g, "-");
}

/**
 * Demo roster of promotable members, shared by every demo community. Forty
 * people, so the picker in demo shows the same "first 25, search to narrow"
 * state a large live community does, and accented names ("João", "Inês")
 * exercise the folded match.
 */
export const DEMO_MODERATOR_CANDIDATES: AdminModeratorCandidateDTO[] =
  DEMO_LAST_NAMES.flatMap((lastName) =>
    DEMO_FIRST_NAMES.map((firstName) => {
      const name = `${firstName} ${lastName}`;
      const slug = toDemoSlug(name);
      return {
        userId: `demo-candidate-${slug}`,
        slug,
        name,
        initials: initialsFromName(name),
      };
    }),
  ).sort((left, right) => left.name.localeCompare(right.name));

/**
 * The demo counterpart of `GET .../moderators/candidates?q=`: drops anyone
 * already moderating (by name, the only identity demo moderators carry),
 * matches the folded search against name and handle like the server does,
 * and caps the answer at `MODERATOR_CANDIDATE_LIMIT`.
 */
export function searchDemoModeratorCandidates(
  moderatorNames: readonly string[],
  searchTerm: string,
): AdminModeratorCandidateDTO[] {
  const foldedTerm = foldForSearch(searchTerm.trim());
  const moderatorNameSet = new Set(moderatorNames);
  return DEMO_MODERATOR_CANDIDATES.filter(
    (candidate) =>
      !moderatorNameSet.has(candidate.name) &&
      (!foldedTerm ||
        foldForSearch(`${candidate.name} ${candidate.slug}`).includes(
          foldedTerm,
        )),
  ).slice(0, MODERATOR_CANDIDATE_LIMIT);
}
