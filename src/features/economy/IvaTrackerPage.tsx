import { ToolPage } from "./tools/ToolPage";
import { useLocalStorage } from "./tools/useLocalStorage";
import { IvaTrackerForm } from "./IvaTrackerForm";
import { IvaTrackerStatus } from "./IvaTrackerStatus";
import { IVA_SEED, type IvaEntry } from "./ivaTracker.data";

/**
 * Client-side IVA threshold tracker. A freelancer logs invoiced amounts; we sum
 * them against the €15,000 art. 53.º exemption limit and persist everything in
 * localStorage. No backend — saved on this device only.
 */
export function IvaTrackerPage() {
  const [entries, setEntries] = useLocalStorage<IvaEntry[]>(
    "qp.economy.ivaEntries",
    IVA_SEED,
  );

  return (
    <ToolPage
      eyebrow="Freelance tools"
      title={
        <>
          Stay under the <em>threshold.</em>
        </>
      }
      sub="Track your invoiced income toward the €15,000 IVA-exemption limit (art. 53.º). Saved on this device only."
      form={<IvaTrackerForm entries={entries} setEntries={setEntries} />}
      preview={<IvaTrackerStatus entries={entries} />}
    />
  );
}
