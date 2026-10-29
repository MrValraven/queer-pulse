import { useCallback, useEffect, useState } from "react";
import { safeStorage } from "../../../shared/storage/safeStorage";
import {
  STUDIO_LANDING_ARTISTS_ID,
  STUDIO_LANDING_AUDIENCE_STORAGE_KEY,
  type StudioLandingAudience,
} from "./studioLanding.data";

const ARTISTS_HASH = `#${STUDIO_LANDING_ARTISTS_ID}`;

function isArtistsHash(): boolean {
  return window.location.hash === ARTISTS_HASH;
}

function readInitialAudience(): StudioLandingAudience {
  if (isArtistsHash()) return "artist";
  return safeStorage.get(STUDIO_LANDING_AUDIENCE_STORAGE_KEY) === "artist"
    ? "artist"
    : "listener";
}

/**
 * The hero's "I listen / I make music" switch. A link to `#artists` opens the
 * page on "I make music" (and wins over a stored choice); otherwise the
 * viewer's last choice comes back from localStorage, and the default is
 * "I listen". The choice stays in this browser: nothing reaches the server.
 *
 * Switching rewrites the hash with `history.replaceState` (outside the
 * router), so the address can be shared and nothing scrolls. A `hashchange`
 * to `#artists`, such as a link on the page, flips the audience too.
 * `isOpenedOnArtists` holds whether the page loaded on `#artists`, so the
 * page can scroll that section into view once.
 */
export function useStudioLandingAudience(): {
  audience: StudioLandingAudience;
  setAudience: (next: StudioLandingAudience) => void;
  isOpenedOnArtists: boolean;
} {
  const [isOpenedOnArtists] = useState(isArtistsHash);
  const [audience, setAudienceState] =
    useState<StudioLandingAudience>(readInitialAudience);

  useEffect(() => {
    function handleHashChange() {
      if (isArtistsHash()) setAudienceState("artist");
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const setAudience = useCallback((next: StudioLandingAudience) => {
    setAudienceState(next);
    safeStorage.set(STUDIO_LANDING_AUDIENCE_STORAGE_KEY, next);
    const { pathname, search } = window.location;
    const hash = next === "artist" ? ARTISTS_HASH : "";
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${search}${hash}`,
    );
  }, []);

  return { audience, setAudience, isOpenedOnArtists };
}
