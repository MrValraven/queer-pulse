import { routes } from "../../../app/routeMap";

/** The admin manage page of one house music event. */
export function musicEventManagePath(slug: string): string {
  return routes.adminMusicEvent.replace(":slug", encodeURIComponent(slug));
}
