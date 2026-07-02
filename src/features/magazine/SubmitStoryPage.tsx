import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { SubmitStoryForm } from "./SubmitStoryForm";
import { SubmitStorySuccess } from "./SubmitStorySuccess";

export function SubmitStoryPage() {
  const [sentTitle, setSentTitle] = useState<string | null>(null);

  if (sentTitle !== null) {
    return <SubmitStorySuccess working={sentTitle} />;
  }

  return (
    <PageShell>
      <SubmitStoryForm onSent={setSentTitle} />
    </PageShell>
  );
}
