import {
  communityPath,
  businessPath,
  personaPath,
  routes,
  thread,
} from "../../../app/routeMap";
import { gatheringPath } from "../../gatherings/data";
import type { SearchItem } from "../search.data";
import type { SearchResultDTO, LiveResultType } from "./search.api";

const hrefFor = (result: SearchResultDTO): string => {
  switch (result.type) {
    case "member":
      return `/members/${result.slug}`;
    case "community":
      return communityPath(result.slug);
    case "event":
      return gatheringPath(result.slug);
    case "forum":
      return thread(result.slug);
    case "business":
      return businessPath(result.slug);
    case "magazine":
      // The article page reads its identifier from the `id` query param.
      return `${routes.article}?id=${result.slug}`;
    case "job":
      return `${routes.jobs}/${result.slug}`;
    case "housing":
      return `${routes.housing}/${result.slug}`;
    case "resource":
      return `${routes.resources}/${result.slug}`;
    case "workshop":
      return `${routes.skills}/${result.slug}`;
    case "subprofile":
      // A subprofile hit's slug IS its public handle (/p/:handle).
      return personaPath(result.slug);
  }
};

export function resultToSearchItem(result: SearchResultDTO): SearchItem {
  return {
    t: result.type,
    name: result.name,
    sub: result.sub,
    href: hrefFor(result),
    kw: `${result.name} ${result.sub} ${result.slug}`.toLowerCase(),
    slug: result.type === "member" ? result.slug : undefined,
    avatarUrl:
      result.type === "member" ? (result.avatarUrl ?? undefined) : undefined,
  };
}

export type { LiveResultType };
