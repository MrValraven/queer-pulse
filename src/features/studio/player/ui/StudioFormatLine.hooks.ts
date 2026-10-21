import { useEffect, useState, useSyncExternalStore } from "react";
import {
  readPlayingStreamUrl,
  subscribePlayingStreamUrl,
} from "../studioAudioGraph";
import {
  probeStreamFormat,
  type StudioStreamFormat,
} from "./StudioFormatLine.probe";

/** Formats already read, by stream URL, so reopening Now playing reads no
 *  bytes again. Memory only, and small: a signed URL lasts one track. */
const formatCache = new Map<string, StudioStreamFormat | null>();
const FORMAT_CACHE_LIMIT = 12;

function rememberFormat(url: string, format: StudioStreamFormat | null) {
  formatCache.set(url, format);
  if (formatCache.size <= FORMAT_CACHE_LIMIT) return;
  const oldest = formatCache.keys().next();
  if (!oldest.done) formatCache.delete(oldest.value);
}

/** The URL of the stream playing through the audio graph, or null. */
export function usePlayingStreamUrl(): string | null {
  return useSyncExternalStore(
    subscribePlayingStreamUrl,
    readPlayingStreamUrl,
    () => null,
  );
}

export interface StudioStreamFormatRead {
  format: StudioStreamFormat | null;
  /** The header of `url` is being read. */
  isPending: boolean;
}

/** The format of the stream at `url`, read once from its header bytes. */
export function useStudioStreamFormat(
  url: string | null,
): StudioStreamFormatRead {
  const [probed, setProbed] = useState<{
    url: string;
    format: StudioStreamFormat | null;
  } | null>(null);
  useEffect(() => {
    if (!url || formatCache.has(url)) return;
    const controller = new AbortController();
    void probeStreamFormat(url, controller.signal).then((format) => {
      if (controller.signal.aborted) return;
      rememberFormat(url, format);
      setProbed({ url, format });
    });
    return () => controller.abort();
  }, [url]);
  if (!url) return { format: null, isPending: false };
  if (probed?.url === url) return { format: probed.format, isPending: false };
  if (formatCache.has(url))
    return { format: formatCache.get(url) ?? null, isPending: false };
  return { format: null, isPending: true };
}
