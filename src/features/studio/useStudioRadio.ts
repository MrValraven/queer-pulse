import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioRadioFilter } from "./api/studio.types";
import { getStudioRadio } from "./api/studioDiscovery.api";
import { readStudio } from "./api/studioQueryKeys";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioPlayer } from "./player/studioPlayerContext";
import {
  queueItemFromRadioItem,
  radioFilterLabelKey,
  shuffledQueue,
} from "./player/studioQueue";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "./studioErrors.data";

export const radioFilterKey = (filter: StudioRadioFilter) =>
  `${filter.kind}:${filter.value}`;

export interface StudioRadioStarter {
  startRadio: (filter: StudioRadioFilter) => Promise<void>;
  /** The filter whose radio is starting, so its button shows busy. */
  startingFilterKey: string | null;
  errorKey: string | null;
}

/**
 * Starts a genre or mood radio. The list is read once and kept out of the
 * query cache (the server answers no-store), shuffled here, and handed to
 * the player with its filter; the player refills from the same list. The
 * filter is the only thing sent, and nothing about the queue goes back.
 * The member's "Hide explicit" setting (Studio settings) holds here too, as
 * it does on the album page's Play.
 */
export function useStudioRadio(): StudioRadioStarter {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const player = useStudioPlayer();
  const shouldHideExplicit = useStudioHideExplicit();
  const isStartingRef = useRef(false);
  const [startingFilterKey, setStartingFilterKey] = useState<string | null>(
    null,
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function startRadio(filter: StudioRadioFilter): Promise<void> {
    // A second press while the list loads waits for the first.
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setStartingFilterKey(radioFilterKey(filter));
    setErrorKey(null);
    try {
      const dto = await readStudio(queryClient, async () =>
        demoMode
          ? (await import("./api/studioDemoDiscovery")).demoStudioRadio(filter)
          : getStudioRadio(filter),
      );
      const pool = dto.items
        .filter((item) => !(shouldHideExplicit && item.isExplicit))
        .map(queueItemFromRadioItem);
      if (pool.length === 0) {
        setErrorKey("studio:radio.empty");
        return;
      }
      // A "radio" source with its filter: the reducer refills from the
      // same list, and the bar names the radio from the filter.
      await player.playTracks(shuffledQueue(pool), undefined, {
        kind: "radio",
        label: t(radioFilterLabelKey(filter)),
        href: null,
        radioFilter: filter,
      });
    } catch (error) {
      const key = studioErrorMessageKeyOf(error);
      setErrorKey(
        key === studioErrorMessageKey(null) ? "studio:radio.error" : key,
      );
    } finally {
      isStartingRef.current = false;
      setStartingFilterKey(null);
    }
  }

  return { startRadio, startingFilterKey, errorKey };
}
