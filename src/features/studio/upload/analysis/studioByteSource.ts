/** Random access to an audio file, local or remote. `end` is exclusive. */
export interface StudioByteSource {
  size: number;
  read: (start: number, end: number) => Promise<ArrayBuffer>;
}

/** The storage server answered a ranged GET with the whole file. */
export class StudioRangeUnsupportedError extends Error {
  constructor() {
    super("The audio server ignores byte ranges");
    this.name = "StudioRangeUnsupportedError";
  }
}

/** The storage server refused a ranged read (an expired URL, a missing file). */
export class StudioByteSourceHttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`The audio server answered ${status}`);
    this.name = "StudioByteSourceHttpError";
    this.status = status;
  }
}

export function fileByteSource(file: Blob): StudioByteSource {
  return {
    size: file.size,
    read: (start, end) => file.slice(start, end).arrayBuffer(),
  };
}

/** A signed stream URL read in byte ranges (needs the bucket CORS rule that
 *  allows and exposes Range, spec section 10). */
export async function rangeByteSource(
  url: string,
  options: { fetchImpl?: typeof fetch; signal?: AbortSignal } = {},
): Promise<StudioByteSource> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const requestRange = async (start: number, end: number) => {
    const response = await fetchImpl(url, {
      headers: { Range: `bytes=${start}-${end - 1}` },
      signal: options.signal,
    });
    if (response.status !== 206) {
      void response.body?.cancel();
      if (response.status === 200) throw new StudioRangeUnsupportedError();
      throw new StudioByteSourceHttpError(response.status);
    }
    return response;
  };
  const probe = await requestRange(0, 1);
  const total = Number(probe.headers.get("Content-Range")?.split("/")[1]);
  if (!Number.isFinite(total) || total <= 0)
    throw new StudioRangeUnsupportedError();
  return {
    size: total,
    read: async (start, end) => (await requestRange(start, end)).arrayBuffer(),
  };
}
