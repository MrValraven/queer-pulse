import { useState } from "react";
import { Button, ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { FundingEndReason } from "./funding.types";

export function FundingAskEndControls({
  onEnd,
  isPending,
  canMarkGoalReached = true,
}: {
  onEnd: (reason: FundingEndReason) => void;
  isPending: boolean;
  /** Only a live fundraiser can have reached its goal; one still waiting
   *  for review can only be closed. */
  canMarkGoalReached?: boolean;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<FundingEndReason | null>(null);
  const isGoal = confirming === "goal_reached";
  return (
    <>
      {canMarkGoalReached && (
        // Ghost: cream type on the jade fill reads below AA at this size.
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => setConfirming("goal_reached")}
        >
          {t("forum:funding.ask.markGoalReached")}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => setConfirming("closed")}
      >
        {t("forum:funding.ask.close")}
      </Button>
      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          if (confirming) onEnd(confirming);
          setConfirming(null);
        }}
        title={t(
          isGoal
            ? "forum:funding.ask.confirmGoalTitle"
            : "forum:funding.ask.confirmCloseTitle",
        )}
        description={t("forum:funding.ask.confirmBody")}
        confirmLabel={t(
          isGoal
            ? "forum:funding.ask.confirmGoal"
            : "forum:funding.ask.confirmClose",
        )}
        tone={isGoal ? "positive" : "destructive"}
        loading={isPending}
      />
    </>
  );
}
