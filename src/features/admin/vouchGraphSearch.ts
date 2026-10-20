import { foldForSearch } from "../../shared/lib/foldForSearch";
import type { TrustGraph, VouchPerson } from "./trustGraph/trustGraphModel";

/** Accent-folded lowercase form for matching: "João" becomes "joao". */
export { foldForSearch };

const WORD_SEPARATORS = /[\s\-_.]+/;

type MatchStrength = "prefix" | "contains" | "none";

/** Prefix: the name, any word of it, the initials or the slug starts with
 *  the term. Contains: the name or the slug holds the term elsewhere. */
function matchStrength(person: VouchPerson, foldedTerm: string): MatchStrength {
  const foldedName = foldForSearch(person.name);
  const foldedId = foldForSearch(person.id);
  const isPrefix =
    foldedName.startsWith(foldedTerm) ||
    foldedName
      .split(WORD_SEPARATORS)
      .some((word) => word.startsWith(foldedTerm)) ||
    foldForSearch(person.initials).startsWith(foldedTerm) ||
    foldedId.startsWith(foldedTerm);
  if (isPrefix) return "prefix";
  if (foldedName.includes(foldedTerm) || foldedId.includes(foldedTerm)) {
    return "contains";
  }
  return "none";
}

function normalizeTerm(term: string): string {
  return foldForSearch(term.trim());
}

function compareNames(first: VouchPerson, second: VouchPerson): number {
  return first.name.localeCompare(second.name, undefined, {
    sensitivity: "base",
  });
}

/** Local matches over every loaded member (A4 "In this graph"), by name,
 *  initials or slug. Prefix matches come first, then the rest, each group
 *  sorted by name. An empty term matches no one. */
export function matchMembersInGraph(
  graph: TrustGraph,
  term: string,
  limit: number,
): VouchPerson[] {
  const foldedTerm = normalizeTerm(term);
  if (!foldedTerm || limit <= 0) return [];
  const prefixMatches: VouchPerson[] = [];
  const containsMatches: VouchPerson[] = [];
  for (const person of graph.people) {
    const strength = matchStrength(person, foldedTerm);
    if (strength === "prefix") prefixMatches.push(person);
    else if (strength === "contains") containsMatches.push(person);
  }
  prefixMatches.sort(compareNames);
  containsMatches.sort(compareNames);
  return [...prefixMatches, ...containsMatches].slice(0, limit);
}

/** Ids among the visible members that match the term, for on-canvas
 *  highlighting. An empty term gives an empty set. */
export function matchIdsInView(
  graph: TrustGraph,
  visIds: string[],
  term: string,
): Set<string> {
  const matchedIds = new Set<string>();
  const foldedTerm = normalizeTerm(term);
  if (!foldedTerm) return matchedIds;
  for (const personId of visIds) {
    const person = graph.peopleById[personId];
    if (person && matchStrength(person, foldedTerm) !== "none") {
      matchedIds.add(personId);
    }
  }
  return matchedIds;
}
