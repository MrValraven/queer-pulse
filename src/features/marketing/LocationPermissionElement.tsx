import { useEffect, useRef } from "react";
import type { MyLocation } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./DirectoryPage.module.css";

/** Chrome's `<geolocation>` element. Not in lib.dom yet, so the two read-only
 *  results its `location` event carries are declared here. */
interface GeolocationElement extends HTMLElement {
  readonly position: GeolocationPosition | null;
  readonly error: GeolocationPositionError | null;
}

/**
 * The browser's own "use location" button, standing in for ours once the site
 * is blocked.
 *
 * A page cannot re-open a permission prompt the member has already answered:
 * `getCurrentPosition` just fails, instantly and silently. The `<geolocation>`
 * element can, because the browser draws it and so trusts that the press was
 * real, and on a blocked site it answers with a prompt to allow location again.
 * Only rendered where `hasInPageRecovery` says the browser has it.
 *
 * Created imperatively. React treats `<geolocation>` as an unknown tag, and the
 * element's text, icon and accessible name all come from the browser in the
 * `lang` it is given, so there are no children to render. The host span is
 * `display: contents`, which leaves the element itself as the grid or flex
 * item our own button would have been.
 *
 * Same contract as `useMyLocation`: one ask per press, so no `watch` and no
 * `autolocate`.
 */
export function LocationPermissionElement({
  location,
}: {
  location: MyLocation;
}) {
  const { language } = useTranslation();
  const hostRef = useRef<HTMLSpanElement>(null);
  const { receivePosition, receivePositionError } = location;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const element = document.createElement("geolocation") as GeolocationElement;
    element.className = s.nearMePermission ?? "";
    element.lang = language;
    element.setAttribute("accuracymode", "approximate");
    const handleLocation = () => {
      if (element.position) receivePosition(element.position);
      else if (element.error) receivePositionError(element.error);
    };
    element.addEventListener("location", handleLocation);
    host.append(element);
    return () => {
      element.removeEventListener("location", handleLocation);
      element.remove();
    };
  }, [language, receivePosition, receivePositionError]);

  return <span ref={hostRef} className={s.nearMePermissionHost} />;
}
