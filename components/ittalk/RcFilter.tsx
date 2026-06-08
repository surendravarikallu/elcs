"use client";

import { useState, useEffect, useRef } from "react";
import { TactileAudio } from "./TactileAudio";

export function RcFilter() {
  const [filterType, setFilterType] = useState<"lowpass" | "highpass">("lowpass");
  const [solveFor, setSolveFor] = useState<"fc" | "r" | "c">("fc");

  const [rVal, setRVal] = useState("10000"); // ohms
  const [cVal, setCVal] = useState("1e-7");   // farads (0.1 uF)
  const [fcVal, setFcVal] = useState("159.15"); // Hz

  const [solvedR, setSolvedR] = useState<number>(10000);
  const [solvedC, setSolvedC] = useState<number>(1e-7);
  const [solvedFc, setSolvedFc] = useState<number>(159.15);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let r = parseFloat(rVal) || 10000;
    let c = parseFloat(cVal) || 1e-7;
    let fc = parseFloat(fcVal) || 159.15;

    if (solveFor === "fc") {
      if (r > 0 && c > 0) {
        fc = 1 / (2 * Math.PI * r * c);
        setSolvedFc(fc);
        setSolvedR(r);
        setSolvedC(c);
      }
    } else if (solveFor === "r") {
      if (fc > 0 && c > 0) {
        r = 1 / (2 * Math.PI * fc * c);
        setSolvedR(r);
        setSolvedFc(fc);
        setSolvedC(c);
      }
    } else if (solveFor === "c") {
      if (r > 0 && fc > 0) {
        c = 1 / (2 * Math.PI * fc * r);
        setSolvedC(c);
        setSolvedR(r);
        setSolvedFc(fc);
      }
    }
  }, [rVal, cVal, fcVal, solveFor]);

  // Draw Bode Plot on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // Oscilloscope grid background
    ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
    ctx.lineWidth = 1;
    const divs = 10;
    for (let i = 1; i < divs; i++) {
      // vertical lines
      ctx.beginPath();
      ctx.moveTo((i / divs) * W, 0);
      ctx.lineTo((i / divs) * W, H);
      ctx.stroke();

      // horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, (i / divs) * H);
      ctx.lineTo(W, (i / divs) * H);
      ctx.stroke();
    }

    // Cutoff frequency fc
    const fc = solvedFc;

    // Generate gain curve
    // Frequency range: 2 decades below fc to 2 decades above fc
    const fMin = fc / 100;
    const fMax = fc * 100;
    const logMin = Math.log10(fMin);
    const logMax = Math.log10(fMax);

    ctx.beginPath();
    ctx.strokeStyle = "var(--color-accent)";
    ctx.lineWidth = 2;

    for (let x = 0; x < W; x++) {
      const pct = x / W;
      const f = Math.pow(10, logMin + pct * (logMax - logMin));
      
      let gain = 1;
      if (filterType === "lowpass") {
        gain = 1 / Math.sqrt(1 + Math.pow(f / fc, 2));
      } else {
        // Highpass
        gain = (f / fc) / Math.sqrt(1 + Math.pow(f / fc, 2));
      }

      // Convert gain to dB
      const db = 20 * Math.log10(gain);
      // Map 0dB to y=20, -40dB to y=H-20
      const y = 20 + ((db - 0) / (-40 - 0)) * (H - 40);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Mark the -3dB cutoff point
    const fcX = W / 2; // fc sits exactly in the middle of our 4-decade log chart
    const fcY = 20 + ((-3 - 0) / (-40 - 0)) * (H - 40);
    ctx.beginPath();
    ctx.arc(fcX, fcY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--color-accent-glow)";
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "var(--color-accent-glow)";
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw cutoff marker lines
    ctx.strokeStyle = "var(--color-accent-glow)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(fcX, fcY);
    ctx.lineTo(fcX, H);
    ctx.moveTo(fcX, fcY);
    ctx.lineTo(0, fcY);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Cutoff text
    ctx.fillStyle = "var(--color-accent-glow)";
    ctx.font = "8px monospace";
    ctx.fillText(`fc = ${formatFreq(fc)} (-3dB)`, fcX + 8, fcY - 4);
  }, [solvedFc, solvedR, solvedC, filterType]);

  const formatFreq = (f: number): string => {
    if (f >= 1e6) return `${(f / 1e6).toFixed(2)} MHz`;
    if (f >= 1e3) return `${(f / 1e3).toFixed(2)} kHz`;
    return `${f.toFixed(2)} Hz`;
  };

  const handleFilterChange = (t: typeof filterType) => {
    TactileAudio.playClick();
    setFilterType(t);
  };

  const handleSolveForChange = (s: typeof solveFor) => {
    TactileAudio.playClick();
    setSolveFor(s);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-accent/20 bg-card/65 p-5">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ FILTER TYPE ]</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange("lowpass")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    filterType === "lowpass"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  Low Pass
                </button>
                <button
                  onClick={() => handleFilterChange("highpass")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    filterType === "highpass"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  High Pass
                </button>
              </div>
            </div>

            <div className="border border-accent/20 bg-card/65 p-5">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ SOLVE TARGET ]</div>
              <div className="flex gap-1.5">
                {(["fc", "r", "c"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSolveForChange(s)}
                    className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                      solveFor === s
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                    }`}
                  >
                    Solve {s === "fc" ? "fc" : s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
            <div className="font-mono text-[10px] text-accent tracking-widest">[ TUNING PARAMETERS ]</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {solveFor !== "r" && (
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-foreground/50">Resistance (Ω)</label>
                  <input
                    type="number"
                    value={rVal}
                    onChange={(e) => handleInputChange(setRVal, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              )}
              {solveFor !== "c" && (
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-foreground/50">Capacitance (F)</label>
                  <input
                    type="text"
                    value={cVal}
                    placeholder="e.g. 1e-7"
                    onChange={(e) => handleInputChange(setCVal, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              )}
              {solveFor !== "fc" && (
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-foreground/50">Cutoff Freq fc (Hz)</label>
                  <input
                    type="number"
                    value={fcVal}
                    onChange={(e) => handleInputChange(setFcVal, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Readout panel */}
          <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ FREQUENCY DETAILS ]</div>
            <div className="font-mono text-4xl font-light text-accent-glow">
              fc = {formatFreq(solvedFc)}
            </div>
            <div className="font-mono text-[10px] text-foreground/50 mt-2">
              R = {solvedR.toFixed(1)} Ω | C = {(solvedC * 1e6).toFixed(4)} µF
            </div>
          </div>
        </div>

        {/* Right pane: Bode Plot & Theory */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bode Plot Canvas */}
          <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ BODE PLOT (GAIN FREQ RESPONSE) ]</div>
            <canvas
              ref={canvasRef}
              width={300}
              height={160}
              className="w-full h-40 bg-background/50 border border-foreground/10"
            />
          </div>

          {/* Theory */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ THE THEORY ]</div>
            <p>
              An <strong>RC filter</strong> is a passive circuit containing a resistor (R) and capacitor (C).
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Low-Pass Filter (LPF)</strong>: Attenuates frequencies <em>above</em> $f_c$ at -20dB/decade. Used to smooth PWM signals or clean high-frequency noise from sensors.</li>
              <li><strong>High-Pass Filter (HPF)</strong>: Blocks DC and low frequencies <em>below</em> $f_c$. Mainly used to remove DC offsets and slowly varying signals.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Theory & Specifications */}
      <div className="border border-accent/20 bg-card/65 rounded-sm">
        <details className="group">
          <summary className="flex items-center justify-between p-5 font-mono text-[10px] text-accent tracking-widest uppercase cursor-pointer select-none hover:bg-accent/5 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <span>[ DETAILED THEORY & SPECIFICATIONS ]</span>
            <span className="text-[10px] text-accent/50 transition-transform duration-300 group-open:rotate-180">▼</span>
          </summary>
          <div className="p-6 border-t border-foreground/10 font-body text-xs text-foreground/70 space-y-6 leading-relaxed">
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">What is an RC Filter?</h4>
              <p>
                An RC filter is a basic analog circuit made using a resistor (R) and a capacitor (C). It is used to control which frequencies pass through a circuit and which are blocked. RC filters are simple, low-cost, and widely used in electronic systems.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Common Applications:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Noise reduction</li>
                <li>Signal smoothing</li>
                <li>Audio processing</li>
                <li>Sensor signal filtering</li>
                <li>ADC input conditioning</li>
              </ol>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Low-Pass Filter (LPF):</h4>
              <p>
                A Low-Pass Filter (LPF) allows low-frequency signals to pass and attenuates high-frequency signals. It is mainly used to remove high-frequency noise from signals.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Circuit:</strong> Resistor R connected in series with input, Capacitor C connected from output to ground. Output voltage taken across the capacitor.</li>
                <li><strong>Uses:</strong> Removing noise from sensor signals | Smoothing PWM signals to analog voltage | Audio bass filtering | ADC input protection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">High-Pass Filter (HPF):</h4>
              <p>
                A High-Pass Filter (HPF) allows high-frequency signals to pass and blocks low-frequency (DC) signals. It is commonly used to remove DC offset and slow variations.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Circuit:</strong> Capacitor C connected in series with input, Resistor R connected from output to ground. Output voltage taken across the resistor.</li>
                <li><strong>Uses:</strong> Removing DC offset | Audio treble filtering | Signal coupling between stages | Vibration and motion sensing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Formula:</h4>
              <p className="font-mono text-accent text-sm">fc = 1 / (2πRC)</p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Formula Variables:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <thead>
                    <tr className="border-b border-foreground/15 bg-foreground/5 font-mono text-[10px] uppercase text-accent">
                      <th className="p-2 border-r border-foreground/10">Symbol</th>
                      <th className="p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">R</td>
                      <td className="p-2">Resistance (Ω)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">C</td>
                      <td className="p-2">Capacitance (F)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">fc</td>
                      <td className="p-2">Cutoff Frequency (Hz)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Notes:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>RC filters are first-order filters.</li>
                <li>Attenuation rate is 20 dB/decade.</li>
                <li>Cutoff frequency depends on both R and C.</li>
                <li>Output amplitude changes gradually, not suddenly.</li>
                <li>At cutoff frequency, output voltage drops to 70.7% of input.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Key Features:</h4>
              <p>Low-pass filter design | High-pass filter design | Cutoff frequency calculation | Component value calculation | Frequency response graph</p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Specifications:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Formula</td>
                      <td className="p-2">fc = 1 / (2πRC)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Rolloff</td>
                      <td className="p-2">-20dB/decade</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Frequency Range</td>
                      <td className="p-2">0.1Hz - 10MHz</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Components</td>
                      <td className="p-2">Resistor, Capacitor</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Output</td>
                      <td className="p-2">Cutoff frequency, R, C values</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
