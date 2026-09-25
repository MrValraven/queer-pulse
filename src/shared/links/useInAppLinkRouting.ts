// src/shared/links/useInAppLinkRouting.ts
import {
  useCallback,
  useContext,
  type ContextType,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";
import { inAppPathForHref, isPlainLeftClick } from "./inAppLinks";

type RouterNavigator = ContextType<
  typeof UNSAFE_NavigationContext
>["navigator"];

/** The fields both a native and a React mouse event carry that routing a
 *  click needs. */
type RoutableClickEvent = Pick<
  MouseEvent,
  | "button"
  | "metaKey"
  | "ctrlKey"
  | "shiftKey"
  | "altKey"
  | "defaultPrevented"
  | "target"
  | "preventDefault"
>;

/** Routes a plain click on a link back into QueerPulse through the SPA.
 *  Returns true when it took over the click (default prevented, route
 *  pushed); every other click falls through to the browser's native anchor
 *  handling untouched. */
function routeInAppClick(
  event: RoutableClickEvent,
  containerElement: Element,
  routerNavigator: RouterNavigator | undefined,
): boolean {
  if (event.defaultPrevented || !isPlainLeftClick(event)) return false;
  if (!routerNavigator) return false;
  if (!(event.target instanceof Element)) return false;
  const anchorElement = event.target.closest("a[href]");
  if (!anchorElement || !containerElement.contains(anchorElement)) {
    return false;
  }
  // `href` on an HTML anchor is the resolved absolute URL; an SVG `<a>`
  // exposes an animated string there, so it keeps its native behaviour.
  if (!(anchorElement instanceof HTMLAnchorElement)) return false;
  const inAppPath = inAppPathForHref(anchorElement.href);
  if (inAppPath === null) return false;
  event.preventDefault();
  routerNavigator.push(inAppPath);
  return true;
}

/** The router navigator from context. The context default is null outside a
 *  router, so a link rendered bare (tests, isolated previews) keeps working
 *  as an ordinary anchor; `useNavigate()` throws there. */
function useOptionalRouterNavigator(): RouterNavigator | undefined {
  return useContext(UNSAFE_NavigationContext)?.navigator;
}

/**
 * A click handler for React-rendered anchors: use it as an anchor's
 * `onClick`, or call it from one, and a plain click on a link into
 * QueerPulse opens in-app instead of following `target="_blank"` (which an
 * installed PWA hands to the system browser). `currentTarget` is the
 * container searched for the clicked anchor. Returns whether it routed.
 */
export function useInAppAnchorClick(): (
  event: ReactMouseEvent<HTMLElement>,
) => boolean {
  const routerNavigator = useOptionalRouterNavigator();
  return useCallback(
    (event: ReactMouseEvent<HTMLElement>) =>
      routeInAppClick(event, event.currentTarget, routerNavigator),
    [routerNavigator],
  );
}

/**
 * A callback ref for a container whose links come from
 * `dangerouslySetInnerHTML`: it attaches a native click listener, so no
 * `onClick` lands on a static element, and routes a plain click on any link
 * into QueerPulse through the SPA. The returned cleanup (React 19 ref
 * cleanup) removes the listener.
 */
export function useInAppLinkRegion<T extends HTMLElement>(): (
  element: T | null,
) => (() => void) | undefined {
  const routerNavigator = useOptionalRouterNavigator();
  return useCallback(
    (element: T | null) => {
      if (!element) return undefined;
      const containerElement = element;
      function handleClick(event: MouseEvent) {
        routeInAppClick(event, containerElement, routerNavigator);
      }
      containerElement.addEventListener("click", handleClick);
      return () => containerElement.removeEventListener("click", handleClick);
    },
    [routerNavigator],
  );
}
