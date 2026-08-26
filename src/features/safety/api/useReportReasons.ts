import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  REASON_LABEL_KEYS,
  SUBJECT_REASONS,
  type ReasonCode,
  type ReportSubjectType,
} from "../reportReasons";
import { fetchReportReasons } from "./reports.api";

/**
 * The reason options one report form should offer, from the server when it can
 * and from the local taxonomy when it cannot.
 *
 * ## Why this exists
 *
 * `SUBJECT_REASONS` is a hand-maintained mirror of the backend's
 * `reason-catalogue.ts`. When the two drifted, `listing_public_question` was
 * rendered with the REVIEW list, which carries neither `outing` nor `doxxing`,
 * the only two codes that derive emergency severity. A member outed in a
 * public question could file it only as "Something else", at a seven-day SLA
 * instead of a one-hour one. Nothing failed, nothing logged, and the compiler
 * was satisfied throughout. Asking the server is what stops a catalogue edit
 * becoming that again.
 *
 * ## Why it fails safe
 *
 * Someone reaching for a report button is often in a bad moment, so the form
 * has to work when the network does not:
 *
 *  - The local list renders IMMEDIATELY, on first paint. There is never a
 *    spinner where the reasons should be, and never an empty radio group.
 *  - A failed fetch shows no error and changes nothing. The member files their
 *    report from the local list and never learns anything went wrong.
 *  - The server list replaces the local one only once it actually arrives and
 *    is non-empty.
 *
 * ## Why the labels are local
 *
 * The endpoint returns `{ code, label }`, and the labels come from the
 * backend's own `REASON_LABELS`, which is English with no localization. Taking
 * them verbatim would put English reasons in front of a Portuguese member on
 * every surface, which is a regression the moment this hook is wired in. So a
 * code the frontend knows renders the LOCAL translated label, and the server's
 * text is used only for a code the frontend has never heard of, where English
 * beats hiding the option entirely. The server owns WHICH codes are offered
 * and in what order; this app owns how they read.
 */

export interface ReportReasonOption {
  /** Server-owned stable code. `string`, because the server may know one this
   *  build does not, and that is the case this hook exists to survive. */
  code: string;
  /** Ready to render: translated where we can, the server's English where we
   *  cannot. */
  label: string;
}

/** Near-static: the catalogue changes when the backend ships, not during a
 *  session. Matches `useTherapistPersonas`/`useSubprofileDirectory`, so the
 *  same subject type opened twice never refetches. */
const REASONS_STALE_TIME = Infinity;

function isKnownReasonCode(code: string): code is ReasonCode {
  return Object.prototype.hasOwnProperty.call(REASON_LABEL_KEYS, code);
}

export function useReportReasons(
  subjectType: ReportSubjectType,
): ReportReasonOption[] {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  const localOptions = useMemo(
    () =>
      SUBJECT_REASONS[subjectType].map((code) => ({
        code,
        label: t(REASON_LABEL_KEYS[code]),
      })),
    [subjectType, t],
  );

  const { data } = useQuery({
    queryKey: ["report-reasons", subjectType],
    queryFn: () => fetchReportReasons(subjectType),
    // Demo mode has no backend, and the local taxonomy IS the demo fixture.
    enabled: !demoMode,
    staleTime: REASONS_STALE_TIME,
    // A refusal here is never shown, so retrying buys nothing a member sees
    // and only delays the form settling.
    retry: false,
    // The form already renders the local list, so a failure must stay quiet.
    meta: { silentError: true },
  });

  return useMemo(() => {
    if (!data || data.length === 0) return localOptions;
    return data.map((option) => ({
      code: option.code,
      label: isKnownReasonCode(option.code)
        ? t(REASON_LABEL_KEYS[option.code])
        : option.label,
    }));
  }, [data, localOptions, t]);
}

/**
 * A chosen option's code, on its way back to the server that supplied it.
 *
 * The cast is the one unsafe step in this path, and it is deliberate: the code
 * came FROM `GET /reports/reasons`, so the server already accepts it, but this
 * build's `ReasonCode` union cannot always name it. Keeping
 * `CreateReportInput.reasonCode` typed as the union means a HARDCODED code at
 * any other call site is still checked; this is the single documented,
 * greppable exception, for values that only ever originate server-side.
 */
export function asReasonCode(code: string): ReasonCode {
  return code as ReasonCode;
}
