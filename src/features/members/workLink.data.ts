import { routes } from "../../app/routeMap";

/**
 * Entities a work item can point at. Deliberately short: only these have
 * parameterized detail routes. `article` and `film` are excluded — `routes.article`
 * and `routes.film` are singleton pages with no `:slug` (a legacy of the
 * one-HTML-page-per-design origin), so a ref would send every film to the same
 * page. Off-platform work and anything article/film-shaped uses `external`.
 */
export type WorkRefEntity =
  "collection" | "filmmaker" | "curator" | "gathering" | "place";

export type WorkLink =
  | { kind: "ref"; entity: WorkRefEntity; slug: string }
  | { kind: "external"; href: string };

export type WorkLinkTarget =
  { kind: "internal"; to: string } | { kind: "external"; href: string };

const BASE_BY_ENTITY: Record<WorkRefEntity, string> = {
  collection: routes.cinemaCollections,
  filmmaker: routes.cinemaFilmmaker,
  curator: routes.cinemaCurator,
  gathering: routes.gatherings,
  place: routes.directory,
};

/** Resolve a link to something renderable, or null when it can't be trusted —
 *  an empty slug, or a scheme that isn't http(s). Never render a null target. */
export function workLinkTarget(link: WorkLink): WorkLinkTarget | null {
  if (link.kind === "external") {
    const href = link.href.trim();
    if (!/^https?:\/\//i.test(href)) return null;
    return { kind: "external", href };
  }
  const slug = link.slug.trim();
  if (!slug) return null;
  return { kind: "internal", to: `${BASE_BY_ENTITY[link.entity]}/${slug}` };
}
