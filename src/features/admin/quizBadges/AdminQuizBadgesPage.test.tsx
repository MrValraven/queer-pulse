import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { ToastProvider } from "../../../shared/components/feedback/ToastProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { resetQuizWinBadgesDemoStore } from "../../quizshow/winBadges/quizWinBadgesDemoStore";
import { AdminQuizBadgesPage } from "./AdminQuizBadgesPage";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

// The admin chrome (theme toggle, nav-badge queries, role switcher) has
// nothing to do with this list.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const CHAMPION = "Quiz Night Champion";
const SHARPSHOOTER = "Trivia Sharpshooter";
const PRIDE = "Pride Quiz 2026";
const NEW_BADGE = "Bingo Royalty";
const NEW_DESCRIPTION = "Won the bingo round";
const PORTUGUESE_NAME_TAKEN =
  "Another badge already uses this Portuguese name. Pick a different one.";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MotionProvider>
          <ToastProvider>
            <MemoryRouter>
              <AdminQuizBadgesPage />
            </MemoryRouter>
          </ToastProvider>
        </MotionProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

/** The polite toast region; the page itself mounts no other status region
 *  while the rows show. */
function toastRegion(): HTMLElement {
  const region = screen
    .getAllByRole("status")
    .find((element) => element.getAttribute("aria-live") === "polite");
  if (!region) throw new Error("no toast region");
  return region;
}

function rowOf(name: string): HTMLElement {
  const heading = screen.getByRole("heading", { level: 2, name });
  const row = heading.closest("li");
  if (!row) throw new Error(`no row for ${name}`);
  return row;
}

async function findRow(name: string): Promise<HTMLElement> {
  await screen.findByRole("heading", { level: 2, name });
  return rowOf(name);
}

function rowNames(): string[] {
  return screen
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent ?? "");
}

async function openCreateDialog(user: ReturnType<typeof userEvent.setup>) {
  await findRow(CHAMPION);
  await user.click(screen.getByRole("button", { name: "Create badge" }));
  return screen.findByRole("dialog", { name: "Create badge" });
}

async function createBadge(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await openCreateDialog(user);
  await user.type(
    within(dialog).getByRole("textbox", { name: /^Name in English/ }),
    NEW_BADGE,
  );
  await user.type(
    within(dialog).getByRole("textbox", { name: /^Description in English/ }),
    NEW_DESCRIPTION,
  );
  await user.click(within(dialog).getByRole("button", { name: "Save badge" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Create badge" }),
    ).not.toBeInTheDocument(),
  );
  return findRow(NEW_BADGE);
}

beforeEach(async () => {
  resetQuizWinBadgesDemoStore();
  await awaitCatalog("quizshow", "members", "communities", "shared", "admin");
});

describe("AdminQuizBadgesPage", () => {
  it("lists live badges first and tags the archived one", async () => {
    renderPage();
    await findRow(CHAMPION);

    expect(rowNames()).toEqual([CHAMPION, SHARPSHOOTER, PRIDE]);
    expect(within(rowOf(PRIDE)).getByText("Archived")).toBeInTheDocument();
    expect(within(rowOf(CHAMPION)).queryByText("Archived")).toBeNull();
    expect(within(rowOf(SHARPSHOOTER)).queryByText("Archived")).toBeNull();
  });

  it("shows holders and events in the plural form", async () => {
    renderPage();
    const championRow = await findRow(CHAMPION);

    expect(within(championRow).getByText("1 holder")).toBeInTheDocument();
    expect(
      within(championRow).getByText("Used on 1 event"),
    ).toBeInTheDocument();
    expect(within(championRow).getByText("Legendary")).toBeInTheDocument();
  });

  it("creates a badge and previews it as members see it", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openCreateDialog(user);
    // The dialog opens on its first field.
    await waitFor(() =>
      expect(
        within(dialog).getByRole("textbox", { name: /^Name in English/ }),
      ).toHaveFocus(),
    );

    await user.type(
      within(dialog).getByRole("textbox", { name: /^Name in English/ }),
      NEW_BADGE,
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Description in English/ }),
      NEW_DESCRIPTION,
    );
    const musicIcon = within(dialog).getByRole("radio", { name: "Music" });
    await user.click(musicIcon);
    expect(musicIcon).toHaveAttribute("aria-checked", "true");

    const preview = within(dialog).getByRole("region", {
      name: "How members see it",
    });
    // The medallion's name line and the chip both carry the name; the chip's
    // name span also holds it as its title.
    expect(within(preview).getAllByText(NEW_BADGE)).toHaveLength(2);
    expect(within(preview).getByTitle(NEW_BADGE)).toHaveTextContent(NEW_BADGE);
    expect(within(preview).getByText(NEW_DESCRIPTION)).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "Save badge" }),
    );

    const newRow = await findRow(NEW_BADGE);
    expect(within(newRow).getByText("0 holders")).toBeInTheDocument();
    expect(
      await within(toastRegion()).findByText("Badge created"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Create badge" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the taken-name line under the Portuguese name", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openCreateDialog(user);
    const englishName = within(dialog).getByRole("textbox", {
      name: /^Name in English/,
    });
    const portugueseName = within(dialog).getByRole("textbox", {
      name: /^Name in Portuguese/,
    });

    await user.type(englishName, NEW_BADGE);
    await user.type(portugueseName, "Campeã da noite de quiz");
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Description in English/ }),
      NEW_DESCRIPTION,
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save badge" }),
    );

    expect(
      await within(dialog).findByText(PORTUGUESE_NAME_TAKEN),
    ).toBeInTheDocument();
    expect(portugueseName).toHaveAttribute("aria-invalid", "true");
    expect(portugueseName).toHaveAccessibleDescription(PORTUGUESE_NAME_TAKEN);
    expect(englishName).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("dialog", { name: "Create badge" })).toBe(dialog);
  });

  it("offers Delete badge only for a badge nobody holds", async () => {
    const user = userEvent.setup();
    renderPage();
    await findRow(CHAMPION);
    expect(screen.queryByRole("button", { name: "Delete badge" })).toBeNull();

    const newRow = await createBadge(user);
    expect(
      within(rowOf(CHAMPION)).queryByRole("button", { name: "Delete badge" }),
    ).toBeNull();
    await user.click(
      within(newRow).getByRole("button", { name: "Delete badge" }),
    );

    const confirm = await screen.findByRole("dialog", {
      name: `Delete ${NEW_BADGE}?`,
    });
    expect(
      within(confirm).getByRole("button", { name: "Keep badge" }),
    ).toBeInTheDocument();
    await user.click(
      within(confirm).getByRole("button", { name: "Delete badge" }),
    );

    expect(
      await within(toastRegion()).findByText("Badge deleted"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { level: 2, name: NEW_BADGE }),
      ).not.toBeInTheDocument(),
    );
  });

  it("archives and restores from the row menu", async () => {
    const user = userEvent.setup();
    renderPage();
    await findRow(SHARPSHOOTER);

    const actions = screen.getByRole("group", {
      name: `Actions for ${SHARPSHOOTER}`,
    });
    await user.click(
      within(actions).getByRole("button", { name: "Archive badge" }),
    );

    expect(
      await within(toastRegion()).findByText(
        "Badge archived. Members who hold it keep it",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(rowNames()).toEqual([CHAMPION, PRIDE, SHARPSHOOTER]),
    );
    expect(
      within(rowOf(SHARPSHOOTER)).getByText("Archived"),
    ).toBeInTheDocument();
    // The row moved to the end, and its button kept focus.
    await waitFor(() =>
      expect(
        within(
          screen.getByRole("group", { name: `Actions for ${SHARPSHOOTER}` }),
        ).getByRole("button", { name: "Restore badge" }),
      ).toHaveFocus(),
    );

    await user.click(
      within(
        screen.getByRole("group", { name: `Actions for ${SHARPSHOOTER}` }),
      ).getByRole("button", { name: "Restore badge" }),
    );

    expect(
      await within(toastRegion()).findByText("Badge restored"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(rowNames()).toEqual([CHAMPION, SHARPSHOOTER, PRIDE]),
    );
    await waitFor(() =>
      expect(within(rowOf(SHARPSHOOTER)).queryByText("Archived")).toBeNull(),
    );
  });
});
