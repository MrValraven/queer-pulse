import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { CreatorDraftPreviewFrame } from "./CreatorDraftPreviewFrame";

describe("CreatorDraftPreviewFrame", () => {
  it("swallows a link, a button and a form submit inside the preview", async () => {
    const onButton = vi.fn();
    const onSubmit = vi.fn();
    render(
      <TestProviders initialEntries={["/admin/creator-drafts/event/1"]}>
        <CreatorDraftPreviewFrame label="Preview">
          <a href="/community/rainbow-runners">Rainbow Runners</a>
          <button type="button" onClick={onButton}>
            RSVP
          </button>
          <form onSubmit={onSubmit}>
            <button type="submit">Send</button>
          </form>
        </CreatorDraftPreviewFrame>
        <Routes>
          <Route path="/community/:slug" element={<p>Left the admin page</p>} />
        </Routes>
      </TestProviders>,
    );
    await userEvent.click(
      screen.getByRole("link", { name: "Rainbow Runners" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "RSVP" }));
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onButton).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText("Left the admin page")).toBeNull();
    expect(
      await screen.findAllByText(
        /creatorDrafts\.preview\.inertToast|This is a preview/,
      ),
    ).not.toHaveLength(0);
  });

  it("stops the keyboard press of a custom button", async () => {
    const onKeyDown = vi.fn();
    render(
      <TestProviders>
        <CreatorDraftPreviewFrame label="Preview">
          <span role="button" tabIndex={0} onKeyDown={onKeyDown}>
            Follow
          </span>
        </CreatorDraftPreviewFrame>
      </TestProviders>,
    );
    screen.getByRole("button", { name: "Follow" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it("labels the region for screen readers and keeps its text readable", () => {
    render(
      <TestProviders>
        <CreatorDraftPreviewFrame label="Event preview">
          <p>Picnic</p>
        </CreatorDraftPreviewFrame>
      </TestProviders>,
    );
    expect(
      screen.getByRole("region", { name: "Event preview" }),
    ).toHaveTextContent("Picnic");
  });
});
