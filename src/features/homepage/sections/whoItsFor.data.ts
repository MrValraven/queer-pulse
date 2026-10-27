import { routes } from "../../../app/routeMap";

export interface WhoItsForTile {
  tileId: "businesses" | "communities" | "performers" | "practitioners";
  to: string;
  titleKey: string;
  bodyKey: string;
  linkKey: string;
}

/**
 * The four audience pages. Each tile's art is drawn in CSS from its
 * `tileId`, so the strip renders no product feature components and the
 * prerendered homepage chunk stays light.
 */
export const WHO_ITS_FOR_TILES: readonly WhoItsForTile[] = [
  {
    tileId: "businesses",
    to: routes.forBusinesses,
    titleKey: "homepage:whoItsFor.businesses.title",
    bodyKey: "homepage:whoItsFor.businesses.body",
    linkKey: "homepage:whoItsFor.businesses.link",
  },
  {
    tileId: "communities",
    to: routes.forCommunities,
    titleKey: "homepage:whoItsFor.communities.title",
    bodyKey: "homepage:whoItsFor.communities.body",
    linkKey: "homepage:whoItsFor.communities.link",
  },
  {
    tileId: "performers",
    to: routes.forPerformers,
    titleKey: "homepage:whoItsFor.performers.title",
    bodyKey: "homepage:whoItsFor.performers.body",
    linkKey: "homepage:whoItsFor.performers.link",
  },
  {
    tileId: "practitioners",
    to: routes.forPractitioners,
    titleKey: "homepage:whoItsFor.practitioners.title",
    bodyKey: "homepage:whoItsFor.practitioners.body",
    linkKey: "homepage:whoItsFor.practitioners.link",
  },
];
