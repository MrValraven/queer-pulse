import { routes } from "../../../app/routeMap";

/** True for the projector page, with or without a trailing slash. */
export function isVjScreenPath(pathname: string): boolean {
  const trimmedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return trimmedPathname === routes.adminVjScreen;
}
