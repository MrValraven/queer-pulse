import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  clampCrop,
  cropRectFromPanZoom,
  cropToImgStyle,
  panZoomFromCropRect,
  type CropRect,
  type SourceSize,
} from "./cropGeometry";
import { useFramePanPinch } from "./useFramePanPinch";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.01;
const ZOOM_WHEEL_STEP = 0.05;
const ZOOM_KEY_STEP = 0.1;
const PAN_KEY_STEP = 0.05;

export type FreeformChoiceKey = "original" | "square" | "native";

export interface AspectChoiceDefinition {
  key: FreeformChoiceKey;
  labelKey: string;
}

export interface UseImageReframerStateOptions {
  aspect: number | "free";
  aspectLabel: string;
  allowFreeform: boolean;
  minOutputWidth: number;
  minOutputHeight: number;
  value?: CropRect;
  onChange: (rect: CropRect) => void;
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Preset ratio chips offered when `allowFreeform` is true: Original (source's
 *  own ratio), Square, and Native (the upload kind's designated aspect) when
 *  the caller passed a numeric `aspect` rather than `"free"`. */
function buildAspectChoiceDefinitions(hasNativeAspect: boolean): AspectChoiceDefinition[] {
  const definitions: AspectChoiceDefinition[] = [
    { key: "original", labelKey: "shared:reframe.ratio.original" },
    { key: "square", labelKey: "shared:reframe.ratio.square" },
  ];
  if (hasNativeAspect) {
    definitions.push({ key: "native", labelKey: "shared:reframe.ratio.native" });
  }
  return definitions;
}

/**
 * All pan/zoom/keyboard mechanics behind `<ImageReframer>`, split out so the
 * component itself stays a thin render (repo's 200-line-per-component
 * convention). Owns zoom/pan/source/freeform-choice state, the geometry
 * derived from it (`cropGeometry`), and the `onChange` emission effect; the
 * pointer-drag/pinch gesture mechanics live in `useFramePanPinch`. Returns
 * exactly what the component renders.
 */
export function useImageReframerState({
  aspect,
  aspectLabel,
  allowFreeform,
  minOutputWidth,
  minOutputHeight,
  value,
  onChange,
}: UseImageReframerStateOptions) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0.5);
  const [panY, setPanY] = useState(0.5);
  const [source, setSource] = useState<SourceSize | null>(null);
  const [freeformChoice, setFreeformChoice] = useState<FreeformChoiceKey>(
    typeof aspect === "number" ? "native" : "original",
  );

  const { frameRef, isDragging, handleFramePointerDown, handleFramePointerMove, endFramePointer } =
    useFramePanPinch({ zoom, panX, panY, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, setZoom, setPanX, setPanY });

  const seededRef = useRef(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  // Kept fresh on every render (no dependency array) so the seeding effect
  // below always reads the LATEST `value` prop, not one frozen at mount. A
  // caller that resolves its saved crop asynchronously - `value` arriving as
  // a prop update after mount but before the image's `onLoad` fires - still
  // seeds correctly instead of silently starting from identity.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  const aspectChoiceDefinitions = useMemo(
    () => buildAspectChoiceDefinitions(typeof aspect === "number"),
    [aspect],
  );

  const activeAspectNumber = useMemo(() => {
    if (!allowFreeform) {
      if (typeof aspect === "number") return aspect;
      return source ? source.width / source.height : 1;
    }
    if (freeformChoice === "square") return 1;
    if (freeformChoice === "native" && typeof aspect === "number") return aspect;
    return source ? source.width / source.height : 1;
  }, [allowFreeform, aspect, freeformChoice, source]);

  const activeAspectLabel = useMemo(() => {
    if (!allowFreeform) return aspectLabel;
    if (freeformChoice === "square") return "1:1";
    if (freeformChoice === "native" && typeof aspect === "number") return aspectLabel;
    return "original";
  }, [allowFreeform, aspect, aspectLabel, freeformChoice]);

  // The crop rect driving both the visible frame and every `onChange` emission.
  const displayRect = useMemo(() => {
    if (!source) return null;
    return clampCrop(
      cropRectFromPanZoom(source, activeAspectNumber, zoom, panX, panY, activeAspectLabel),
      source,
      { width: minOutputWidth, height: minOutputHeight },
    );
  }, [source, activeAspectNumber, activeAspectLabel, zoom, panX, panY, minOutputWidth, minOutputHeight]);

  // Seed zoom/pan from a controlled `value` the first time the source loads,
  // then emit `onChange` on every geometry change thereafter. `seededRef`
  // gates this to run at most once: once it flips true, later `value`
  // changes never re-seed over the user's own zoom/pan. The seed branch
  // returns without emitting so the follow-up render (with the seeded
  // zoom/pan already applied) is the one that reports the real rect.
  useEffect(() => {
    if (!source) return;
    if (!seededRef.current) {
      seededRef.current = true;
      const initialValue = valueRef.current;
      if (initialValue) {
        const seeded = panZoomFromCropRect(source, activeAspectNumber, initialValue);
        setZoom(clampValue(seeded.zoom, MIN_ZOOM, MAX_ZOOM));
        setPanX(clampValue(seeded.panX, 0, 1));
        setPanY(clampValue(seeded.panY, 0, 1));
        return;
      }
    }
    if (displayRect) onChangeRef.current(displayRect);
  }, [source, activeAspectNumber, displayRect]);

  // Native, non-passive wheel listener so zoom can preventDefault (React's
  // synthetic onWheel is passive by default and can't block page scroll).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const handleWheelNative = (event: WheelEvent) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      setZoom((current) => clampValue(current + direction * ZOOM_WHEEL_STEP, MIN_ZOOM, MAX_ZOOM));
    };
    frame.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => frame.removeEventListener("wheel", handleWheelNative);
  }, [frameRef]);

  function handleImageLoad(image: HTMLImageElement) {
    setSource({ width: image.naturalWidth, height: image.naturalHeight });
  }

  function handleReset() {
    setZoom(1);
    setPanX(0.5);
    setPanY(0.5);
  }

  function nudgeZoom(direction: 1 | -1) {
    setZoom((current) => clampValue(current + direction * ZOOM_KEY_STEP, MIN_ZOOM, MAX_ZOOM));
  }

  function handleFrameKeyDown(key: string): boolean {
    switch (key) {
      case "ArrowLeft":
        setPanX((current) => clampValue(current - PAN_KEY_STEP, 0, 1));
        return true;
      case "ArrowRight":
        setPanX((current) => clampValue(current + PAN_KEY_STEP, 0, 1));
        return true;
      case "ArrowUp":
        setPanY((current) => clampValue(current - PAN_KEY_STEP, 0, 1));
        return true;
      case "ArrowDown":
        setPanY((current) => clampValue(current + PAN_KEY_STEP, 0, 1));
        return true;
      case "+":
      case "=":
        nudgeZoom(1);
        return true;
      case "-":
      case "_":
        nudgeZoom(-1);
        return true;
      default:
        return false;
    }
  }

  function handleZoomKeyDown(key: string): boolean {
    if (key === "+" || key === "=") {
      nudgeZoom(1);
      return true;
    }
    if (key === "-" || key === "_") {
      nudgeZoom(-1);
      return true;
    }
    return false;
  }

  const imageStyle: CSSProperties = displayRect
    ? { position: "absolute", ...cropToImgStyle(displayRect) }
    : { position: "absolute", inset: 0, width: "100%", height: "100%" };

  return {
    frameRef,
    zoom,
    setZoom,
    isDragging,
    freeformChoice,
    setFreeformChoice,
    aspectChoiceDefinitions,
    activeAspectNumber,
    imageStyle,
    handleImageLoad,
    handleReset,
    handleFramePointerDown,
    handleFramePointerMove,
    endFramePointer,
    handleFrameKeyDown,
    handleZoomKeyDown,
    zoomBounds: { min: MIN_ZOOM, max: MAX_ZOOM, step: ZOOM_STEP },
  };
}
