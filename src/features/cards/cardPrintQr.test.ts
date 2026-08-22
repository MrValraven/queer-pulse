import QRCode from "qrcode";
import { describe, expect, it } from "vitest";

/**
 * What a phone camera actually needs: roughly 0.4mm of printed width per QR
 * module to decode reliably at arm's length. Everything else here is derived
 * from that one number.
 */
const MIN_MODULE_MM = 0.4;

/** The printed width of the symbol, matching `.side svg` in
 *  CardPrintSheet.module.css. Change one and change the other. */
const PRINTED_SYMBOL_MM = 28;

/** ISO/IEC 18004 requires four clear modules on every side. They are part of
 *  the printed square, so they count against the budget. */
const QUIET_ZONE_MODULES = 4;

/**
 * Mirrors `QrCode`'s own level. Q recovers about 25% of the codewords, which is
 * what pays for the brand mark punched into the symbol's middle. Raising this
 * to H would make the grid denser and quietly push the printed module size
 * under the floor this file exists to defend.
 */
const ERROR_CORRECTION_LEVEL = "Q";

/** 18 payload bytes (16 for the card id, 2 for the code version) and a
 *  64-byte Ed25519 signature, both base64url. */
const REPRESENTATIVE_TOKEN = `${"A".repeat(24)}.${"B".repeat(86)}`;

/** Deliberately longer than the production host, so this passes with headroom
 *  rather than only on whichever origin happens to be deployed today. The
 *  origin is part of the encoded payload, so it moves the module count. */
const LONGEST_EXPECTED_ORIGIN = "https://www.queerpulse-staging.app";

/**
 * Guards the PAYLOAD rather than the renderer.
 *
 * A change that grows the token (an extra claim, a longer origin, a higher
 * error-correction level) pushes the grid to a denser QR version, and every
 * printed card silently becomes harder to scan. That should fail here rather
 * than on a sheet of paper someone has already cut and laminated.
 *
 * It does NOT model the brand mark's occlusion, which error correction absorbs
 * rather than the module size. The mark is held to 20% of the symbol's width
 * (about 4% of its area) in `QrCode`, well inside what level Q recovers.
 */
describe("printed card QR density", () => {
  it("keeps each printed module above the size a camera can resolve", () => {
    const url = `${LONGEST_EXPECTED_ORIGIN}/cards/verify/${REPRESENTATIVE_TOKEN}`;
    const symbol = QRCode.create(url, {
      errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
    });
    const modulesAcross = symbol.modules.size + QUIET_ZONE_MODULES * 2;
    expect(PRINTED_SYMBOL_MM / modulesAcross).toBeGreaterThanOrEqual(
      MIN_MODULE_MM,
    );
  });
});
