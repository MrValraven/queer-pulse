import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { subprofileQueryKey } from "./api/useSubprofile";
import { usePersonaRekeyRedirect } from "./usePersonaRekeyRedirect";

/**
 * ENG-447: an unlink gives the persona a fresh id and the old one stops
 * resolving, so the open editor moves to the new address once its save is
 * done, and the owner query under the old id is dropped once it lands. A
 * sibling reports where the router ended up.
 */

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

/** Stands in for the editor: the persona it holds follows the route once the
 *  route names the new id, as the page's owner query does. */
function Editor({
  heldSubprofileId,
  isSettled,
}: {
  heldSubprofileId: string;
  isSettled: boolean;
}) {
  usePersonaRekeyRedirect(heldSubprofileId, isSettled);
  const location = useLocation();
  return <p data-testid="where">{`${location.pathname}${location.search}`}</p>;
}

function renderEditorAt(
  entry: string,
  heldSubprofileId: string,
  isSettled: boolean,
  queryClient = new QueryClient(),
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route
            path="/account/subprofiles/:id/edit"
            element={
              <Editor
                heldSubprofileId={heldSubprofileId}
                isSettled={isSettled}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("usePersonaRekeyRedirect", () => {
  it("moves a settled editor to the persona's new id, keeping the open pane", async () => {
    renderEditorAt(
      "/account/subprofiles/sp-named/edit?pane=address",
      "sp-fresh",
      true,
    );

    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(
        "/account/subprofiles/sp-fresh/edit?pane=address",
      ),
    );
  });

  it("drops the owner query under the retired id once the route lands", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(subprofileQueryKey(false, "sp-named"), {
      id: "sp-fresh",
    });
    queryClient.setQueryData(subprofileQueryKey(false, "sp-fresh"), {
      id: "sp-fresh",
    });

    renderEditorAt(
      "/account/subprofiles/sp-named/edit",
      "sp-fresh",
      true,
      queryClient,
    );

    await waitFor(() =>
      expect(
        queryClient.getQueryData(subprofileQueryKey(false, "sp-named")),
      ).toBeUndefined(),
    );
    expect(
      queryClient.getQueryData(subprofileQueryKey(false, "sp-fresh")),
    ).toEqual({ id: "sp-fresh" });
  });

  it("waits while the save is still running or a draft is unsaved", () => {
    renderEditorAt("/account/subprofiles/sp-named/edit", "sp-fresh", false);

    expect(screen.getByTestId("where")).toHaveTextContent(
      "/account/subprofiles/sp-named/edit",
    );
  });

  it("stays put when the route already names the persona", () => {
    renderEditorAt("/account/subprofiles/sp-named/edit", "sp-named", true);

    expect(screen.getByTestId("where")).toHaveTextContent(
      "/account/subprofiles/sp-named/edit",
    );
  });
});
