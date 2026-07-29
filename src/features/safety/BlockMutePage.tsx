import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { routes } from "../../app/routeMap";
import type { BlockMuteState, MuteDurationId } from "./blockMute.data";
import {
  BlockMuteBlocked,
  BlockMuteChoose,
  BlockMuteMuted,
} from "./BlockMuteScreens";
import s from "./flows.module.css";

export function BlockMutePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<BlockMuteState>("choose");
  const [chosen, setChosen] = useState<"mute" | "block" | null>(null);
  const [muteDur, setMuteDur] = useState<MuteDurationId>("untilUnmute");
  const pageTitle = t("safety:blockMute.meta.title");
  const pageDescription = t("safety:blockMute.meta.description");

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.blockMute },
        ])}
      />
      <div className={s.page}>
        {state === "choose" && (
          <BlockMuteChoose
            chosen={chosen}
            onChoose={setChosen}
            muteDur={muteDur}
            onMuteDur={setMuteDur}
            onContinue={() => setState(chosen === "mute" ? "muted" : "blocked")}
            onCancel={() => void navigate(-1)}
          />
        )}

        {state === "muted" && (
          <BlockMuteMuted muteDur={muteDur} onUndo={() => setState("choose")} />
        )}

        {state === "blocked" && (
          <BlockMuteBlocked onUndo={() => setState("choose")} />
        )}
      </div>
      <Footer />
    </>
  );
}
