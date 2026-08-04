import { ToolPage } from "./tools/ToolPage";
import { useLocalStorage } from "./tools/useLocalStorage";
import { IvaTrackerForm } from "./IvaTrackerForm";
import { IvaTrackerStatus } from "./IvaTrackerStatus";
import { IVA_SEED, type IvaEntry } from "./ivaTracker.data";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Client-side IVA threshold tracker. A freelancer logs invoiced amounts; we sum
 * them against the €15,000 art. 53.º exemption limit and persist everything in
 * localStorage. No backend — saved on this device only.
 */
export function IvaTrackerPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // The IVA_SEED is demo-only fiction (its running total reads as a real, in-
  // progress year). In live mode the tracker starts empty so it only ever holds
  // amounts the member actually enters on this device.
  const [entries, setEntries] = useLocalStorage<IvaEntry[]>(
    "qp.economy.ivaEntries",
    demoMode ? IVA_SEED : [],
  );

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowFreelance")}
      title={
        <Translation
          i18nKey="economy:ivaTracker.title"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("economy:ivaTracker.sub")}
      form={<IvaTrackerForm entries={entries} setEntries={setEntries} />}
      preview={<IvaTrackerStatus entries={entries} />}
    />
  );
}
