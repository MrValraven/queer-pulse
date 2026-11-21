import type { CommunityForm } from "./useCommunityForm";
import { useQuickOpenPrefill } from "./useQuickOpenPrefill";
import { QuickStartAccessChoice } from "./QuickStartAccessChoice";
import { QuickStartSharedValues } from "./QuickStartSharedValues";
import {
  ConfirmConsent,
  ConfirmHandleField,
} from "./StartCommunityConfirmFields";

/** Quick step three: who can find it, its address, the shared values and the consent. */
export function QuickStepOpen({
  form,
  handleError,
  onHandleChange,
}: {
  form: CommunityForm;
  /** The handle-taken line the page sets after a 409 on create. */
  handleError: string | null;
  /** Clears that line as soon as the founder edits the handle. */
  onHandleChange: () => void;
}) {
  useQuickOpenPrefill(form);
  const { draft, set } = form;
  return (
    <div>
      <QuickStartAccessChoice
        value={draft.accessTier}
        onChange={(accessTier) => set({ accessTier })}
      />
      <ConfirmHandleField
        value={draft.handle}
        error={handleError}
        isPrefixStacked
        onChange={(handle) => {
          onHandleChange();
          set({ handle });
        }}
      />
      <QuickStartSharedValues rules={draft.rules} />
      <ConfirmConsent
        isConsented={draft.consent}
        onToggle={() => set({ consent: !draft.consent })}
      />
    </div>
  );
}
