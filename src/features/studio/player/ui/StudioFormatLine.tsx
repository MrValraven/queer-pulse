import { useState } from "react";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { Collapse } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import { DEMO_STREAM_FORMATS } from "./StudioFormatLine.data";
import {
  usePlayingStreamUrl,
  useStudioStreamFormat,
} from "./StudioFormatLine.hooks";
import type { StudioStreamFormat } from "./StudioFormatLine.probe";
import styles from "./StudioFormatLine.module.css";

const HERTZ_PER_KILOHERTZ = 1000;

/** Demo plays no files: a stable pick per track from the demo formats. */
function demoFormatOf(trackId: string | null): StudioStreamFormat | null {
  if (!trackId) return null;
  let hash = 0;
  for (const character of trackId)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return DEMO_STREAM_FORMATS[hash % DEMO_STREAM_FORMATS.length] ?? null;
}

function FormatText({
  format,
  isFaded,
}: {
  format: StudioStreamFormat;
  isFaded: boolean;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const parts = [format.codec];
  if (format.sampleRateHz)
    parts.push(
      t("studio:player.format.sampleRate", {
        rate: formatters.number(format.sampleRateHz / HERTZ_PER_KILOHERTZ, {
          maximumFractionDigits: 2,
        }),
      }),
    );
  if (format.channelCount === 1) parts.push(t("studio:player.format.mono"));
  else if (format.channelCount === 2)
    parts.push(t("studio:player.format.stereo"));
  else if (format.channelCount)
    parts.push(
      t("studio:player.format.channels", { count: format.channelCount }),
    );
  return (
    <p
      className={styles.line}
      data-faded={isFaded || undefined}
      aria-hidden={isFaded || undefined}
    >
      <span aria-hidden="true">{parts.join(" · ")}</span>
      <span className="visuallyHidden">
        {t("studio:player.format.label", { line: parts.join(", ") })}
      </span>
    </p>
  );
}

/**
 * Now playing's read-only format line (PRD-14): codec, sample rate and
 * channels, read from the header of the stream that plays. Studio stores
 * audio as uploaded, so this is what the listener hears. Unknown (plain
 * mode, a refused read, nothing playing yet) hides it. Between tracks the
 * last line rests faded until the next header is read, so the stage keeps
 * still.
 */
export function StudioFormatLine() {
  const { demoMode } = useDemoMode();
  const { currentItem, status } = useStudioPlayer();
  const trackId = currentItem?.trackId ?? null;
  const streamUrl = usePlayingStreamUrl();
  // A stream URL belongs to the track that was current when it started to
  // play; a track cued since, and not heard yet, has no line.
  const [binding, setBinding] = useState({ url: streamUrl, trackId });
  if (binding.url !== streamUrl) setBinding({ url: streamUrl, trackId });
  const live = useStudioStreamFormat(demoMode ? null : streamUrl);
  const isUrlCurrent = binding.trackId === trackId;
  const format = demoMode
    ? demoFormatOf(trackId)
    : isUrlCurrent
      ? live.format
      : null;
  const isPending =
    format === null &&
    (status === "loading" || (!demoMode && isUrlCurrent && live.isPending));
  const [lastFormat, setLastFormat] = useState<StudioStreamFormat | null>(null);
  if (format && format !== lastFormat) setLastFormat(format);
  const shownFormat = format ?? (isPending ? lastFormat : null);
  const isVisible =
    shownFormat !== null && status !== "idle" && status !== "error";
  return (
    <Collapse isOpen={isVisible} className={styles.collapse}>
      {shownFormat && (
        <FormatText format={shownFormat} isFaded={format === null} />
      )}
    </Collapse>
  );
}
