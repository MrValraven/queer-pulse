import { routes } from "../../app/routeMap";
import type { VouchGraphUrlView } from "./vouchGraph.types";
import { writeVouchGraphUrlView } from "./vouchGraphUrlState";

/**
 * The shareable link for a trust network view: the Members page with the
 * view's `tn*` params. Built from the view itself, so a copied or cited link
 * carries the view on screen at that moment, including a change the debounced
 * URL sync has yet to write. The Members page opens the network from these
 * params wherever the link is pasted.
 */
export function buildTrustNetworkViewUrl(view: VouchGraphUrlView): string {
  const params = writeVouchGraphUrlView(new URLSearchParams(), view);
  return `${window.location.origin}${routes.adminMembers}?${params.toString()}`;
}
