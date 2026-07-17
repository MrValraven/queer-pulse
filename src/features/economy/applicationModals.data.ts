/** Static reasons offered when withdrawing an application. */
export const WITHDRAW_REASONS: { value: string; labelKey: string }[] = [
  {
    value: "Accepted another role",
    labelKey: "economy:withdrawReason.acceptedAnother",
  },
  { value: "No longer a fit", labelKey: "economy:withdrawReason.noLongerFit" },
  {
    value: "Pay or terms didn't work",
    labelKey: "economy:withdrawReason.payDidntWork",
  },
  {
    value: "Process took too long",
    labelKey: "economy:withdrawReason.tookTooLong",
  },
  {
    value: "Prefer not to say",
    labelKey: "economy:withdrawReason.preferNotToSay",
  },
];
