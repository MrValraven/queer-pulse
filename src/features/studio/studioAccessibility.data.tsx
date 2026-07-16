import type { ReactNode } from "react";
import {
  FiMessageSquare,
  FiAlignLeft,
  FiActivity,
  FiCheck,
  FiGlobe,
  FiList,
  FiEye,
  FiVolume2,
  FiPause,
} from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Content for the Studio Accessibility page. Platform-authored chrome (never
 * fetched — see `docs/i18n/extraction-brief.md` §1). Pattern B:
 * `buildGroups(t)` / `buildShortcuts(t)` are memoized in the consumer.
 */

export type ItemStatus = "live" | "soon";

export interface AccessItem {
  icon: ReactNode;
  heading: ReactNode;
  body: ReactNode;
  status: ItemStatus;
}

export interface AccessGroup {
  heading: ReactNode;
  dek: string;
  items: AccessItem[];
}

export function buildGroups(t: TFunction): AccessGroup[] {
  return [
    {
      heading: (
        <Translation i18nKey="studio:accessibility.group.deaf.heading" components={{ em: <em /> }} />
      ),
      dek: t("studio:accessibility.group.deaf.dek"),
      items: [
        {
          icon: <FiMessageSquare />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.captions.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.captions.body" components={{ em: <em /> }} />,
          status: "live",
        },
        {
          icon: <FiAlignLeft />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.lyrics.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.lyrics.body" components={{ em: <em /> }} />,
          status: "live",
        },
        {
          icon: <FiActivity />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.waveforms.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.waveforms.body" components={{ em: <em /> }} />,
          status: "live",
        },
        {
          icon: <FiCheck />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.signed.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.signed.body" components={{ em: <em /> }} />,
          status: "soon",
        },
      ],
    },
    {
      heading: (
        <Translation i18nKey="studio:accessibility.group.language.heading" components={{ em: <em /> }} />
      ),
      dek: t("studio:accessibility.group.language.dek"),
      items: [
        {
          icon: <FiGlobe />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.translation.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.translation.body" components={{ em: <em /> }} />,
          status: "live",
        },
        {
          icon: <FiList />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.interfaceLang.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.interfaceLang.body" components={{ em: <em /> }} />,
          status: "live",
        },
      ],
    },
    {
      heading: (
        <Translation i18nKey="studio:accessibility.group.lowVision.heading" components={{ em: <em /> }} />
      ),
      dek: t("studio:accessibility.group.lowVision.dek"),
      items: [
        {
          icon: <FiEye />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.contrast.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.contrast.body" components={{ em: <em /> }} />,
          status: "live",
        },
        {
          icon: <FiVolume2 />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.screenReader.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.screenReader.body" components={{ em: <em /> }} />,
          status: "live",
        },
        {
          icon: <FiPause />,
          heading: (
            <Translation i18nKey="studio:accessibility.item.reducedMotion.heading" components={{ em: <em /> }} />
          ),
          body: <Translation i18nKey="studio:accessibility.item.reducedMotion.body" components={{ em: <em /> }} />,
          status: "live",
        },
      ],
    },
  ];
}

export interface ShortcutRow {
  heading: ReactNode;
  keys: string[];
}

export function buildShortcuts(t: TFunction): ShortcutRow[] {
  return [
    {
      heading: <Translation i18nKey="studio:accessibility.shortcut.playPause" components={{ em: <em /> }} />,
      keys: [t("studio:accessibility.key.space")],
    },
    {
      heading: <Translation i18nKey="studio:accessibility.shortcut.prevNext" components={{ em: <em /> }} />,
      keys: ["←", "→"],
    },
    {
      heading: <Translation i18nKey="studio:accessibility.shortcut.volume" components={{ em: <em /> }} />,
      keys: ["↑", "↓"],
    },
    {
      heading: t("studio:accessibility.shortcut.tip"),
      keys: ["T"],
    },
    {
      heading: t("studio:accessibility.shortcut.save"),
      keys: ["S"],
    },
    {
      heading: <Translation i18nKey="studio:accessibility.shortcut.captions" components={{ em: <em /> }} />,
      keys: ["C"],
    },
    {
      heading: t("studio:accessibility.shortcut.search"),
      keys: ["/"],
    },
  ];
}
