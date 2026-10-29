import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import type {
  StudioLandingPhotoView,
  StudioLandingView,
} from "../api/studioLanding.adapters";
import { StudioLandingClosing } from "./StudioLandingClosing";
import { StudioLandingManifesto } from "./StudioLandingManifesto";

const mocks: { photo: StudioLandingPhotoView | null } = vi.hoisted(() => ({
  photo: null,
}));

vi.mock("../api/useStudioLanding", () => ({
  useStudioLanding: () => ({
    landing: {
      photos: { hero: null, manifesto: mocks.photo },
    } as unknown as StudioLandingView,
    isLoading: false,
    isError: false,
  }),
}));

const MANIFESTO_PHOTO: StudioLandingPhotoView = {
  url: "https://example.test/choir.jpg",
  altText: {
    en: "A choir rehearses together",
    pt: "Um coro ensaia em conjunto",
  },
  credit: "Ana Souza",
};

beforeEach(() => {
  mocks.photo = null;
});

afterEach(() => {
  localStorage.clear();
});

function renderManifesto() {
  return render(
    <TestProviders>
      <StudioLandingManifesto />
    </TestProviders>,
  );
}

describe("StudioLandingManifesto", () => {
  it("without a photo it renders the quote and the paragraphs only", async () => {
    renderManifesto();
    expect(
      await screen.findByRole("heading", { level: 2 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByText(/Photo:/)).toBeNull();
  });

  it("with a photo it shows the English alt text and the credit caption", async () => {
    mocks.photo = MANIFESTO_PHOTO;
    renderManifesto();
    const image = await screen.findByRole("img", {
      name: "A choir rehearses together",
    });
    expect(image).toHaveAttribute("src", "https://example.test/choir.jpg");
    expect(image).toHaveAttribute("width");
    expect(image).toHaveAttribute("height");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(await screen.findByText("Photo: Ana Souza")).toBeInTheDocument();
  });

  it("with a photo in Portuguese it uses the pt alt text", async () => {
    localStorage.setItem("qp.lang", "pt");
    mocks.photo = MANIFESTO_PHOTO;
    renderManifesto();
    expect(
      await screen.findByRole("img", { name: "Um coro ensaia em conjunto" }),
    ).toBeInTheDocument();
  });

  it("falls back to the English alt text when the pt one is empty", async () => {
    localStorage.setItem("qp.lang", "pt");
    mocks.photo = {
      ...MANIFESTO_PHOTO,
      altText: { en: "A choir rehearses together", pt: "" },
    };
    renderManifesto();
    expect(
      await screen.findByRole("img", { name: "A choir rehearses together" }),
    ).toBeInTheDocument();
  });

  it("omits the caption when the photo has no credit", async () => {
    mocks.photo = { ...MANIFESTO_PHOTO, credit: null };
    renderManifesto();
    await screen.findByRole("img");
    expect(screen.queryByText(/Photo:/)).toBeNull();
  });
});

describe("StudioLandingClosing", () => {
  function renderClosing(audience: "listener" | "artist") {
    return render(
      <TestProviders>
        <StudioLandingClosing audience={audience} />
      </TestProviders>,
    );
  }

  it("signed out: the invite follows the audience and the body line shows", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderClosing("artist");
    const inviteLink = await screen.findByRole("link", {
      name: "Request an invite",
    });
    expect(inviteLink).toHaveAttribute(
      "href",
      "/auth/request-invite?from=studio_artist",
    );
    expect(screen.getByText(/Join with an invite/)).toBeInTheDocument();
  });

  it("signed out listener: the invite is tagged studio_landing", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderClosing("listener");
    expect(
      await screen.findByRole("link", { name: "Request an invite" }),
    ).toHaveAttribute("href", "/auth/request-invite?from=studio_landing");
  });

  it("a signed-in member does not see the body line", async () => {
    renderClosing("listener");
    await screen.findByRole("heading", { level: 2 });
    expect(screen.queryByText(/Join with an invite/)).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });
});
