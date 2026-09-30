/**
 * QueerPulse launch film — the score.
 *
 * Synthesised from scratch with an OfflineAudioContext, so the film has no
 * licensed music to clear and the soundtrack is cut to the picture by
 * construction: the same cue times scene.html animates to (window.CUES) are
 * where the notes fall. 100 BPM, F major, with a D-minor opening while the
 * film is still on the lonely part of the story.
 *
 * Loaded into scene.html by render.mjs; `window.renderScore()` resolves to a
 * base64 16-bit stereo WAV.
 */
(function () {
  const SR = 48000;
  const BEAT = 0.6;
  const BAR = 2.4;
  const bar = (n) => n * BAR;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const CHORDS = {
    Dm9: { bass: 38, pad: [57, 60, 64, 65] },
    Bbmaj7: { bass: 34, pad: [57, 62, 65, 69] },
    Gm9: { bass: 43, pad: [57, 58, 62, 65] },
    Csus: { bass: 36, pad: [55, 60, 65, 67] },
    F: { bass: 41, pad: [57, 60, 64, 67] },
    CE: { bass: 40, pad: [55, 60, 62, 67] },
    Dm7: { bass: 38, pad: [57, 60, 62, 65] },
    Bbmaj9: { bass: 34, pad: [57, 60, 62, 65, 69] },
    Fmaj9: { bass: 29, pad: [57, 60, 64, 67, 72] },
  };
  const LOOP = ["F", "CE", "Dm7", "Bbmaj7"];
  function chordAt(n) {
    if (n < 2) return null;
    if (n < 6) return ["Dm9", "Bbmaj7", "Gm9", "Csus"][n - 2];
    if (n < 24) return LOOP[(n - 6) % 4];
    if (n === 24) return "Bbmaj9";
    if (n === 25) return "Csus";
    return "Fmaj9";
  }

  function makeIR(ctx, seconds, decay) {
    const len = Math.floor(SR * seconds);
    const ir = ctx.createBuffer(2, len, SR);
    let seed = 99;
    const rnd = () =>
      ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = rnd() * Math.pow(1 - i / len, decay);
    }
    return ir;
  }

  window.renderScore = async function renderScore() {
    const CUES = window.CUES;
    const LEN = CUES.duration;
    const ctx = new OfflineAudioContext(2, Math.ceil(SR * LEN), SR);

    /* ── Busses ── */
    const master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    comp.knee.value = 12;
    comp.attack.value = 0.008;
    comp.release.value = 0.22;
    master.connect(comp).connect(ctx.destination);
    master.gain.setValueAtTime(1, 0);
    master.gain.setValueAtTime(1, LEN - 1.0);
    master.gain.linearRampToValueAtTime(0, LEN - 0.05);

    const reverb = ctx.createConvolver();
    reverb.buffer = makeIR(ctx, 3.6, 2.6);
    const verb = ctx.createGain();
    verb.gain.value = 0.55;
    verb.connect(reverb).connect(master);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = BEAT * 0.75; // dotted eighth
    const fb = ctx.createGain();
    fb.gain.value = 0.36;
    const fbLp = ctx.createBiquadFilter();
    fbLp.type = "lowpass";
    fbLp.frequency.value = 3200;
    delay.connect(fbLp).connect(fb).connect(delay);
    const echo = ctx.createGain();
    echo.gain.value = 0.32;
    echo.connect(delay);
    fbLp.connect(master);
    fbLp.connect(verb);

    // Pads and bass duck under the kick — the "pulse" you feel more than hear.
    const pump = ctx.createGain();
    pump.connect(master);
    const pumpVerb = ctx.createGain();
    pumpVerb.gain.value = 0.45;
    pump.connect(pumpVerb).connect(verb);

    const noiseBuf = ctx.createBuffer(1, SR * 2, SR);
    {
      const d = noiseBuf.getChannelData(0);
      let s = 7;
      for (let i = 0; i < d.length; i++)
        d[i] = ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    }
    let noiseOffset = 0;
    const noise = (t, dur) => {
      const n = ctx.createBufferSource();
      n.buffer = noiseBuf;
      n.loop = true;
      n.start(t, (noiseOffset = (noiseOffset + 0.377) % 1.5));
      n.stop(t + dur + 0.05);
      return n;
    };
    const env = (g, t, a, peak, d, end = 0.0001) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(end, t + a + d);
    };
    const pan = (v) => {
      const p = ctx.createStereoPanner();
      p.pan.value = v;
      return p;
    };

    /* ── Voices ── */
    function kick(t, v = 1, lo = 44, hi = 150, dec = 0.42) {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.frequency.setValueAtTime(hi, t);
      o.frequency.exponentialRampToValueAtTime(lo, t + 0.12);
      env(g, t, 0.003, v, dec);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + dec + 0.1);
      const n = noise(t, 0.02),
        hp = ctx.createBiquadFilter(),
        ng = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 2500;
      env(ng, t, 0.001, 0.12 * v, 0.015);
      n.connect(hp).connect(ng).connect(master);
    }
    function heartbeat(t, v = 1) {
      const beat = (at, vel) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain(),
          lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 220;
        o.frequency.setValueAtTime(92, at);
        o.frequency.exponentialRampToValueAtTime(36, at + 0.16);
        env(g, at, 0.006, vel, 0.34);
        o.connect(lp).connect(g).connect(master);
        g.connect(verb);
        o.start(at);
        o.stop(at + 0.5);
      };
      beat(t, v);
      beat(t + 0.22, v * 0.62);
    }
    function hat(t, v = 0.2, open = false, p = 0) {
      const n = noise(t, open ? 0.25 : 0.06),
        hp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 7800;
      env(g, t, 0.001, v, open ? 0.2 : 0.045);
      n.connect(hp).connect(g).connect(pan(p)).connect(master);
    }
    function clap(t, v = 0.5) {
      const n = noise(t, 0.3),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      bp.type = "bandpass";
      bp.frequency.value = 1500;
      bp.Q.value = 0.9;
      g.gain.setValueAtTime(0.0001, t);
      [0, 0.011, 0.023].forEach((o) => {
        g.gain.setValueAtTime(v, t + o);
        g.gain.exponentialRampToValueAtTime(v * 0.25, t + o + 0.009);
      });
      g.gain.setValueAtTime(v * 0.8, t + 0.034);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      n.connect(bp).connect(g);
      g.connect(master);
      g.connect(verb);
    }
    function riser(t0, t1, v = 0.3) {
      const n = noise(t0, t1 - t0),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      bp.type = "bandpass";
      bp.Q.value = 2.2;
      bp.frequency.setValueAtTime(300, t0);
      bp.frequency.exponentialRampToValueAtTime(7500, t1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t1 - 0.02);
      g.gain.linearRampToValueAtTime(0.0001, t1 + 0.02);
      n.connect(bp).connect(g);
      g.connect(master);
      g.connect(verb);
    }
    function swell(t, dur = 1.2, v = 0.18) {
      const n = noise(t - dur, dur),
        hp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 2800;
      g.gain.setValueAtTime(0.0001, t - dur);
      g.gain.exponentialRampToValueAtTime(v, t - 0.01);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.01);
      n.connect(hp).connect(g);
      g.connect(master);
      g.connect(verb);
    }
    function impact(t, v = 1) {
      kick(t, 1.0 * v, 30, 110, 1.6);
      const n = noise(t, 1.6),
        lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(5000, t);
      lp.frequency.exponentialRampToValueAtTime(300, t + 1.2);
      env(g, t, 0.002, 0.35 * v, 1.4);
      n.connect(lp).connect(g);
      g.connect(verb);
      g.connect(master);
    }
    function pad(t0, t1, notes, cutoff, v = 0.05) {
      const lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      lp.type = "lowpass";
      lp.frequency.value = cutoff;
      lp.Q.value = 0.6;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(v, t0 + 0.5);
      g.gain.setValueAtTime(v, t1 - 0.05);
      g.gain.linearRampToValueAtTime(0.0001, t1 + 0.9);
      lp.connect(g).connect(pump);
      notes.forEach((m, i) =>
        [-8, 0, 8].forEach((c) => {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = hz(m);
          o.detune.value = c + (i % 2 ? 2 : -2);
          const p = pan(c / 14);
          o.connect(p).connect(lp);
          o.start(t0);
          o.stop(t1 + 1);
        }),
      );
    }
    function bass(t, dur, m, v = 0.28) {
      const o = ctx.createOscillator(),
        o2 = ctx.createOscillator(),
        lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      o.frequency.value = hz(m);
      o2.type = "triangle";
      o2.frequency.value = hz(m + 12);
      lp.type = "lowpass";
      lp.frequency.value = 420;
      const g2 = ctx.createGain();
      g2.gain.value = 0.25;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.02);
      g.gain.setValueAtTime(v, t + dur - 0.04);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(lp);
      o2.connect(g2).connect(lp);
      lp.connect(g).connect(pump);
      o.start(t);
      o2.start(t);
      o.stop(t + dur + 0.05);
      o2.stop(t + dur + 0.05);
    }
    function pluck(t, m, v = 0.09, p = 0, bright = 4200) {
      const o = ctx.createOscillator(),
        o2 = ctx.createOscillator(),
        lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      o.type = "triangle";
      o2.type = "square";
      o.frequency.value = hz(m);
      o2.frequency.value = hz(m);
      o2.detune.value = 6;
      const g2 = ctx.createGain();
      g2.gain.value = 0.18;
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(bright, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + 0.22);
      env(g, t, 0.003, v, 0.38);
      o.connect(lp);
      o2.connect(g2).connect(lp);
      const pn = pan(p);
      lp.connect(g).connect(pn);
      pn.connect(master);
      pn.connect(echo);
      pn.connect(verb);
      o.start(t);
      o2.start(t);
      o.stop(t + 0.5);
      o2.stop(t + 0.5);
    }
    function bell(t, m, v = 0.08, p = 0) {
      const pn = pan(p);
      pn.connect(master);
      pn.connect(verb);
      pn.connect(echo);
      [
        [1, 1, 2.6],
        [2.76, 0.4, 1.3],
        [5.4, 0.2, 0.6],
        [8.93, 0.1, 0.3],
      ].forEach(([r, a, d]) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.frequency.value = hz(m) * r;
        env(g, t, 0.004, v * a, d);
        o.connect(g).connect(pn);
        o.start(t);
        o.stop(t + d + 0.1);
      });
    }
    function drone(t0, t1) {
      const g = ctx.createGain(),
        lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 180;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 3);
      g.gain.setValueAtTime(0.05, t1 - 2);
      g.gain.linearRampToValueAtTime(0.0001, t1);
      [
        [hz(26), 0],
        [hz(38), 4],
        [hz(45), -3],
      ].forEach(([f, c]) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        o.detune.value = c;
        o.connect(lp);
        o.start(t0);
        o.stop(t1 + 0.1);
      });
      lp.connect(g).connect(master);
      g.connect(verb);
    }

    /* ── Arrangement ── */
    const kicks = [];
    const K = (t, v) => {
      kick(t, v);
      kicks.push(t);
    };

    // 1 · Pulse — only a heartbeat and a low drone.
    drone(0, bar(6));
    CUES.heart.forEach((t) => heartbeat(t, 0.95));
    // 2 · Scattered — the heart slows under a minor pad that opens up.
    [4.8, 7.2, 9.6, 12.0].forEach((t) => heartbeat(t + 0.6, 0.6));
    for (let n = 2; n < 28; n++) {
      const c = CHORDS[chordAt(n)],
        t0 = bar(n),
        t1 = bar(n + 1);
      const cutoff =
        n < 6
          ? 500 + (n - 2) * 260
          : n < 8
            ? 1400
            : n < 24
              ? n >= 14 && n < 18
                ? 1500
                : 2300
              : 1700;
      pad(t0, t1, c.pad, cutoff, n < 6 ? 0.04 : 0.05);
    }
    // Pluck motif enters sparse in the scattered section, like thoughts.
    [
      [5.4, 69],
      [6.6, 72],
      [8.4, 74],
      [9.3, 72],
      [10.8, 69],
      [11.7, 67],
      [12.6, 65],
    ].forEach(([t, m], i) => pluck(t, m, 0.05, i % 2 ? 0.5 : -0.5, 2200));
    riser(bar(4.5), bar(6), 0.22);
    swell(bar(6), 1.4, 0.16);

    // 3 · We built — the first major chord and a half-time pulse.
    impact(bar(6), 0.9);
    bell(bar(6), 72, 0.07, -0.2);
    bell(bar(6) + 0.3, 76, 0.05, 0.2);
    bell(bar(6) + 0.6, 79, 0.045, 0);
    for (let n = 6; n < 8; n++) {
      [0, 2].forEach((b) => K(bar(n) + b * BEAT, 0.8));
      bass(bar(n), BAR, CHORDS[chordAt(n)].bass, 0.22);
    }
    riser(bar(7), bar(8), 0.26);
    for (let i = 0; i < 8; i++) clap(bar(7) + 1.2 + i * 0.15, 0.1 + i * 0.03);

    // 4–7 · The drive: four-on-the-floor, arps, a note on every feature change.
    impact(bar(8), 0.8);
    const ARP = [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 3, 1, 2];
    for (let n = 8; n < 24; n++) {
      const c = CHORDS[chordAt(n)];
      const soft = n >= 14 && n < 18; // the vouch-network section breathes a little
      for (let b = 0; b < 4; b++) {
        const t = bar(n) + b * BEAT;
        K(t, soft ? 0.72 : 0.9);
        hat(t + BEAT / 2, soft ? 0.07 : 0.12, false, 0.25);
        if (!soft && (n >= 18 || n < 14))
          hat(t + BEAT * 0.25, 0.04, false, -0.3);
        if (!soft && (b === 1 || b === 3)) clap(t, n >= 18 ? 0.42 : 0.3);
        bass(t + 0.08, BEAT / 2 - 0.1, c.bass, 0.22);
        bass(t + BEAT / 2, BEAT / 2 - 0.04, c.bass, 0.26);
      }
      for (let s = 0; s < 16; s++) {
        const m = c.pad[ARP[s] % c.pad.length] + 12;
        pluck(
          bar(n) + s * (BEAT / 4),
          m,
          (s % 4 === 0 ? 0.075 : 0.05) * (soft ? 0.8 : 1),
          s % 2 ? 0.35 : -0.35,
        );
      }
    }
    CUES.items.forEach((t, i) => {
      if (i > 0) {
        bell(t, [72, 76, 79, 81, 84, 79, 81, 84][i], 0.05, i % 2 ? 0.4 : -0.4);
        hat(t, 0.08, true, 0);
      }
    });
    impact(bar(14), 0.55);
    // Every node in the vouch network pings as it joins, in F-major pentatonic.
    const PENTA = [77, 79, 81, 84, 86, 89, 91, 93];
    CUES.nodes.forEach((n, i) =>
      pluck(
        n.t,
        PENTA[(i * 3 + n.gen) % PENTA.length] + (n.gen === 1 ? -12 : 0),
        0.045,
        n.pan * 0.8,
        6000,
      ),
    );
    impact(bar(18), 0.75);
    CUES.cards.forEach((t, i) =>
      bell(t, [72, 74, 76, 79, 81][i], 0.07, -0.5 + i * 0.25),
    );
    riser(bar(22), bar(24), 0.3);
    for (let i = 0; i < 16; i++) clap(bar(23) + i * 0.15, 0.08 + i * 0.022);
    swell(bar(24), 1.2, 0.18);

    // 8 · Belong — the drums fall away; the logo lands on the home chord.
    impact(bar(24), 1);
    bass(bar(24), BAR * 2, CHORDS.Bbmaj9.bass, 0.12);
    CUES.sats.forEach((t, i) =>
      pluck(
        t,
        [84, 86, 88, 91, 93, 96, 98, 100][i],
        0.04,
        -0.6 + i * 0.17,
        7000,
      ),
    );
    swell(62.4, 0.8, 0.14);
    impact(62.4, 0.85);
    bass(62.4, 4.8, 29, 0.14);
    [65, 69, 72, 76, 79].forEach((m, i) =>
      bell(62.4 + i * 0.09, m, 0.06, -0.4 + i * 0.2),
    );
    CUES.endBeats.slice(1).forEach((t) => heartbeat(t, 0.9));

    // Duck the pads/bass under every kick.
    pump.gain.setValueAtTime(1, 0);
    kicks
      .sort((a, b) => a - b)
      .forEach((t) => {
        pump.gain.setValueAtTime(1, t - 0.002);
        pump.gain.linearRampToValueAtTime(0.42, t + 0.012);
        pump.gain.linearRampToValueAtTime(1, t + 0.3);
      });

    const buf = await ctx.startRendering();
    return encodeWav(buf);
  };

  function encodeWav(buf) {
    const chans = [buf.getChannelData(0), buf.getChannelData(1)];
    let peak = 0;
    for (const c of chans)
      for (let i = 0; i < c.length; i++) peak = Math.max(peak, Math.abs(c[i]));
    const gain = peak > 0 ? 0.89 / peak : 1; // normalise to about -1 dBFS
    const n = buf.length,
      bytes = 44 + n * 4;
    const dv = new DataView(new ArrayBuffer(bytes));
    const str = (o, s) => {
      for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };
    str(0, "RIFF");
    dv.setUint32(4, bytes - 8, true);
    str(8, "WAVE");
    str(12, "fmt ");
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 2, true);
    dv.setUint32(24, SR, true);
    dv.setUint32(28, SR * 4, true);
    dv.setUint16(32, 4, true);
    dv.setUint16(34, 16, true);
    str(36, "data");
    dv.setUint32(40, n * 4, true);
    let o = 44;
    for (let i = 0; i < n; i++)
      for (const c of chans) {
        dv.setInt16(o, Math.max(-1, Math.min(1, c[i] * gain)) * 32767, true);
        o += 2;
      }
    const u8 = new Uint8Array(dv.buffer);
    let bin = "";
    for (let i = 0; i < u8.length; i += 0x8000)
      bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin);
  }
})();
