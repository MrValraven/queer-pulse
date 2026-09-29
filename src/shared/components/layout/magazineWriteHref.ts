import { routes } from "../../../app/routeMap";

/**
 * Where the shell's "Write" (the rail button, the phone bar button and the
 * palette row) sends the editor. The desk reads `?write=new` and starts a
 * draft in the scope it is showing, so on the desk route the link keeps the
 * current search (`?issue=`, `?track=`, `?focus=` and the rest) and only adds
 * the flag: the draft files onto the issue on screen, and the desk comes back
 * with the same scope and chips. From any other magazine page there is no
 * desk scope to keep, so the desk opens on its default.
 */
export function magazineWriteHref(location: {
  pathname: string;
  search: string;
}): string {
  const isDeskRoute = location.pathname === routes.magazineEditor;
  const params = new URLSearchParams(isDeskRoute ? location.search : "");
  params.set("write", "new");
  return `${routes.magazineEditor}?${params.toString()}`;
}
