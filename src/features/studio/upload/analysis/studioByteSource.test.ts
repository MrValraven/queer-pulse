import { describe, expect, it, vi } from "vitest";
import {
  StudioByteSourceHttpError,
  StudioRangeUnsupportedError,
  fileByteSource,
  rangeByteSource,
} from "./studioByteSource";

function rangeResponse(
  status: number,
  body: Uint8Array,
  contentRange?: string,
) {
  return new Response(new Uint8Array(body), {
    status,
    headers: contentRange ? { "Content-Range": contentRange } : {},
  });
}

describe("fileByteSource", () => {
  it("reads the half-open range it is asked for", async () => {
    const source = fileByteSource(new Blob([Uint8Array.from([1, 2, 3, 4, 5])]));
    expect(source.size).toBe(5);
    expect(Array.from(new Uint8Array(await source.read(1, 4)))).toEqual([
      2, 3, 4,
    ]);
  });
});

describe("rangeByteSource", () => {
  it("learns the size from Content-Range and asks for inclusive byte ranges", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        rangeResponse(206, Uint8Array.from([9]), "bytes 0-0/1000"),
      )
      .mockResolvedValueOnce(
        rangeResponse(206, Uint8Array.from([7, 8]), "bytes 10-11/1000"),
      );
    const source = await rangeByteSource("https://bucket/track", { fetchImpl });
    expect(source.size).toBe(1000);
    await source.read(10, 12);
    const headers = fetchImpl.mock.calls[1]?.[1]?.headers as Record<
      string,
      string
    >;
    expect(headers.Range).toBe("bytes=10-11");
  });

  it("refuses a server that ignores ranges", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(rangeResponse(200, new Uint8Array(10)));
    await expect(
      rangeByteSource("https://bucket/track", { fetchImpl }),
    ).rejects.toBeInstanceOf(StudioRangeUnsupportedError);
  });

  it("reports an expired or refused URL with its status", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(rangeResponse(403, new Uint8Array(1)));
    const failure = await rangeByteSource("https://bucket/track", {
      fetchImpl,
    }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(StudioByteSourceHttpError);
    expect((failure as StudioByteSourceHttpError).status).toBe(403);
  });
});
