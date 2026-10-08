import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import type { ManagedListingItem } from "../../marketing/listBusiness/api/managedListings.api";
import type { GatheringForm } from "../useGatheringForm";
import { RunByField } from "./RunByField";

const managed = vi.hoisted(() => ({
  items: [] as ManagedListingItem[],
  isResolving: false,
}));
const auth = vi.hoisted(() => ({ checking: false }));
vi.mock("../../../app/providers/authContext", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/authContext")
  >()),
  useAuth: () => auth,
}));
vi.mock("../../marketing/listBusiness/api/useManagedListings", () => ({
  useManagedListings: () => managed,
}));

const tour: ManagedListingItem = {
  id: "listing-uuid-1",
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  kind: "mobile",
  meetingPoint: null,
};

/** Only the members `RunByField` reads. */
function formWith(fields: Partial<GatheringForm>): GatheringForm {
  return {
    runByListingId: null,
    setRunByListingId: vi.fn(),
    isRunByListingRefused: false,
    hood: "",
    setHood: vi.fn(),
    address: "",
    setAddress: vi.fn(),
    ...fields,
  } as unknown as GatheringForm;
}

afterEach(() => {
  managed.items = [];
  managed.isResolving = false;
  auth.checking = false;
});

describe("RunByField", () => {
  it("stays hidden for a host who runs no business", () => {
    const { container } = render(
      <I18nProvider>
        <RunByField form={formWith({})} />
      </I18nProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("says why the server refused the pick, on the field", async () => {
    managed.items = [tour];
    render(
      <I18nProvider>
        <RunByField
          form={formWith({
            runByListingId: tour.id,
            isRunByListingRefused: true,
          })}
        />
      </I18nProvider>,
    );
    expect(
      await screen.findByText(
        "This business can't run this gathering. Pick another, or none.",
      ),
    ).toBeInTheDocument();
  });

  it("drops a restored pick the host no longer runs, once the list is known", () => {
    managed.items = [tour];
    const form = formWith({ runByListingId: "listing-uuid-gone" });
    render(
      <I18nProvider>
        <RunByField form={form} />
      </I18nProvider>,
    );
    expect(form.setRunByListingId).toHaveBeenCalledWith(null);
  });

  it("keeps a restored pick while sign-in is still being checked", () => {
    managed.items = [];
    auth.checking = true;
    const form = formWith({ runByListingId: "listing-uuid-1" });
    render(
      <I18nProvider>
        <RunByField form={form} />
      </I18nProvider>,
    );
    expect(form.setRunByListingId).not.toHaveBeenCalled();
  });

  it("keeps a restored pick while the list is still loading", () => {
    managed.items = [];
    managed.isResolving = true;
    const form = formWith({ runByListingId: "listing-uuid-1" });
    render(
      <I18nProvider>
        <RunByField form={form} />
      </I18nProvider>,
    );
    expect(form.setRunByListingId).not.toHaveBeenCalled();
  });
});
