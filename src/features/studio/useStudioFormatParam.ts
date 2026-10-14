import { useSearchParams } from "react-router-dom";
import { isStudioFormat } from "./api/studio.adapters";
import type { StudioFormat } from "./api/studio.types";
import { useStudioFormats } from "./api/useStudioFormats";

/** The format chosen in `?format=`; anything else reads as All (null). */
export function useStudioFormatParam(): StudioFormat | null {
  const [searchParams] = useSearchParams();
  const value = searchParams.get("format");
  return isStudioFormat(value) ? value : null;
}

/** The format a page filters by: the `?format=` choice, read as All once
 *  the format list has loaded without it (an old link to a format with
 *  nothing published), so a page is never left narrowed to nothing. While
 *  the list loads or after a failure the choice stands, and the chip row
 *  stays open to offer All. */
export function useStudioActiveFormat(): StudioFormat | null {
  const format = useStudioFormatParam();
  const { formats, loadState } = useStudioFormats();
  const hasLoaded = !loadState.isLoading && !loadState.isError;
  const isMissing = format !== null && hasLoaded && !formats.includes(format);
  return isMissing ? null : format;
}
