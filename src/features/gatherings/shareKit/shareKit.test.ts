import { describe, expect, it } from "vitest";
import { escapeIcsText } from "../../../shared/lib/calendarExport";
import {
  buildGatheringCalendarEvents,
  buildMultiEventIcs,
  gatheringDurationMs,
  localDateTime,
  type GatheringCalendarInput,
} from "./gatheringCalendar";
import { whatsAppShareUrl } from "./shareLinks";
import { drawStoryImage, type StoryImageContent } from "./storyImage";
import {
  STORY_CANVAS_WIDTH,
  STORY_FALLBACK_PALETTE,
  STORY_SIDE_MARGIN,
  STORY_TEXT,
} from "./storyImage.data";
import { fitLine, storyLineMaxWidth, wrapTitleLines } from "./storyTextFit";

/**
 * The pure helpers behind the share kit on the published screen. The
 * downloads need a browser. The story drawing runs here on a stand-in
 * context that records every line it paints.
 */

const HOUR_MS = 60 * 60 * 1000;

const exampleUrlForSlug = (occurrenceSlug: string) =>
  `https://example.test/g/${occurrenceSlug}`;

function calendarInput(
  overrides: Partial<GatheringCalendarInput> = {},
): GatheringCalendarInput {
  return {
    title: "Thursday supper club, 8 seats",
    description: "Bring a dish",
    date: "2030-10-03",
    time: "19:30",
    endDate: "",
    endTime: "22:30",
    repeats: false,
    cadence: "weekly",
    endType: "count",
    endCount: "3",
    endUntil: "",
    ...overrides,
  };
}

describe("whatsAppShareUrl", () => {
  it("puts the title and the link on two lines, URL-encoded", () => {
    const url = whatsAppShareUrl(" Supper club ", "https://example.test/g/1");
    expect(url).toBe(
      `https://wa.me/?text=${encodeURIComponent("Supper club\nhttps://example.test/g/1")}`,
    );
  });

  it("sends the link alone when the title is blank", () => {
    expect(whatsAppShareUrl("  ", "https://example.test")).toBe(
      `https://wa.me/?text=${encodeURIComponent("https://example.test")}`,
    );
  });
});

describe("gatheringDurationMs", () => {
  it("measures a same-day evening", () => {
    expect(gatheringDurationMs(calendarInput())).toBe(3 * HOUR_MS);
  });

  it("rolls an end clock before the start into the next day", () => {
    expect(
      gatheringDurationMs(calendarInput({ time: "22:00", endTime: "02:00" })),
    ).toBe(4 * HOUR_MS);
  });

  it("uses the host's own end date when there is one", () => {
    expect(
      gatheringDurationMs(
        calendarInput({ endDate: "2030-10-04", endTime: "19:30" }),
      ),
    ).toBe(24 * HOUR_MS);
  });

  it("is null without an end time", () => {
    expect(gatheringDurationMs(calendarInput({ endTime: "" }))).toBeNull();
  });

  it("rolls forward a calendar day, so a clock change that night keeps the wall-clock end", () => {
    // Europe/Lisbon falls back at 02:00 on Sunday 27 October 2030, so there
    // this night runs five hours. The expectation is built from local dates,
    // so the case holds in every zone. It tells a calendar day apart from a
    // flat 24 hours only in a zone with a change that night (run it with
    // TZ=Europe/Lisbon).
    const startAt = localDateTime("2030-10-26", "22:00")!;
    const endAt = localDateTime("2030-10-27", "02:00")!;
    expect(
      gatheringDurationMs(
        calendarInput({ date: "2030-10-26", time: "22:00", endTime: "02:00" }),
      ),
    ).toBe(endAt.getTime() - startAt.getTime());
  });
});

describe("buildGatheringCalendarEvents", () => {
  const seriesSlugs = ["supper-club", "supper-club-k3x9", "supper-club-p2m7"];

  it("gives one event per date of a series, each with the same length", () => {
    const events = buildGatheringCalendarEvents({
      form: calendarInput({ repeats: true }),
      slug: "supper-club",
      occurrenceSlugs: seriesSlugs,
      urlForSlug: exampleUrlForSlug,
      location: "Damas, Graça",
    });
    expect(events).toHaveLength(3);
    expect(events.map((event) => event.uid)).toEqual([
      "supper-club-1@queerpulse.app",
      "supper-club-2@queerpulse.app",
      "supper-club-3@queerpulse.app",
    ]);
    for (const event of events) {
      expect(event.end!.getTime() - event.start.getTime()).toBe(3 * HOUR_MS);
    }
    expect(events[0]!.description).toBe(
      "Bring a dish\n\nhttps://example.test/g/supper-club",
    );
  });

  it("links each date to its own slug when there is one slug per date", () => {
    const events = buildGatheringCalendarEvents({
      form: calendarInput({ repeats: true }),
      slug: "supper-club",
      occurrenceSlugs: seriesSlugs,
      urlForSlug: exampleUrlForSlug,
      location: "",
    });
    expect(events.map((event) => event.url)).toEqual(
      seriesSlugs.map(exampleUrlForSlug),
    );
    expect(events[1]!.description).toBe(
      "Bring a dish\n\nhttps://example.test/g/supper-club-k3x9",
    );
    expect(new Set(events.map((event) => event.uid)).size).toBe(3);
  });

  it("links every date to the first slug when the counts differ", () => {
    const events = buildGatheringCalendarEvents({
      form: calendarInput({ repeats: true }),
      slug: "supper-club",
      occurrenceSlugs: seriesSlugs.slice(0, 2),
      urlForSlug: exampleUrlForSlug,
      location: "",
    });
    expect(events).toHaveLength(3);
    expect(events.map((event) => event.url)).toEqual([
      "https://example.test/g/supper-club",
      "https://example.test/g/supper-club",
      "https://example.test/g/supper-club",
    ]);
    expect(new Set(events.map((event) => event.uid)).size).toBe(3);
  });

  it("links every date to the first slug when no slugs came back", () => {
    const events = buildGatheringCalendarEvents({
      form: calendarInput({ repeats: true }),
      slug: "supper-club",
      occurrenceSlugs: [],
      urlForSlug: exampleUrlForSlug,
      location: "",
    });
    expect(new Set(events.map((event) => event.url))).toEqual(
      new Set(["https://example.test/g/supper-club"]),
    );
  });

  it("gives a single event linked to its one slug when the gathering does not repeat", () => {
    const events = buildGatheringCalendarEvents({
      form: calendarInput(),
      slug: "one-off",
      occurrenceSlugs: ["one-off"],
      urlForSlug: exampleUrlForSlug,
      location: "",
    });
    expect(events).toHaveLength(1);
    expect(events[0]!.url).toBe("https://example.test/g/one-off");
  });
});

describe("escapeIcsText", () => {
  it("escapes the backslash first, so the escapes after it stay single", () => {
    expect(escapeIcsText("a\\;b")).toBe("a\\\\\\;b");
  });

  it("escapes semicolons and commas", () => {
    expect(escapeIcsText("Supper; club, 8 seats")).toBe(
      "Supper\\; club\\, 8 seats",
    );
  });

  it("writes CRLF, CR and LF each as one literal \\n", () => {
    expect(escapeIcsText("one\r\ntwo\rthree\nfour")).toBe(
      "one\\ntwo\\nthree\\nfour",
    );
  });

  it("keeps plain text as it is", () => {
    expect(escapeIcsText("Damas Graça 19:30")).toBe("Damas Graça 19:30");
  });
});

describe("buildMultiEventIcs", () => {
  const start = new Date(Date.UTC(2030, 9, 3, 18, 30));

  it("writes a VEVENT per event with CRLF lines and escaped text", () => {
    const ics = buildMultiEventIcs(
      [
        {
          uid: "a@queerpulse.app",
          title: "Supper; club, 8 seats",
          start,
          end: new Date(start.getTime() + HOUR_MS),
          location: "Damas, Graça",
          description: "Line one\nLine two",
          url: "https://example.test/g?x=1,2",
        },
        {
          uid: "b@queerpulse.app",
          title: "Second",
          start,
          end: null,
          location: "",
          description: "",
          url: "https://example.test/g",
        },
      ],
      start,
    );
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines.at(-1)).toBe("END:VCALENDAR");
    expect(lines.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(2);
    expect(lines).toContain("SUMMARY:Supper\\; club\\, 8 seats");
    expect(lines).toContain("DESCRIPTION:Line one\\nLine two");
    expect(lines).toContain("URL:https://example.test/g?x=1,2");
    expect(lines).toContain("DTSTART:20301003T183000Z");
    expect(lines.filter((line) => line.startsWith("DTEND:"))).toHaveLength(1);
    expect(lines.filter((line) => line.startsWith("LOCATION:"))).toHaveLength(
      1,
    );
  });
});

describe("wrapTitleLines", () => {
  const measureByLength = (line: string) => line.length * 10;

  it("breaks between words at the width", () => {
    expect(
      wrapTitleLines("Thursday supper club", 130, measureByLength, 4),
    ).toEqual(["Thursday", "supper club"]);
  });

  it("ends the last kept line in an ellipsis past the line cap", () => {
    const lines = wrapTitleLines("one two three four", 30, measureByLength, 2);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("one");
    expect(lines[1]!.endsWith("…")).toBe(true);
    expect(measureByLength(lines[1]!)).toBeLessThanOrEqual(30);
  });

  it("cuts a word wider than a whole line by characters, on a line of its own", () => {
    expect(
      wrapTitleLines("Hi Supercalifragilistic", 100, measureByLength, 4),
    ).toEqual(["Hi", "Supercalif", "ragilistic"]);
  });

  it("lets the next word join the last piece of a cut word when it fits", () => {
    expect(
      wrapTitleLines("Supercalifragilistic go", 130, measureByLength, 4),
    ).toEqual(["Supercalifrag", "ilistic go"]);
  });

  it("keeps every line of a cut word inside the width, ellipsis included", () => {
    const lines = wrapTitleLines(
      "Supercalifragilisticexpialidocious",
      100,
      measureByLength,
      2,
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]!.endsWith("…")).toBe(true);
    for (const line of lines) {
      expect(measureByLength(line)).toBeLessThanOrEqual(100);
    }
  });
});

describe("fitLine", () => {
  const measureByCodePoints = (line: string) => Array.from(line).length * 10;

  it("keeps a line that fits", () => {
    expect(fitLine("Lisbon", 60, measureByCodePoints)).toBe("Lisbon");
  });

  it("cuts a long line back and ends it in an ellipsis inside the width", () => {
    const fitted = fitLine(
      "Mouraria Community Centre",
      100,
      measureByCodePoints,
    );
    expect(fitted).toBe("Mouraria…");
    expect(measureByCodePoints(fitted)).toBeLessThanOrEqual(100);
  });

  it("keeps a character outside the basic plane whole when it cuts", () => {
    // Two UTF-16 units: a cut by code unit would leave half of it behind.
    const wideCharacter = String.fromCodePoint(0x1d538);
    const text = `ab${wideCharacter.repeat(3)}`;
    expect(fitLine(text, 40, measureByCodePoints)).toBe(`ab${wideCharacter}…`);
  });
});

describe("storyLineMaxWidth", () => {
  it("is the canvas width less the line's x and the side margin", () => {
    expect(storyLineMaxWidth(STORY_TEXT.place)).toBe(840);
    expect(storyLineMaxWidth(STORY_TEXT.dayNumber)).toBe(860);
  });
});

describe("drawStoryImage", () => {
  const CHARACTER_WIDTH = 30;

  function recordingContext() {
    const paintedLines: { text: string; x: number }[] = [];
    const doNothing = () => undefined;
    const context = {
      font: "",
      fillStyle: "",
      fillRect: doNothing,
      beginPath: doNothing,
      arc: doNothing,
      fill: doNothing,
      createRadialGradient: () => ({ addColorStop: doNothing }),
      measureText: (line: string) => ({
        width: Array.from(line).length * CHARACTER_WIDTH,
      }),
      fillText: (text: string, x: number) => {
        paintedLines.push({ text, x });
      },
    };
    return {
      context: context as unknown as CanvasRenderingContext2D,
      paintedLines,
    };
  }

  const longContent: StoryImageContent = {
    brandName: "QueerPulse",
    formatName: "COMMUNITY POTLUCK AND BOARD GAMES EVENING",
    dayNumber: "12",
    weekday: "Wednesday",
    monthAndTime: "September · 19:30",
    title: "A title with Supercalifragilisticexpialidocious in it",
    place: "Associação Cultural da Mouraria, Rua do Capelão 12, Lisboa",
    details: "8 spots · Pay what you can, five euros suggested at the door",
    displayUrl:
      "queerpulse.app/g/a-title-with-supercalifragilisticexpialidocious-in-it",
  };

  it("fits every line it paints inside the side margin", () => {
    const { context, paintedLines } = recordingContext();
    drawStoryImage(context, longContent, { ...STORY_FALLBACK_PALETTE });
    expect(paintedLines.length).toBeGreaterThan(0);
    for (const line of paintedLines) {
      expect(
        line.x + Array.from(line.text).length * CHARACTER_WIDTH,
      ).toBeLessThanOrEqual(STORY_CANVAS_WIDTH - STORY_SIDE_MARGIN);
    }
  });

  it("ends each over-long single line in an ellipsis and keeps short ones whole", () => {
    const { context, paintedLines } = recordingContext();
    drawStoryImage(context, longContent, { ...STORY_FALLBACK_PALETTE });
    const paintedTexts = paintedLines.map((line) => line.text);
    for (const start of ["COMMUNITY", "Associação", "8 spots"]) {
      const painted = paintedTexts.find((text) => text.startsWith(start));
      expect(painted?.endsWith("…")).toBe(true);
    }
    expect(paintedTexts).toContain("Wednesday");
    expect(paintedTexts).toContain("September · 19:30");
  });
});
