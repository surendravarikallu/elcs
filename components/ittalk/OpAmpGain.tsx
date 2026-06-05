"use client";

import { useState, useEffect, useRef } from "react";
import { TactileAudio } from "./TactileAudio";

export function OpAmpGain() {
  const [config, setConfig] = useState<"inverting" | "noninverting">("inverting");
  
  // Inputs
  const [rIn, setRIn] = useState("1000");   // R_in (ohms)
  const [rF, setRF] = useState("10000");   // R_feedback (ohms)
  const [vInPeak, setVInPeak] = useState("1.0"); // input signal peak amplitude (V)
  const [vCc, setVCc] = useState("12");    // Positive Supply Rail (V)
  const [vEe, setVEe] = useState("-12");   // Negative Supply Rail (V)

  // Calculated values
  const [gain, setGain] = useState(-10);
  const [vOutPeakTheoretical, setVOutPeakTheoretical] = useState(10);
  const [vOutPeakActual, setVOutPeakActual] = useState(10);
  const [isClipping, setIsClipping] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setErrorMsg("");
    const rin = parseFloat(rIn) || 0;
    const rf = parseFloat(rF) || 0;
    const vin = parseFloat(vInPeak) || 0;
    const vcc = parseFloat(vCc) || 0;
    const vee = parseFloat(vEe) || 0;

    if (rin <= 0 || rf < 0 || vin < 0 || vcc <= 0 || vee >= 0) {
      setErrorMsg("Please ensure resistors and supply rails are configured with valid positive/negative potentials.");
      return;
    }

    let calculatedGain = 0;
    if (config === "inverting") {
      calculatedGain = -rf / rin;
    } else {
      calculatedGain = 1 + rf / rin;
    }
    setGain(calculatedGain);

    const theoreticalVout = vin * calculatedGain;
    setVOutPeakTheoretical(theoreticalVout);

    // Actual output is constrained by power supply rails
    let actualVout = theoreticalVout;
    let clip = false;

    if (config === "inverting") {
      // Inverting gain is negative, so positive input peaks go negative, negative peaks go positive
      // We check bounds of theoretical amplitude
      if (theoreticalVout < 0) {
        if (theoreticalVout < vee) {
          actualVout = vee;
          clip = true;
        }
        if (-theoreticalVout > vcc) {
          clip = true;
        }
      } else {
        if (theoreticalVout > vcc) {
          actualVout = vcc;
          clip = true;
        }
        if (-theoreticalVout < vee) {
          clip = true;
        }
      }
    } else {
      // Non-inverting gain is positive
      if (theoreticalVout > vcc) {
        actualVout = vcc;
        clip = true;
      } else if (theoreticalVout < vee) {
        actualVout = vee;
        clip = true;
      }
    }

    setVOutPeakActual(actualVout);
    setIsClipping(clip);

    if (clip) {
      // play double beep to warn about clipping
      TactileAudio.playWarning();
    }
  }, [config, rIn, rF, vInPeak, vCc, vEe]);

  // Render Oscilloscope
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;

    // Grid layout
    ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
    ctx.lineWidth = 1;
    const divs = 8;
    for (let i = 1; i < divs; i++) {
      ctx.beginPath();
      ctx.moveTo((i / divs) * W, 0);
      ctx.lineTo((i / divs) * W, H);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (i / divs) * H);
      ctx.lineTo(W, (i / divs) * H);
      ctx.stroke();
    }

    // Zero axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    const vin = parseFloat(vInPeak) || 0;
    const vcc = parseFloat(vCc) || 12;
    const vee = parseFloat(vEe) || -12;

    // Vertical scale: Map max(vcc, |vee|) to midY - 10
    const maxRail = Math.max(vcc, Math.abs(vee));
    const scale = (midY - 12) / maxRail;

    // Draw rails
    ctx.strokeStyle = "rgba(220, 38, 38, 0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY - vcc * scale);
    ctx.lineTo(W, midY - vcc * scale);
    ctx.moveTo(0, midY - vee * scale);
    ctx.lineTo(W, midY - vee * scale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw input signal (Sine wave in green)
    ctx.strokeStyle = "#10b981"; // Emerald green
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const theta = (x / W) * Math.PI * 4; // 2 full cycles
      const y = midY - Math.sin(theta) * vin * scale;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw output signal (Sine wave in Amber/Orange, possibly clipped)
    ctx.strokeStyle = "var(--color-accent)"; // amber
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const theta = (x / W) * Math.PI * 4; // 2 cycles
      const idealOut = Math.sin(theta) * vOutPeakTheoretical;

      // Clip bounds
      let actualY = idealOut;
      if (actualY > vcc) actualY = vcc;
      else if (actualY < vee) actualY = vee;

      const y = midY - actualY * scale;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

  }, [gain, vOutPeakTheoretical, vInPeak, vCc, vEe]);

  const handleConfigChange = (newConfig: typeof config) => {
    TactileAudio.playClick();
    setConfig(newConfig);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left pane: Controls & Resistor values */}
      <div className="lg:col-span-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-accent/20 bg-card/65 p-5">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ OP-AMP TOPOLOGY ]</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfigChange("inverting")}
                className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                  config === "inverting"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                Inverting
              </button>
              <button
                onClick={() => handleConfigChange("noninverting")}
                className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                  config === "noninverting"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                Non-Inverting
              </button>
            </div>
          </div>

          <div className="border border-accent/20 bg-card/65 p-5 flex flex-col justify-center">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-1">[ GAIN FACTOR (A_V) ]</div>
            <div className="font-mono text-2xl font-light text-accent-glow">
              {gain.toFixed(2)} V/V ({isFinite(gain) && gain !== 0 ? `${(20 * Math.log10(Math.abs(gain))).toFixed(1)} dB` : "-∞ dB"})
            </div>
          </div>
        </div>

        <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
          <div className="font-mono text-[10px] text-accent tracking-widest">[ TUNING PARAMETERS ]</div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="block font-mono text-[9px] text-foreground/50">R-in (Ω)</label>
              <input
                type="number"
                value={rIn}
                onChange={(e) => handleInputChange(setRIn, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[9px] text-foreground/50">R-feedback (Ω)</label>
              <input
                type="number"
                value={rF}
                onChange={(e) => handleInputChange(setRF, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[9px] text-foreground/50">V-in Peak (V)</label>
              <input
                type="number"
                step="any"
                value={vInPeak}
                onChange={(e) => handleInputChange(setVInPeak, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[9px] text-foreground/50">VCC Rail (V)</label>
              <input
                type="number"
                value={vCc}
                onChange={(e) => handleInputChange(setVCc, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[9px] text-foreground/50">VEE Rail (V)</label>
              <input
                type="number"
                value={vEe}
                onChange={(e) => handleInputChange(setVEe, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="font-mono text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5">
              ERROR: {errorMsg}
            </div>
          )}
        </div>

        {/* Readout */}
        <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ AMPLIFIED OUTPUT VOLTAGE ]</div>
          <div className="font-mono text-4xl font-light text-accent-glow">
            Vout = {vOutPeakActual.toFixed(3)} V
          </div>
          {isClipping && (
            <div className="font-mono text-[10px] text-destructive animate-pulse mt-2 uppercase tracking-wider">
              ⚠️ RAIL CLIPPING DETECTED (Supply limit: {vEe}V to {vCc}V)
            </div>
          )}
        </div>
      </div>

      {/* Right pane: Oscilloscope & Schematic */}
      <div className="lg:col-span-5 space-y-6">
        {/* Oscilloscope Screen */}
        <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ DUAL-TRACE OSCILLOSCOPE ]</div>
          <canvas
            ref={canvasRef}
            width={300}
            height={160}
            className="w-full h-40 bg-background/50 border border-foreground/10"
          />
          <div className="flex gap-4 font-mono text-[8px] mt-2 justify-center w-full">
            <span className="text-[#10b981]">CH1: Input ({vInPeak}V/Div)</span>
            <span className="text-accent">CH2: Output ({vOutPeakActual.toFixed(1)}V/Div)</span>
          </div>
        </div>

        {/* Theory */}
        <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ THE THEORY ]</div>
          <p>
            An <strong>operational amplifier</strong> (Op-Amp) scales an input signal by a closed-loop gain ratio:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Inverting Gain</strong>: A_v = -R_f / R_in. The output is phase-shifted by 180°.</li>
            <li><strong>Non-Inverting Gain</strong>: A_v = 1 + R_f / R_in. The output is in-phase with the input.</li>
            <li><strong>Rail Saturation</strong>: No physical op-amp can output a voltage higher than its positive supply rail (V_CC) or lower than its negative supply rail (V_EE). Exceeding this boundary flattens the output wave peak (clipping), introducing heavy harmonic distortion.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
