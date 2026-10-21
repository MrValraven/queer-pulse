/** jsdom has no PointerEvent; sliders read pointerId, pointerType and
 *  clientX. Install it with `vi.stubGlobal("PointerEvent", PointerEventStub)`. */
export class PointerEventStub extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.pointerType = init.pointerType ?? "mouse";
  }
}
