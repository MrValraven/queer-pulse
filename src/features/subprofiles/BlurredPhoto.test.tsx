import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { BlurredPhoto } from "./BlurredPhoto";
import { resetPhotoReveals } from "./photoReveal";

const photoName = "Healed top surgery piece";
const photoKey = "work-image/u1/a.jpg";

function renderPhotos(ui: React.ReactElement) {
  return render(<TestProviders>{ui}</TestProviders>);
}

describe("BlurredPhoto", () => {
  beforeEach(() => {
    resetPhotoReveals();
  });

  it("hides a blurred photo from assistive tech until Show photo", () => {
    renderPhotos(
      <BlurredPhoto isBlurred revealKey={photoKey}>
        <img alt={photoName} src="/a.jpg" />
      </BlurredPhoto>,
    );
    expect(screen.queryByRole("img", { name: photoName })).toBeNull();
    const showButton = screen.getByRole("button", { name: "Show photo" });
    expect(showButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(showButton);
    expect(screen.getByRole("img", { name: photoName })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hide photo" }),
    ).toBeInTheDocument();
  });

  it("keeps one reveal across every copy of the same photo", () => {
    renderPhotos(
      <>
        <BlurredPhoto isBlurred revealKey={photoKey}>
          <img alt="First copy" src="/a.jpg" />
        </BlurredPhoto>
        <BlurredPhoto isBlurred revealKey={photoKey}>
          <img alt="Second copy" src="/a.jpg" />
        </BlurredPhoto>
      </>,
    );
    expect(screen.queryByRole("img", { name: "First copy" })).toBeNull();
    expect(screen.queryByRole("img", { name: "Second copy" })).toBeNull();

    const [firstShowButton] = screen.getAllByRole("button", {
      name: "Show photo",
    });
    if (!firstShowButton) throw new Error("Expected a Show photo button");
    fireEvent.click(firstShowButton);
    expect(screen.getByRole("img", { name: "First copy" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Second copy" }),
    ).toBeInTheDocument();
  });

  it("renders a sharp photo with no button when it is not blurred", () => {
    renderPhotos(
      <BlurredPhoto isBlurred={false} revealKey={photoKey}>
        <img alt={photoName} src="/a.jpg" />
      </BlurredPhoto>,
    );
    expect(screen.getByRole("img", { name: photoName })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers no button on a static blur", () => {
    renderPhotos(
      <BlurredPhoto isBlurred isRevealable={false} revealKey={photoKey}>
        <img alt={photoName} src="/a.jpg" />
      </BlurredPhoto>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("img", { name: photoName })).toBeNull();
  });

  it("mounts a new photo already concealed when the reveal key changes", () => {
    const { rerender, container } = renderPhotos(
      <BlurredPhoto isBlurred revealKey={photoKey}>
        <img alt={photoName} src="/a.jpg" />
      </BlurredPhoto>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show photo" }));
    expect(container.querySelector("[data-concealed]")).toBeNull();

    rerender(
      <TestProviders>
        <BlurredPhoto isBlurred revealKey="work-image/u1/b.jpg">
          <img alt={photoName} src="/b.jpg" />
        </BlurredPhoto>
      </TestProviders>,
    );
    expect(container.querySelector("[data-concealed]")).not.toBeNull();
    expect(screen.queryByRole("img", { name: photoName })).toBeNull();
  });

  it("moves focus to Hide photo after Show photo and back to Show photo after Hide photo", () => {
    renderPhotos(
      <BlurredPhoto isBlurred revealKey={photoKey}>
        <img alt={photoName} src="/a.jpg" />
      </BlurredPhoto>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show photo" }));
    const hideButton = screen.getByRole("button", { name: "Hide photo" });
    expect(hideButton).toHaveFocus();

    fireEvent.click(hideButton);
    expect(screen.getByRole("button", { name: "Show photo" })).toHaveFocus();
  });

  it("keeps focus on the clicked copy when another copy shares the reveal", () => {
    renderPhotos(
      <>
        <BlurredPhoto isBlurred revealKey={photoKey}>
          <img alt="First copy" src="/a.jpg" />
        </BlurredPhoto>
        <BlurredPhoto isBlurred revealKey={photoKey}>
          <img alt="Second copy" src="/a.jpg" />
        </BlurredPhoto>
      </>,
    );
    const [firstShowButton] = screen.getAllByRole("button", {
      name: "Show photo",
    });
    if (!firstShowButton) throw new Error("Expected a Show photo button");
    fireEvent.click(firstShowButton);

    const [firstHideButton, secondHideButton] = screen.getAllByRole("button", {
      name: "Hide photo",
    });
    expect(firstHideButton).toHaveFocus();
    expect(secondHideButton).not.toHaveFocus();
  });

  it("conceals the photo again with Hide photo", () => {
    const { container } = renderPhotos(
      <BlurredPhoto isBlurred revealKey={photoKey}>
        <img alt={photoName} src="/a.jpg" />
      </BlurredPhoto>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show photo" }));
    expect(container.querySelector("[data-concealed]")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Hide photo" }));
    expect(screen.queryByRole("img", { name: photoName })).toBeNull();
    expect(container.querySelector("[data-concealed]")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Show photo" }),
    ).toBeInTheDocument();
  });
});
