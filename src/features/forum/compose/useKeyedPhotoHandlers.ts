import { useLayoutEffect, useRef } from "react";
import type { ComposePhoto } from "./composeThread.types";

/** Turns the controller's index-based handlers into ones that take a photo's
 *  key. The position is looked up in the photos as last committed at the
 *  moment of the press, so a tile drawn one render ago can never act on the
 *  photo that has since taken its slot. */
export function useKeyedPhotoHandlers(
  photos: readonly ComposePhoto[],
  handlers: {
    onAltChange: (index: number, alt: string) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: -1 | 1) => void;
  },
) {
  const latestPhotosRef = useRef(photos);
  useLayoutEffect(() => {
    latestPhotosRef.current = photos;
  });
  function withIndexOf(photoKey: string, act: (index: number) => void) {
    const index = latestPhotosRef.current.findIndex(
      (photo) => photo.key === photoKey,
    );
    if (index >= 0) act(index);
  }
  return {
    onAltChange: (photoKey: string, alt: string) =>
      withIndexOf(photoKey, (index) => handlers.onAltChange(index, alt)),
    onRemove: (photoKey: string) => withIndexOf(photoKey, handlers.onRemove),
    onMove: (photoKey: string, direction: -1 | 1) =>
      withIndexOf(photoKey, (index) => handlers.onMove(index, direction)),
  };
}
