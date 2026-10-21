import type { ReactNode } from "react";
import {
  FiMessageSquare,
  FiAlignLeft,
  FiActivity,
  FiGlobe,
  FiList,
  FiVolume2,
  FiPause,
  FiMoon,
  FiSkipForward,
  FiSliders,
} from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Content for the Studio Accessibility page. Platform-authored chrome (never
 * fetched — see `docs/i18n/extraction-brief.md` §1). Pattern B:
 * `buildGroups(t)` is memoized in the consumer.
 */

export type ItemStatus = "live" | "soon" | "notYet";

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
        <Translation
          i18nKey="studio:accessibility.group.deaf.heading"
          components={{ em: <em /> }}
        />
      ),
      dek: t("studio:accessibility.group.deaf.dek"),
      items: [
        {
          icon: <FiAlignLeft />,
          heading: (
            <Translation
              i18nKey="studio:accessibility.item.lyrics.heading"
              components={{ em: <em /> }}
            />
          ),
          body: (
            <Translation
              i18nKey="studio:accessibility.item.lyrics.body"
              components={{ em: <em /> }}
            />
          ),
          status: "live",
        },
        {
          icon: <FiActivity />,
          heading: (
            <Translation
              i18nKey="studio:accessibility.item.waveforms.heading"
              components={{ em: <em /> }}
            />
          ),
          body: (
            <Translation
              i18nKey="studio:accessibility.item.waveforms.body"
              components={{ em: <em /> }}
            />
          ),
          status: "live",
        },
      ],
    },
    {
      heading: (
        <Translation
          i18nKey="studio:accessibility.group.language.heading"
          components={{ em: <em /> }}
        />
      ),
      dek: t("studio:accessibility.group.language.dek"),
      items: [
        {
          icon: <FiList />,
          heading: (
            <Translation
              i18nKey="studio:accessibility.item.interfaceLang.heading"
              components={{ em: <em /> }}
            />
          ),
          body: (
            <Translation
              i18nKey="studio:accessibility.item.interfaceLang.body"
              components={{ em: <em /> }}
            />
          ),
          status: "live",
        },
      ],
    },
    {
      heading: (
        <Translation
          i18nKey="studio:accessibility.group.lowVision.heading"
          components={{ em: <em /> }}
        />
      ),
      dek: t("studio:accessibility.group.lowVision.dek"),
      items: [
        {
          icon: <FiPause />,
          heading: (
            <Translation
              i18nKey="studio:accessibility.item.reducedMotion.heading"
              components={{ em: <em /> }}
            />
          ),
          body: (
            <Translation
              i18nKey="studio:accessibility.item.reducedMotion.body"
              components={{ em: <em /> }}
            />
          ),
          status: "live",
        },
      ],
    },
  ];
}

// ── Studio open pages: what works today (spec section 3.5) ────────────────

const liveItem = (
  id: string,
  icon: ReactNode,
  status: ItemStatus = "live",
): AccessItem => ({
  icon,
  heading: (
    <Translation
      i18nKey={`studio:accessibilityLive.item.${id}.heading`}
      components={{ em: <em /> }}
    />
  ),
  body: <Translation i18nKey={`studio:accessibilityLive.item.${id}.body`} />,
  status,
});

const liveGroup = (
  id: string,
  t: TFunction,
  items: AccessItem[],
): AccessGroup => ({
  heading: (
    <Translation
      i18nKey={`studio:accessibilityLive.group.${id}.heading`}
      components={{ em: <em /> }}
    />
  ),
  dek: t(`studio:accessibilityLive.group.${id}.dek`),
  items,
});

/** Only what exists: Media Session keys, the keyboard seek slider, labelled
 *  controls with a live region, reduced motion, both themes, two languages,
 *  lyrics as text, and captions honestly "Not yet". */
export function buildLiveGroups(t: TFunction): AccessGroup[] {
  return [
    liveGroup("player", t, [
      liveItem("mediaKeys", <FiSkipForward />),
      liveItem("seek", <FiSliders />),
      liveItem("labels", <FiVolume2 />),
    ]),
    liveGroup("display", t, [
      liveItem("motion", <FiPause />),
      liveItem("themes", <FiMoon />),
      liveItem("languages", <FiGlobe />),
    ]),
    liveGroup("words", t, [
      liveItem("lyrics", <FiAlignLeft />),
      liveItem("captions", <FiMessageSquare />, "notYet"),
    ]),
  ];
}
