import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import type { ManagedListingItem } from "../marketing/listBusiness/api/managedListings.api";
import { EditRunByModal } from "./EditRunByModal";

const tour: ManagedListingItem = {
  id: "listing-uuid-1",
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  kind: "mobile",
  meetingPoint: null,
};
const notMine = {
  ref: "QPL-2026-0999",
  slug: "someone-elses",
  name: "Someone Else's Studio",
};

describe("EditRunByModal", () => {
  it("shows a business the acting organiser does not run read-only, and sends nothing", async () => {
    const onSave = vi.fn();
    render(
      <I18nProvider>
        <EditRunByModal
          initial={notMine}
          items={[tour]}
          onClose={vi.fn()}
          onSave={onSave}
        />
      </I18nProvider>,
    );
    expect(
      await screen.findByText(
        "Someone Else's Studio runs this gathering. Only someone who runs that business can change it.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("decides nothing while the managed list is still loading", async () => {
    render(
      <I18nProvider>
        <EditRunByModal
          initial={notMine}
          items={[]}
          isResolving
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(
      await screen.findByText("Someone Else's Studio"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Only someone who runs that business/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("keeps the stored business and Save off when the list resolves after opening", async () => {
    const storedTour = { ref: tour.ref, slug: tour.slug, name: tour.name };
    const renderModal = (isResolving: boolean, items: ManagedListingItem[]) => (
      <I18nProvider>
        <EditRunByModal
          initial={storedTour}
          items={items}
          isResolving={isResolving}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </I18nProvider>
    );
    const { rerender } = render(renderModal(true, []));
    rerender(renderModal(false, [tour]));
    expect(
      await screen.findByLabelText("Run by one of your businesses"),
    ).toHaveValue(tour.id);
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("lets the host clear a closed business that is gone from their managed list", async () => {
    const onSave = vi.fn().mockResolvedValue("saved");
    const onClose = vi.fn();
    render(
      <I18nProvider>
        <EditRunByModal
          initial={notMine}
          items={[tour]}
          isHost
          onClose={onClose}
          onSave={onSave}
        />
      </I18nProvider>,
    );
    const picker = await screen.findByLabelText(
      "Run by one of your businesses",
    );
    expect(picker).toHaveValue(notMine.ref);
    expect(
      screen.queryByText(/Only someone who runs that business/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    fireEvent.change(picker, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ listingId: null, listing: null }),
    );
  });

  it("keeps the editor open with the error under the picker when the server refuses", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue("refused");
    render(
      <I18nProvider>
        <EditRunByModal
          initial={null}
          items={[tour]}
          onClose={onClose}
          onSave={onSave}
        />
      </I18nProvider>,
    );
    // Pick the tour through the Select, however it renders its options (read
    // shared/components/ui/Select.tsx for the role and drive it with
    // fireEvent; a native select takes fireEvent.change with the item id).
    const picker = await screen.findByLabelText(
      "Run by one of your businesses",
    );
    fireEvent.change(picker, { target: { value: tour.id } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() =>
      expect(
        screen.getByText(
          "This business can't run this gathering. Pick another, or none.",
        ),
      ).toBeInTheDocument(),
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
