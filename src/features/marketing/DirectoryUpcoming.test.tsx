import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryUpcoming } from "./DirectoryUpcoming";
import { downloadUpcomingIcs } from "./upcomingCalendar";

vi.mock("./upcomingCalendar", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./upcomingCalendar")>()),
  downloadUpcomingIcs: vi.fn(),
}));

const upcoming = [
  {
    when: "Sat 17 Oct · 10:00",
    title: "Queer history walk: Mouraria",
    slug: "queer-history-walk",
    startAt: "2026-10-17T10:00:00",
    role: "runBy" as const,
  },
  {
    when: "Sun 18 Oct · 20:00",
    title: "Supper",
    slug: "supper-club-12",
    startAt: "2026-10-18T20:00:00",
  },
];

describe("DirectoryUpcoming", () => {
  it("labels a gathering the listing runs, once", async () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <DirectoryUpcoming
            upcoming={upcoming}
            placeName="Lisboa Arco-Íris Walks"
          />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(
      await screen.findAllByText("Run by Lisboa Arco-Íris Walks"),
    ).toHaveLength(1);
  });

  it("leaves the calendar location blank for a run-by gathering", async () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <DirectoryUpcoming
            upcoming={upcoming}
            placeName="Lisboa Arco-Íris Walks"
          />
        </I18nProvider>
      </MemoryRouter>,
    );
    const calendarLinks = await screen.findAllByRole("link", {
      name: /Google/i,
    });
    expect(calendarLinks[0]?.getAttribute("href")).not.toContain("location=");
    expect(calendarLinks[1]?.getAttribute("href")).toContain("location=");
  });

  it("downloads the calendar file with no location for a run-by gathering", async () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <DirectoryUpcoming
            upcoming={upcoming}
            placeName="Lisboa Arco-Íris Walks"
          />
        </I18nProvider>
      </MemoryRouter>,
    );
    const downloadButtons = await screen.findAllByRole("button");
    fireEvent.click(downloadButtons[0]!);
    fireEvent.click(downloadButtons[1]!);
    const calls = vi.mocked(downloadUpcomingIcs).mock.calls;
    expect(calls[0]?.[0].location).toBe("");
    expect(calls[1]?.[0].location).toBe("Lisboa Arco-Íris Walks");
  });
});
