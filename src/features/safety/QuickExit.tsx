import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  clearStudioEpisodeMemory,
  endStudioEpisodeSaving,
} from "../studio/player/studioEpisodeMemory";
import { endStudioQueueSaving } from "../studio/player/studioQueueStorage";
import { clearStudioWarningConsent } from "../studio/player/studioWarningGate";
import { clearStudioTrackReveals } from "../forum/forumWarnings.helpers";
import styles from "./QuickExit.module.css";

const SAFE_DESTINATION = "https://www.google.com";

/**
 * How many inert sentinel history entries to stack before the hard redirect.
 * location.replace only overwrites the *current* entry, so earlier QueerPulse
 * pages would still sit one Back press away; burying them under sentinels means
 * Back from the neutral site lands on inert entries instead of stepping back
 * into the app.
 */
const HISTORY_BURY_DEPTH = 30;

/**
 * Fixed, thumb-zone "quick exit" for at-risk visitors on high-stakes safety
 * pages. Navigates away immediately with location.replace to a neutral site.
 * Also triggered by the Escape key — a well-known safety pattern. Every route
 * is reachable by a visible control, so this is an addition, never the only way
 * out.
 */
function leaveNow() {
  // Forget the Studio player's queue saved in this tab first, and stop it
  // being saved again by the pagehide the leave itself fires (it never
  // throws), so nothing about the visit stays behind in session storage.
  endStudioQueueSaving();
  // The same for Studio's episode memory (played marks, saved places and
  // speed, for every member on this device): remove it, then stop the
  // tracker's pagehide save from writing it back as the page goes.
  clearStudioEpisodeMemory();
  endStudioEpisodeSaving();
  // Studio safety: and the warned tracks this tab agreed to hear, with the
  // lyrics and show notes it uncovered.
  clearStudioWarningConsent();
  clearStudioTrackReveals();
  // History scrub: replace() alone only neutralises the current page, leaving
  // earlier QueerPulse pages reachable with Back. Stack sentinel entries first
  // to bury that trail, then replace the top of the stack with the external
  // neutral site. pushState here is same-document (hash only) so it adds no
  // page loads and stays instant; it fires no popstate/hashchange, so the
  // router never reacts before we leave. Wrapped in try/catch so a throttled or
  // unavailable History API can never delay the exit itself.
  try {
    for (let index = 0; index < HISTORY_BURY_DEPTH; index += 1) {
      window.history.pushState(null, "", "#");
    }
  } catch {
    // History API unavailable — fall through to the hard redirect below.
  }
  window.location.replace(SAFE_DESTINATION);
}

export function QuickExit() {
  const { t } = useTranslation();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Don't bail on an accidental Escape while the user is typing (e.g.
      // drafting a report) — that would discard their input. The visible button
      // stays the always-instant exit.
      const active = document.activeElement;
      const isTextEntry =
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable);
      if (isTextEntry) return;
      leaveNow();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <button
      type="button"
      className={styles.quickExit}
      onClick={leaveNow}
      aria-label={t("safety:quickExit.aria")}
    >
      <FiX aria-hidden />
      <span>{t("safety:quickExit.label")}</span>
    </button>
  );
}
