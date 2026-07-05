import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { StudioShell } from "./StudioShell";
import { StudioProgramSlate } from "./StudioProgramSlate";
import { StudioProgramInbox } from "./StudioProgramInbox";
import {
  SINGLES,
  INBOX,
  type Single,
  type Submission,
} from "./studioProgram.data";
import s from "./StudioProgramPage.module.css";

export function StudioProgramPage() {
  const { showToast } = useToast();
  const [singles, setSingles] = useState<Single[]>(SINGLES);
  const [inbox, setInbox] = useState<Submission[]>(INBOX);

  const handleSlate = (sub: Submission) => {
    setInbox((prev) => prev.filter((i) => i.id !== sub.id));
    setSingles((prev) => [
      ...prev,
      {
        id: `slated-${sub.id}`,
        image: sub.image,
        tint: sub.tint,
        titlePre: sub.titlePre,
        titleEm: sub.titleEm,
        who: sub.who,
        note: "",
      },
    ]);
    showToast("Added to this week's slate", "success");
  };

  const handlePass = (id: string) => {
    setInbox((prev) => prev.filter((i) => i.id !== id));
    showToast("Passed — the writer can resubmit later", "info");
  };

  const handleListen = () => showToast("Playing preview…", "info");

  const handleNoteChange = (id: string, note: string) =>
    setSingles((prev) => prev.map((t) => (t.id === id ? { ...t, note } : t)));

  const handleRemoveSingle = (id: string) =>
    setSingles((prev) => prev.filter((t) => t.id !== id));

  return (
    <StudioShell>
      <div className={s.wrap}>
        <header className={s.prH}>
          <div className={s.prHMain}>
            <div className={s.eb}>
              Programming the room · Monday morning · drag anything below
            </div>
            <h1>
              Week <em>24</em> · 15 — 21 June
            </h1>
            <div className={s.sub}>
              Build the slate of the week:{" "}
              <em>one cover, 12 — 16 tracks, 2 — 3 collections, broadcasts</em>.
              Press publish at noon and the homepage rotates.
            </div>
          </div>
          <div className={s.prHSide}>
            <div className={s.autosave}>
              <span className={s.pulseDot} aria-hidden />
              Auto-saved · 11:42 — every keystroke
            </div>
            <Button
              variant="ghost-dark"
              onClick={() => showToast("Opening the room preview…", "info")}
            >
              Preview the room
            </Button>
          </div>
        </header>

        <div className={s.prBody}>
          <StudioProgramSlate
            singles={singles}
            onNoteChange={handleNoteChange}
            onRemove={handleRemoveSingle}
            onSwap={() => showToast("Choose a new cover artist…", "info")}
            onEditNote={() => showToast("Editing the cover note…", "info")}
          />
          <StudioProgramInbox
            inbox={inbox}
            onSlate={handleSlate}
            onPass={handlePass}
            onListen={handleListen}
          />
        </div>

        <div className={s.publishBar}>
          <div className={s.publishStatus}>
            Slate is <em>87% complete</em> · publishes{" "}
            <span>Mon 15 Jun, 12:00 Lisbon</span> · auto-rotates the homepage
          </div>
          <div className={s.publishActions}>
            <Button
              variant="ghost-dark"
              onClick={() => showToast("Opening homepage preview…", "info")}
            >
              Preview homepage
            </Button>
            <Button
              variant="ghost-dark"
              onClick={() => showToast("Draft saved", "success")}
            >
              Save draft
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                showToast(
                  "Slate published — homepage rotates at noon",
                  "success",
                )
              }
            >
              Publish at noon
            </Button>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
