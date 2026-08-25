import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

/**
 * A local text/date draft that starts out mirroring a server value, stays
 * fully editable, and re-seeds itself when the server value *genuinely*
 * changes underneath it — without clobbering an admin's in-progress edit.
 *
 * The naive version (`useState(serverValue)` seeded once, or a plain
 * `useEffect(() => setDraft(serverValue), [serverValue])`) breaks two ways on
 * this page's settings form:
 *
 * 1. A successful mutation invalidates the query, and `invalidateQueries`
 *    refetches active observers regardless of `staleTime` — so a live-mode
 *    refetch hands back a freshly parsed object with a new identity even when
 *    every field is byte-for-byte the same. An effect keyed on that object's
 *    identity would re-fire and wipe whatever the admin is mid-typing in an
 *    unrelated field.
 * 2. Keying the effect on the primitive `serverValue` instead fixes #1, but
 *    then can't tell "the value hasn't changed" apart from "the value just
 *    changed back to what it started as, but the admin already edited it and
 *    should keep their edit" — both look identical to a plain `[serverValue]`
 *    dependency.
 *
 * The `lastSeeded` ref breaks the tie: the effect only overwrites the draft
 * when the draft still equals whatever was last seeded into it, i.e. the
 * admin hasn't touched it since. `null` means "not seeded yet", so the very
 * first run always seeds regardless of the draft's initial `""` state.
 *
 * The returned ref is exposed so a mutation's `onError` handler can revert
 * the draft (and keep the ref in sync) on a failed save — see
 * `AdminSettingsAccess.save`'s revert branches.
 */
export function useSeededDraft(
  serverValue: string,
): [
  string,
  Dispatch<SetStateAction<string>>,
  React.MutableRefObject<string | null>,
] {
  const [draft, setDraft] = useState("");
  const lastSeeded = useRef<string | null>(null);

  useEffect(() => {
    setDraft((current) =>
      lastSeeded.current === null || current === lastSeeded.current
        ? serverValue
        : current,
    );
    lastSeeded.current = serverValue;
  }, [serverValue]);

  return [draft, setDraft, lastSeeded];
}
