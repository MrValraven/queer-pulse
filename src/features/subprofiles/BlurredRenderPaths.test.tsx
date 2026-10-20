import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileSpotlight } from "./SubprofileSpotlight";
import { SubprofileFeaturedStrip } from "./SubprofileFeaturedStrip";
import { StudioLightbox } from "./skins/StudioLightbox";
import { resetPhotoReveals } from "./photoReveal";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * Every shared render path wraps a blurred tattoo photo in `BlurredPhoto`:
 * the spotlight and the studio lightbox offer Show photo, the profile feature
 * strip (inside a link) keeps a static blur, and one reveal holds across
 * paths because the reveal store is keyed by the image URL.
 */
const SCAR_WORK_ITEM = {
  id: "item-scar-work",
  section: "scar_work",
  title: "Botanical scar cover",
  createdAt: "2026-09-02T12:00:00.000Z",
  subtitle: "",
  description: "",
  url: "",
  imageUrl: "/work-image/scar-work.jpg",
  date: "",
  meta: "",
  tags: [],
  isFeatured: true,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: null,
} satisfies SubprofileItemView;

const FLASH_ITEM = {
  ...SCAR_WORK_ITEM,
  id: "item-flash",
  section: "flash",
  title: "Moth and moon flash",
  imageUrl: "/work-image/flash.jpg",
} satisfies SubprofileItemView;

function renderWithProviders(ui: ReactElement) {
  return render(<TestProviders>{ui}</TestProviders>);
}

function renderSpotlight(item: SubprofileItemView) {
  return renderWithProviders(
    <SubprofileSpotlight
      item={item}
      skin="studio"
      mode="public"
      accent={null}
    />,
  );
}

function renderLightbox(item: SubprofileItemView) {
  return renderWithProviders(
    <StudioLightbox
      items={[item]}
      index={0}
      onClose={vi.fn()}
      onMove={vi.fn()}
    />,
  );
}

describe("blurred photos on the shared render paths", () => {
  beforeEach(() => {
    resetPhotoReveals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blurs a starred scar work photo in the spotlight until Show photo", async () => {
    renderSpotlight(SCAR_WORK_ITEM);

    const showButton = await screen.findByRole("button", {
      name: "Show photo",
    });
    expect(
      screen.queryByRole("img", { name: SCAR_WORK_ITEM.title }),
    ).toBeNull();

    fireEvent.click(showButton);
    expect(
      screen.getByRole("img", { name: SCAR_WORK_ITEM.title }),
    ).toBeInTheDocument();
  });

  it("opens a blurred photo blurred in the lightbox", async () => {
    renderLightbox(SCAR_WORK_ITEM);

    expect(
      await screen.findByRole("button", { name: "Show photo" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: SCAR_WORK_ITEM.title }),
    ).toBeNull();
  });

  it("keeps Tab inside a single blurred work lightbox", async () => {
    // jsdom does no layout, so every element reports a null offsetParent,
    // which the Tab trap reads to skip hidden controls.
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.parentElement;
      },
    );
    renderLightbox(SCAR_WORK_ITEM);

    const showButton = await screen.findByRole("button", {
      name: "Show photo",
    });
    const closeButton = screen.getByRole("button", { name: "Close" });

    showButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(showButton).toHaveFocus();
  });

  it("shares one reveal between the spotlight and the lightbox", async () => {
    const spotlight = renderSpotlight(SCAR_WORK_ITEM);
    fireEvent.click(await screen.findByRole("button", { name: "Show photo" }));
    spotlight.unmount();

    renderLightbox(SCAR_WORK_ITEM);
    expect(
      await screen.findByRole("button", { name: "Hide photo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: SCAR_WORK_ITEM.title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show photo" })).toBeNull();
  });

  it("blurs the feature strip thumbnail with no button", async () => {
    const { container } = renderWithProviders(
      <SubprofileFeaturedStrip
        item={{ ...SCAR_WORK_ITEM, url: "https://example.com/scar-work" }}
        accent="coral"
      />,
    );

    expect(await screen.findByText(SCAR_WORK_ITEM.title)).toBeInTheDocument();
    expect(container.querySelector("[data-concealed]")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("leaves a flash spotlight sharp", async () => {
    const { container } = renderSpotlight(FLASH_ITEM);

    expect(
      await screen.findByRole("img", { name: FLASH_ITEM.title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show photo" })).toBeNull();
    expect(container.querySelector("[data-concealed]")).toBeNull();
  });
});
