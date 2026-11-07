import { describe, expect, expectTypeOf, it } from "vitest";
import {
  VJ_CLIENT_FRAME_NAMES,
  VJ_REMOTE_COMMAND_NAMES,
} from "../../../shared/contracts/vj";
import type {
  VjAck,
  VjClientFrameNameConst,
  VjCommandSuccess,
  VjReauthAck,
  VjRemoteCommandName,
} from "../../../shared/contracts/vj";
import type {
  VjAckFor,
  VjClientFrameName,
  VjCommandFrameName,
  VjCommandPatch,
} from "./vjFrames";

describe("vjFrames typing", () => {
  it("maps every client frame name except screen:status", () => {
    expectTypeOf<VjClientFrameName>().toEqualTypeOf<
      Exclude<VjClientFrameNameConst, "screen:status">
    >();
    const mappedNames = VJ_CLIENT_FRAME_NAMES.filter(
      (frameName) => frameName !== "screen:status",
    );
    expect(mappedNames).toHaveLength(VJ_CLIENT_FRAME_NAMES.length - 1);
  });

  it("VjCommandFrameName is exactly the 20 remote commands", () => {
    expectTypeOf<VjCommandFrameName>().toEqualTypeOf<VjRemoteCommandName>();
    expect(VJ_REMOTE_COMMAND_NAMES).toHaveLength(20);
    expect(new Set(VJ_REMOTE_COMMAND_NAMES).size).toBe(20);
  });

  it("VjCommandPatch drops clientId and commandSequence", () => {
    expectTypeOf<VjCommandPatch<"stage:setPack">>().toEqualTypeOf<{
      packId: string | null;
    }>();
    expectTypeOf<VjCommandPatch<"stage:recallScene">>().toEqualTypeOf<{
      sceneId: string;
    }>();
    expectTypeOf<VjCommandPatch<"stage:swapMix">>().not.toHaveProperty(
      "clientId",
    );
    expectTypeOf<VjCommandPatch<"stage:setStrobe">>().not.toHaveProperty(
      "commandSequence",
    );
  });

  it("the reauth ack is VjReauthAck", () => {
    expectTypeOf<VjAckFor<"session:reauth">>().toEqualTypeOf<VjReauthAck>();
    expectTypeOf<VjAckFor<"stage:goClip">>().toEqualTypeOf<
      VjAck<VjCommandSuccess>
    >();
  });
});
