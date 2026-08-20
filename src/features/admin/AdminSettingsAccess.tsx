import { useEffect, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useUpdatePlatformSettings,
} from "./api/usePlatformSettings";
import type {
  PlatformSettingsDTO,
  UpdatePlatformSettingsInput,
} from "./api/platformSettings.api";
import { AdminSettingsAccessCards } from "./AdminSettingsAccessCards";
import styles from "./AdminSettingsPage.module.css";

/**
 * The three kill switches.
 *
 * The two registration switches save immediately on toggle — reversible, low
 * impact. Lockdown routes through a confirmation modal instead: enabling it
 * blocks every member at once, which should not be a stray click on a switch.
 *
 * Messages are held in local draft state and committed on blur, so typing does
 * not fire a request per keystroke. Every mutation reverts the draft to server
 * truth on failure rather than leaving the UI asserting something that did not
 * happen — on these controls specifically, a switch that *looks* flipped but
 * is not is worse than a visible error.
 */
export function AdminSettingsAccess({
  settings,
  isLoading,
  isError,
}: {
  settings: PlatformSettingsDTO | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdatePlatformSettings();
  const [confirming, setConfirming] = useState<"enable" | "disable" | null>(
    null,
  );
  const [lockdownMsg, setLockdownMsg] = useState("");
  const [closedMsg, setClosedMsg] = useState("");
  // A single optional note, attached to whichever change is saved next, then
  // cleared — it explains that one change, not a running log for the tab.
  const [note, setNote] = useState("");

  // Every successful (and, since onSettled invalidates unconditionally, every
  // failed) mutation invalidates the settings query, and invalidateQueries
  // refetches active observers regardless of staleTime — so a live-mode
  // refetch hands back a freshly parsed `settings` object with a new identity
  // even when every field is byte-for-byte the same. Depending on the object
  // itself made the re-seed effect below fire on identity alone, wiping
  // whatever the admin was mid-typing. Depend on the primitive string values
  // instead: an identity-only refetch no longer changes the dependency, so
  // React skips the effect entirely.
  const serverLockdownMsg = settings?.lockdownMessage ?? "";
  const serverClosedMsg = settings?.registrationClosedMessage ?? "";

  // That alone isn't enough for the case where the server value *genuinely*
  // changes while the admin is mid-edit (e.g. click a preset — which blurs
  // the other field and commits it — then the resulting refetch resolves).
  // Each ref remembers the value we last seeded into its draft; the effect
  // only overwrites the draft if it still equals that last-seeded value,
  // i.e. the admin hasn't touched it since. `null` means "not seeded yet",
  // so the very first run always seeds regardless of the draft's initial
  // "" state. Do not collapse this back to depending on `settings` or to an
  // unconditional overwrite — both of those are exactly the two bugs this
  // guards against (see AdminSettingsAccess.test.tsx for the regressions).
  const lastSeededLockdownMsg = useRef<string | null>(null);
  const lastSeededClosedMsg = useRef<string | null>(null);

  useEffect(() => {
    setLockdownMsg((current) =>
      lastSeededLockdownMsg.current === null ||
      current === lastSeededLockdownMsg.current
        ? serverLockdownMsg
        : current,
    );
    lastSeededLockdownMsg.current = serverLockdownMsg;
  }, [serverLockdownMsg]);

  useEffect(() => {
    setClosedMsg((current) =>
      lastSeededClosedMsg.current === null ||
      current === lastSeededClosedMsg.current
        ? serverClosedMsg
        : current,
    );
    lastSeededClosedMsg.current = serverClosedMsg;
  }, [serverClosedMsg]);

  // Read via a ref rather than closing over the `settings` prop directly:
  // `save` closes over whatever `settings` was at the render where it was
  // invoked, and a slow failure can resolve after `settings` has since moved
  // on (e.g. another admin's change landed). The revert below wants *current*
  // server truth, not the snapshot from the render that fired the request —
  // reverting to that stale snapshot would clobber the other admin's change.
  // Synced from its own dependency-array-less effect so it is never written
  // during render (per `react-hooks/refs`), which still leaves it holding the
  // latest value by the time any onError callback can run.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  function save(input: UpdatePlatformSettingsInput) {
    const trimmedNote = note.trim();
    update.mutate(trimmedNote ? { ...input, note: trimmedNote } : input, {
      onSuccess: () => {
        // The note explained this specific change — clear it so it isn't
        // accidentally reattached to the next, unrelated one.
        if (trimmedNote) setNote("");
      },
      onError: () => {
        showToast(t("admin:settings.saveError"), "error");
        // onSettled invalidates unconditionally, but a failed save leaves the
        // server value unchanged — so the refetch it triggers hands back the
        // same primitive, the effects above don't re-fire, and a message
        // draft the admin was mid-editing (never part of this failed
        // request) would otherwise never get reverted. Revert by hand here,
        // but only the field(s) this request actually touched — reverting
        // both would discard unrelated typing in the other box, which was
        // never part of this failed request.
        const latest = settingsRef.current;
        if (!latest) return;
        if ("lockdownMessage" in input) {
          const reverted = latest.lockdownMessage ?? "";
          setLockdownMsg(reverted);
          lastSeededLockdownMsg.current = reverted;
        }
        if ("registrationClosedMessage" in input) {
          const reverted = latest.registrationClosedMessage ?? "";
          setClosedMsg(reverted);
          lastSeededClosedMsg.current = reverted;
        }
      },
    });
  }

  if (isLoading) return <div className={styles.loading} aria-busy="true" />;
  if (isError || !settings)
    return <p className={styles.error}>{t("admin:settings.saveError")}</p>;

  return (
    <AdminSettingsAccessCards
      settings={settings}
      save={save}
      closedMessage={closedMsg}
      setClosedMessage={setClosedMsg}
      lockdownMessage={lockdownMsg}
      setLockdownMessage={setLockdownMsg}
      note={note}
      setNote={setNote}
      confirming={confirming}
      setConfirming={setConfirming}
    />
  );
}
