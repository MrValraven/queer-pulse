import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
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
    showToast(t("studio:program.toast.addedToSlate"), "success");
  };

  const handlePass = (id: string) => {
    setInbox((prev) => prev.filter((i) => i.id !== id));
    showToast(t("studio:program.toast.passed"), "info");
  };

  const handleListen = () =>
    showToast(t("studio:program.toast.playingPreview"), "info");

  const handleNoteChange = (id: string, note: string) =>
    setSingles((prev) =>
      prev.map((single) => (single.id === id ? { ...single, note } : single)),
    );

  const handleRemoveSingle = (id: string) =>
    setSingles((prev) => prev.filter((single) => single.id !== id));

  return (
    <StudioShell>
      <div className={s.wrap}>
        <header className={s.prH}>
          <div className={s.prHMain}>
            <div className={s.eb}>{t("studio:program.header.eyebrow")}</div>
            <h1>
              <Translation
                i18nKey="studio:program.header.title"
                components={{ em: <em /> }}
                values={{ weekNumber: 24, dateRange: "15 to 21 June" }}
              />
            </h1>
            <div className={s.sub}>
              <Translation
                i18nKey="studio:program.header.sub"
                components={{ em: <em /> }}
              />
            </div>
          </div>
          <div className={s.prHSide}>
            <div className={s.autosave}>
              <span className={s.pulseDot} aria-hidden />
              {t("studio:program.header.autosave", { time: "11:42" })}
            </div>
            <Button
              variant="ghost-dark"
              onClick={() =>
                showToast(t("studio:program.toast.openingRoomPreview"), "info")
              }
            >
              {t("studio:program.header.previewRoomCta")}
            </Button>
          </div>
        </header>

        <div className={s.prBody}>
          <StudioProgramSlate
            singles={singles}
            onNoteChange={handleNoteChange}
            onRemove={handleRemoveSingle}
            onSwap={() =>
              showToast(t("studio:program.toast.chooseNewCover"), "info")
            }
            onEditNote={() =>
              showToast(t("studio:program.toast.editingCoverNote"), "info")
            }
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
            <Translation
              i18nKey="studio:program.publishBar.status"
              components={{ em: <em /> }}
              values={{ percent: 87, publishDate: "Mon 15 Jun, 12:00 Lisbon" }}
            />
          </div>
          <div className={s.publishActions}>
            <Button
              variant="ghost-dark"
              onClick={() =>
                showToast(
                  t("studio:program.toast.openingHomepagePreview"),
                  "info",
                )
              }
            >
              {t("studio:program.publishBar.previewHomepageCta")}
            </Button>
            <Button
              variant="ghost-dark"
              onClick={() =>
                showToast(t("studio:program.toast.draftSaved"), "success")
              }
            >
              {t("studio:program.publishBar.saveDraftCta")}
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                showToast(t("studio:program.toast.published"), "success")
              }
            >
              {t("studio:program.publishBar.publishCta")}
            </Button>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
