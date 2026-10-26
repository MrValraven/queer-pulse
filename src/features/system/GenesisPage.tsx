import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { inviteLink } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Button, Collapse } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  claimGenesisAdmin,
  getGenesisStatus,
  mintGenesisInvite,
  type GenesisStatusDTO,
} from "../../shared/api/genesis.api";
import styles from "./GenesisPage.module.css";

type Outcome =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "rejected" }
  | { kind: "rateLimited" }
  | { kind: "failed"; reason?: string }
  | { kind: "claimed" }
  | { kind: "demo" };

/** What the page body shows, decided by the status check (or demo mode). */
type GenesisView = "loading" | "open" | "closed" | "statusFailed";

const GENESIS_STATUS_QUERY_KEY = ["genesis", "status"] as const;
const CLOSED_STATUS: GenesisStatusDTO = { open: false };

/** The `code` a genesis refusal carries in its body, when it has one. */
function genesisErrorCode(error: ApiError): string | undefined {
  const body = error.data;
  if (typeof body !== "object" || body === null) return undefined;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

/** A 404, or a 403 coded `genesis_closed`: genesis was already used or is off. */
function isGenesisClosedError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 404) return true;
  return error.status === 403 && genesisErrorCode(error) === "genesis_closed";
}

function isRateLimitedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}

/**
 * The status check. A 404 is the module's long-standing "closed" answer, so it
 * reads as closed here too and never as a failed check.
 */
async function fetchGenesisStatus(): Promise<GenesisStatusDTO> {
  try {
    return await getGenesisStatus();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return CLOSED_STATUS;
    throw error;
  }
}

/**
 * One-time platform bootstrap. See `src/genesis/` in the backend.
 *
 * Deliberately thin. It mints a code and hands straight off to
 * `/auth/invite/:code`, so the founder joins through the SAME landing page,
 * age gate, Google sign-in and onboarding as every other member. Reimplementing
 * any of that here would mean the founder's account was created by a path
 * nobody else ever exercises.
 *
 * Public, and safe to be: the minted invite is pinned to GENESIS_EMAIL, so a
 * stranger who finds this page can only mint an invite they cannot redeem.
 *
 * Status check: before offering any action the page asks the public
 * `GET /genesis/status` whether genesis is still open. While that answer is on
 * its way the card shows only its heading. Once genesis has been used (claimed,
 * an admin already exists, or the server has it switched off) the page says so
 * and offers no button. A claim or mint that comes back closed (404, or a 403
 * coded `genesis_closed`) writes the same closed answer into the query cache, as
 * does a successful claim, so the page never offers genesis twice. A failed
 * check names itself and offers no button either.
 *
 * Its copy routes through `useTranslation()` / `system:genesis.*` keys like
 * its neighbours (see `docs/i18n/extraction-brief.md`), even though it's
 * seen by exactly one person on exactly one occasion. Deleting the page
 * later also means deleting the `genesis.*` catalog entries, a small
 * cleanup either way.
 *
 * Delete this file, its styles, its test, the route entry and the backend
 * `src/genesis/` module once the founder account exists.
 *
 * Demo mode: this is a one-shot, security-sensitive bootstrap flow, so a fake
 * "success" here would actively mislead. The
 * status check is skipped, the buttons show, and both handlers short-circuit
 * before touching the network and show a plain "not available in demo mode"
 * notice; nothing is minted or claimed.
 */
export function GenesisPage() {
  const { t } = useTranslation();
  const { loggedIn, refresh } = useAuth();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const statusQuery = useQuery({
    queryKey: GENESIS_STATUS_QUERY_KEY,
    queryFn: fetchGenesisStatus,
    enabled: !demoMode,
    // The page names a failed check itself, so the app-wide toast stays quiet.
    meta: { silentError: true },
  });

  const markClosed = () =>
    queryClient.setQueryData(GENESIS_STATUS_QUERY_KEY, CLOSED_STATUS);

  let view: GenesisView = "loading";
  if (demoMode) view = "open";
  else if (statusQuery.data) view = statusQuery.data.open ? "open" : "closed";
  else if (statusQuery.isError) view = "statusFailed";

  const handleGenerate = async () => {
    if (demoMode) {
      setOutcome({ kind: "demo" });
      return;
    }
    setOutcome({ kind: "working" });
    try {
      const invite = await mintGenesisInvite();
      void navigate(inviteLink(invite.code));
    } catch (error) {
      // A closed answer is the designed "already used, or the kill switch is
      // off" reply, so it swaps in the closed view with no button.
      if (isGenesisClosedError(error)) {
        markClosed();
        setOutcome({ kind: "idle" });
      } else if (isRateLimitedError(error)) {
        setOutcome({ kind: "rateLimited" });
      } else {
        setOutcome({ kind: "failed", reason: reasonFor(error) ?? undefined });
      }
    }
  };

  const handleClaim = async () => {
    if (demoMode) {
      setOutcome({ kind: "demo" });
      return;
    }
    setOutcome({ kind: "working" });
    try {
      await claimGenesisAdmin();
      markClosed();
      // The access token embeds `role` at mint time, so the token in hand still
      // says `member`. Refresh reloads the user from Postgres and re-mints.
      await refresh();
      setOutcome({ kind: "claimed" });
    } catch (error) {
      if (isGenesisClosedError(error)) {
        markClosed();
        setOutcome({ kind: "idle" });
      } else if (isRateLimitedError(error)) {
        setOutcome({ kind: "rateLimited" });
      } else if (error instanceof ApiError && error.status === 403) {
        // `genesis_not_founder_account`, or an older body with no code.
        setOutcome({ kind: "rejected" });
      } else {
        setOutcome({ kind: "failed", reason: reasonFor(error) ?? undefined });
      }
    }
  };

  const isWorking = outcome.kind === "working";

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.eyebrow}>{t("system:genesis.eyebrow")}</div>
        <h1 className={styles.heading}>{t("system:genesis.heading")}</h1>

        <div className={styles.body}>
          <Collapse isOpen={view === "open"}>
            {loggedIn ? (
              <>
                <p className={styles.lead}>
                  {t("system:genesis.loggedIn.lead")}
                </p>
                <Button onClick={() => void handleClaim()} disabled={isWorking}>
                  {t("system:genesis.loggedIn.claimCta")}
                </Button>
              </>
            ) : (
              <>
                <p className={styles.lead}>
                  {t("system:genesis.loggedOut.lead")}
                </p>
                <Button
                  onClick={() => void handleGenerate()}
                  disabled={isWorking}
                >
                  {t("system:genesis.loggedOut.generateCta")}
                </Button>
              </>
            )}
          </Collapse>
          <Collapse isOpen={view === "closed"}>
            <p className={styles.settledLead}>
              {t("system:genesis.closed.lead")}
            </p>
          </Collapse>
          <Collapse isOpen={view === "statusFailed"}>
            <p className={styles.settledLead} role="alert">
              {t("system:genesis.notice.statusFailed")}
            </p>
          </Collapse>
        </div>

        <GenesisNotices outcome={outcome} />
      </div>
    </SystemStateShell>
  );
}

/** The outcome notices, each folding in and out on its own. */
function GenesisNotices({ outcome }: { outcome: Outcome }) {
  const { t } = useTranslation();
  const failedText =
    outcome.kind === "failed"
      ? (outcome.reason ?? t("system:genesis.notice.failedFallback"))
      : null;
  const notices: Array<{ kind: Outcome["kind"]; text: string | null }> = [
    { kind: "rejected", text: t("system:genesis.notice.rejected") },
    { kind: "rateLimited", text: t("system:genesis.notice.rateLimited") },
    { kind: "failed", text: failedText },
    { kind: "claimed", text: t("system:genesis.notice.claimed") },
    { kind: "demo", text: t("system:genesis.notice.demo") },
  ];
  return (
    <>
      {notices.map((notice) => (
        <Collapse key={notice.kind} isOpen={outcome.kind === notice.kind}>
          <p className={styles.notice}>{notice.text}</p>
        </Collapse>
      ))}
    </>
  );
}
