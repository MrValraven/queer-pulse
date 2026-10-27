import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setDemoModeRuntime } from "../../../shared/api/demoModeRuntime";
import {
  findStudioLink,
  findStudioLinkAt,
  parseStudioLink,
  studioLinkPath,
  studioLinkUrl,
  studioMilestoneTarget,
  studioShareTargetKey,
  textWithoutStudioLink,
} from "./studioLinkTarget";

const TRACK_ID = "3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f";
const RELEASE_ID = "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d";
const PLAYLIST_ID = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";
const MILESTONE_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f";
const PERSONA_ID = "7e8f9a0b-1c2d-4e3f-9a4b-5c6d7e8f9a0b";
const TRACK_URL = `https://queerpulse.com/studio/track?id=${TRACK_ID}`;

beforeEach(() => setDemoModeRuntime(false));
afterEach(() => setDemoModeRuntime(false));

describe("parseStudioLink", () => {
  it("reads a track link on queerpulse.com", () => {
    expect(parseStudioLink(TRACK_URL)).toEqual({
      kind: "track",
      id: TRACK_ID,
      startAtSeconds: null,
    });
  });

  it("reads a release and a playlist link on the origin serving the app", () => {
    expect(
      parseStudioLink(
        `${window.location.origin}/studio/album?id=${RELEASE_ID}`,
      ),
    ).toEqual({ kind: "release", id: RELEASE_ID, startAtSeconds: null });
    expect(
      parseStudioLink(
        `${window.location.origin}/studio/collection?id=${PLAYLIST_ID}`,
      ),
    ).toEqual({ kind: "playlist", id: PLAYLIST_ID, startAtSeconds: null });
  });

  it("reads www.queerpulse.com and a root-relative link", () => {
    expect(
      parseStudioLink(`https://www.queerpulse.com/studio/track?id=${TRACK_ID}`)
        ?.kind,
    ).toBe("track");
    expect(parseStudioLink(`/studio/track?id=${TRACK_ID}`)?.kind).toBe("track");
  });

  it("lower-cases an upper-case id", () => {
    expect(
      parseStudioLink(
        `https://queerpulse.com/studio/track?id=${TRACK_ID.toUpperCase()}`,
      )?.id,
    ).toBe(TRACK_ID);
  });

  it("keeps whole seconds from 0 to one day on a track", () => {
    expect(parseStudioLink(`${TRACK_URL}&t=83`)?.startAtSeconds).toBe(83);
    expect(parseStudioLink(`${TRACK_URL}&t=0`)?.startAtSeconds).toBe(0);
    expect(parseStudioLink(`${TRACK_URL}&t=86400`)?.startAtSeconds).toBe(86400);
  });

  it("ignores a start time it cannot use and still parses the link", () => {
    for (const start of [
      "86401",
      "99999",
      "-5",
      "1.5",
      "abc",
      "",
      "1e3",
      "+5",
    ]) {
      const target = parseStudioLink(`${TRACK_URL}&t=${start}`);
      expect(target?.kind).toBe("track");
      expect(target?.startAtSeconds).toBeNull();
    }
  });

  it("ignores a start time on a release", () => {
    expect(
      parseStudioLink(
        `https://queerpulse.com/studio/album?id=${RELEASE_ID}&t=40`,
      )?.startAtSeconds,
    ).toBeNull();
  });

  it("ignores extra query parameters and the fragment", () => {
    expect(
      parseStudioLink(
        `https://queerpulse.com/studio/track?utm=feed&id=${TRACK_ID}&t=12#lyrics`,
      ),
    ).toEqual({ kind: "track", id: TRACK_ID, startAtSeconds: 12 });
  });

  it("refuses a lookalike host, credentials, another port and another scheme", () => {
    for (const url of [
      `https://queerpulse.com.evil.example/studio/track?id=${TRACK_ID}`,
      `https://queerpulse.com@evil.example/studio/track?id=${TRACK_ID}`,
      `https://someone@queerpulse.com/studio/track?id=${TRACK_ID}`,
      `https://member@queerpulse.com/studio/track?id=${TRACK_ID}`,
      `https://member:secret@queerpulse.com/studio/track?id=${TRACK_ID}`,
      `https://queerpulse.com:8443/studio/track?id=${TRACK_ID}`,
      `http://queerpulse.com/studio/track?id=${TRACK_ID}`,
      `ftp://queerpulse.com/studio/track?id=${TRACK_ID}`,
      `https://example.com/studio/track?id=${TRACK_ID}`,
    ]) {
      expect(parseStudioLink(url)).toBeNull();
    }
  });

  it("refuses preview links, artist pages and every other Studio path", () => {
    for (const path of [
      `/studio/preview/${"a".repeat(64)}`,
      `/studio/artist?id=${TRACK_ID}`,
      "/studio/scene?slug=lisbon-nights",
      `/studio/track/?id=${TRACK_ID}`,
      `/studio/tracks?id=${TRACK_ID}`,
      "/studio",
    ]) {
      expect(parseStudioLink(`https://queerpulse.com${path}`)).toBeNull();
    }
  });

  it("refuses a missing or malformed id", () => {
    expect(parseStudioLink("https://queerpulse.com/studio/track")).toBeNull();
    expect(
      parseStudioLink("https://queerpulse.com/studio/track?id="),
    ).toBeNull();
    expect(
      parseStudioLink("https://queerpulse.com/studio/track?id=nope"),
    ).toBeNull();
  });

  it("refuses an id padded with a space or a plus sign", () => {
    expect(parseStudioLink(`${TRACK_URL.replace("id=", "id=%20")}`)).toBeNull();
    expect(parseStudioLink(`${TRACK_URL}+`)).toBeNull();
  });

  it("refuses a root-relative path that resolves to another host", () => {
    expect(
      parseStudioLink(`/\\evil.example/studio/track?id=${TRACK_ID}`),
    ).toBeNull();
  });
});

describe("demo ids", () => {
  const DEMO_URL =
    "https://queerpulse.com/studio/album?id=demo-release-cidade-dos-santos";

  it("reads a demo slug while demo mode is on", () => {
    setDemoModeRuntime(true);
    expect(parseStudioLink(DEMO_URL)).toEqual({
      kind: "release",
      id: "demo-release-cidade-dos-santos",
      startAtSeconds: null,
    });
    expect(
      parseStudioLink("/studio/track?id=demo-track-home-3-01&t=5")
        ?.startAtSeconds,
    ).toBe(5);
  });

  it("refuses a demo slug in live mode", () => {
    setDemoModeRuntime(false);
    expect(parseStudioLink(DEMO_URL)).toBeNull();
  });

  it("still reads a uuid while demo mode is on", () => {
    setDemoModeRuntime(true);
    expect(parseStudioLink(TRACK_URL)?.id).toBe(TRACK_ID);
  });

  it("reads a demo milestone link while demo mode is on", () => {
    setDemoModeRuntime(true);
    expect(
      parseStudioLink(
        "/studio/artist?id=demo-persona-mariana-sol&milestone=demo-milestone-mariana-followers-1000",
      ),
    ).toEqual({
      kind: "milestone",
      id: "demo-milestone-mariana-followers-1000",
      artistId: "demo-persona-mariana-sol",
      startAtSeconds: null,
    });
  });
});

describe("findStudioLink", () => {
  it("finds the link after a note and returns the exact substring", () => {
    expect(findStudioLink(`ouve isto\n${TRACK_URL}&t=12`)).toEqual({
      target: { kind: "track", id: TRACK_ID, startAtSeconds: 12 },
      url: `${TRACK_URL}&t=12`,
    });
  });

  it("trims trailing punctuation and closing brackets", () => {
    for (const text of [
      `listen: ${TRACK_URL}.`,
      `(${TRACK_URL})`,
      `"${TRACK_URL}"`,
      `${TRACK_URL}!?`,
      `[${TRACK_URL}],`,
      `<${TRACK_URL}>`,
      `ouve isto «${TRACK_URL}»`,
    ]) {
      expect(findStudioLink(text)?.url).toBe(TRACK_URL);
    }
  });

  it("lets the first Studio link win over other sites and later links", () => {
    const releaseUrl = `https://queerpulse.com/studio/album?id=${RELEASE_ID}`;
    expect(
      findStudioLink(
        `https://example.com/post then ${releaseUrl} and ${TRACK_URL}`,
      )?.target.kind,
    ).toBe("release");
  });

  it("finds a root-relative link at the start or after a space or bracket", () => {
    expect(findStudioLink(`/studio/track?id=${TRACK_ID}`)?.target.id).toBe(
      TRACK_ID,
    );
    expect(
      findStudioLink(`look (/studio/collection?id=${PLAYLIST_ID})`)?.target
        .kind,
    ).toBe("playlist");
  });

  it("ignores a Studio path glued to another host or another path", () => {
    expect(
      findStudioLink(`example.com/studio/track?id=${TRACK_ID}`),
    ).toBeNull();
    expect(
      findStudioLink(`https://example.com/x/studio/track?id=${TRACK_ID}`),
    ).toBeNull();
    expect(findStudioLink(`see:${TRACK_URL}`)).toBeNull();
  });

  it("reads a link inside another link's run as part of that run", () => {
    expect(
      findStudioLink(
        `https://example.com/x(https://queerpulse.com/studio/track?id=${TRACK_ID})`,
      ),
    ).toBeNull();
    expect(
      findStudioLink(`https://example.com/'/studio/album?id=${RELEASE_ID}'`),
    ).toBeNull();
  });

  it("is null for text without a Studio link", () => {
    expect(findStudioLink("")).toBeNull();
    expect(findStudioLink("see you at the event")).toBeNull();
  });
});

describe("findStudioLinkAt", () => {
  it("points at the run the scan matched, past a longer run before it", () => {
    const text = `(${TRACK_URL}x) ${TRACK_URL}`;
    expect(findStudioLinkAt(text)).toEqual({
      match: findStudioLink(text),
      index: TRACK_URL.length + 4,
    });
  });

  it("is null for text without a Studio link", () => {
    expect(findStudioLinkAt("see you at the event")).toBeNull();
  });
});

describe("textWithoutStudioLink", () => {
  const noteOf = (text: string) => {
    const match = findStudioLink(text);
    if (!match) throw new Error("expected a Studio link in the fixture");
    return textWithoutStudioLink(text, match);
  };

  it("drops a link on its own line with the blank line it leaves", () => {
    expect(noteOf(`so good\n${TRACK_URL}\nsee you Saturday`)).toBe(
      "so good\nsee you Saturday",
    );
    expect(noteOf(`ouve isto\n${TRACK_URL}`)).toBe("ouve isto");
  });

  it("joins the two sides of a line with one space", () => {
    expect(noteOf(`try ${TRACK_URL} tonight`)).toBe("try tonight");
  });

  it("adds no space before closing punctuation", () => {
    expect(noteOf(`try ${TRACK_URL}, then call me`)).toBe("try, then call me");
  });

  it("returns an empty note for a link on its own", () => {
    expect(noteOf(`  ${TRACK_URL}  \n`)).toBe("");
  });

  it("returns an empty note when only brackets and punctuation are left", () => {
    expect(noteOf(`(${TRACK_URL}).`)).toBe("");
  });

  it("drops the brackets or quotes around the link with it", () => {
    expect(noteOf(`listen to this (${TRACK_URL}).`)).toBe("listen to this.");
    expect(noteOf(`listen to this (${TRACK_URL})!`)).toBe("listen to this!");
    expect(noteOf(`check "${TRACK_URL}" now`)).toBe("check now");
    expect(noteOf(`(${TRACK_URL}) wow`)).toBe("wow");
    expect(noteOf(`ouve isto «${TRACK_URL}»`)).toBe("ouve isto");
  });

  it("reads a CRLF line break as a line feed", () => {
    expect(noteOf(`so good\r\n${TRACK_URL}\r\nsee you Saturday`)).toBe(
      "so good\nsee you Saturday",
    );
  });

  it("keeps one paragraph break when the link had a paragraph to itself", () => {
    expect(noteOf(`so good\n\n${TRACK_URL}\n\nsee you`)).toBe(
      "so good\n\nsee you",
    );
    expect(noteOf(`so good\r\n\r\n${TRACK_URL}\r\n\r\nsee you`)).toBe(
      "so good\n\nsee you",
    );
    expect(noteOf(`so good\n${TRACK_URL}\nsee you`)).toBe("so good\nsee you");
  });

  it("cuts the link that matched when the same URL appears earlier", () => {
    expect(noteOf(`see:${TRACK_URL} or ${TRACK_URL}`)).toBe(
      `see:${TRACK_URL} or`,
    );
    expect(noteOf(`${TRACK_URL}x and ${TRACK_URL}`)).toBe(`${TRACK_URL}x and`);
  });
});

describe("studioLinkPath and studioLinkUrl", () => {
  it("builds the canonical root-relative path", () => {
    expect(
      studioLinkPath({ kind: "track", id: TRACK_ID, startAtSeconds: 83 }),
    ).toBe(`/studio/track?id=${TRACK_ID}&t=83`);
    expect(
      studioLinkPath({ kind: "release", id: RELEASE_ID, startAtSeconds: null }),
    ).toBe(`/studio/album?id=${RELEASE_ID}`);
    expect(
      studioLinkPath({
        kind: "playlist",
        id: PLAYLIST_ID,
        startAtSeconds: null,
      }),
    ).toBe(`/studio/collection?id=${PLAYLIST_ID}`);
  });

  it("makes it absolute on the running origin and round-trips", () => {
    const target = { kind: "track" as const, id: TRACK_ID, startAtSeconds: 9 };
    expect(studioLinkUrl(target)).toBe(
      `${window.location.origin}/studio/track?id=${TRACK_ID}&t=9`,
    );
    expect(parseStudioLink(studioLinkUrl(target))).toEqual(target);
  });
});

describe("milestone links", () => {
  it("reads an artist link with a milestone as a milestone", () => {
    expect(
      parseStudioLink(
        `https://queerpulse.com/studio/artist?id=${PERSONA_ID}&milestone=${MILESTONE_ID}`,
      ),
    ).toEqual({
      kind: "milestone",
      id: MILESTONE_ID,
      artistId: PERSONA_ID,
      startAtSeconds: null,
    });
  });

  it("lowercases both ids", () => {
    expect(
      parseStudioLink(
        `/studio/artist?id=${PERSONA_ID.toUpperCase()}&milestone=${MILESTONE_ID.toUpperCase()}`,
      ),
    ).toEqual({
      kind: "milestone",
      id: MILESTONE_ID,
      artistId: PERSONA_ID,
      startAtSeconds: null,
    });
  });

  it("reads a malformed milestone or persona id as a plain artist link", () => {
    for (const path of [
      `/studio/artist?id=${PERSONA_ID}&milestone=not-a-uuid`,
      `/studio/artist?id=nope&milestone=${MILESTONE_ID}`,
      `/studio/artist?milestone=${MILESTONE_ID}`,
    ])
      expect(parseStudioLink(path)).toBeNull();
  });

  it("builds the canonical path, id first", () => {
    expect(
      studioLinkPath(studioMilestoneTarget(PERSONA_ID, MILESTONE_ID)),
    ).toBe(`/studio/artist?id=${PERSONA_ID}&milestone=${MILESTONE_ID}`);
  });

  it("keys one card per milestone", () => {
    expect(
      studioShareTargetKey(studioMilestoneTarget(PERSONA_ID, MILESTONE_ID)),
    ).toBe(`milestone:${MILESTONE_ID}`);
  });

  it("finds a milestone link in a note", () => {
    const text = `we did it /studio/artist?id=${PERSONA_ID}&milestone=${MILESTONE_ID}!`;
    expect(findStudioLink(text)?.target.kind).toBe("milestone");
  });
});
