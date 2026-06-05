"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

interface ColorItem {
  name: string;
  hex: string;
  digit: number | null;
  multiplier: number | null;
  tolerance: number | null;
  tempCoeff: number | null;
}

const COLORS: ColorItem[] = [
  { name: "Black", hex: "#000000", digit: 0, multiplier: 1, tolerance: null, tempCoeff: 250 },
  { name: "Brown", hex: "#8B4513", digit: 1, multiplier: 10, tolerance: 1, tempCoeff: 100 },
  { name: "Red", hex: "#FF0000", digit: 2, multiplier: 100, tolerance: 2, tempCoeff: 50 },
  { name: "Orange", hex: "#FFA500", digit: 3, multiplier: 1000, tolerance: null, tempCoeff: 15 },
  { name: "Yellow", hex: "#FFFF00", digit: 4, multiplier: 10000, tolerance: null, tempCoeff: 25 },
  { name: "Green", hex: "#008000", digit: 5, multiplier: 100000, tolerance: 0.5, tempCoeff: 20 },
  { name: "Blue", hex: "#0000FF", digit: 6, multiplier: 1000000, tolerance: 0.25, tempCoeff: 10 },
  { name: "Violet", hex: "#EE82EE", digit: 7, multiplier: 10000000, tolerance: 0.1, tempCoeff: 5 },
  { name: "Grey", hex: "#808080", digit: 8, multiplier: 100000000, tolerance: 0.05, tempCoeff: 1 },
  { name: "White", hex: "#FFFFFF", digit: 9, multiplier: 1000000000, tolerance: null, tempCoeff: null },
  { name: "Gold", hex: "#D4AF37", digit: null, multiplier: 0.1, tolerance: 5, tempCoeff: null },
  { name: "Silver", hex: "#C0C0C0", digit: null, multiplier: 0.01, tolerance: 10, tempCoeff: null },
];

export function ResistorColorCode() {
  const [bands, setBands] = useState<4 | 5 | 6>(4);
  const [b1, setB1] = useState("Brown");
  const [b2, setB2] = useState("Black");
  const [b3, setB3] = useState("Red"); // Acts as multiplier for 4-band, or digit 3 for 5/6-band
  const [b4, setB4] = useState("Gold"); // Acts as tolerance for 4-band, multiplier for 5/6-band
  const [b5, setB5] = useState("Brown"); // Acts as tolerance for 5/6-band
  const [b6, setB6] = useState("Red"); // Temp coeff for 6-band

  const [resistance, setResistance] = useState<number>(1000);
  const [tolerance, setTolerance] = useState<number>(5);
  const [tempCo, setTempCo] = useState<number | null>(null);

  useEffect(() => {
    const colorMap = new Map(COLORS.map((c) => [c.name, c]));
    const c1 = colorMap.get(b1);
    const c2 = colorMap.get(b2);
    const c3 = colorMap.get(b3);
    const c4 = colorMap.get(b4);
    const c5 = colorMap.get(b5);
    const c6 = colorMap.get(b6);

    if (!c1 || !c2 || !c3 || !c4) return;

    let totalVal = 0;
    let tolVal = 5;
    let tempVal: number | null = null;

    if (bands === 4) {
      const d1 = c1.digit ?? 0;
      const d2 = c2.digit ?? 0;
      const mult = c3.multiplier ?? 1;
      totalVal = (d1 * 10 + d2) * mult;
      tolVal = c4.tolerance ?? 5;
    } else if (bands === 5) {
      if (!c5) return;
      const d1 = c1.digit ?? 0;
      const d2 = c2.digit ?? 0;
      const d3 = c3.digit ?? 0;
      const mult = c4.multiplier ?? 1;
      totalVal = (d1 * 100 + d2 * 10 + d3) * mult;
      tolVal = c5.tolerance ?? 1;
    } else if (bands === 6) {
      if (!c5 || !c6) return;
      const d1 = c1.digit ?? 0;
      const d2 = c2.digit ?? 0;
      const d3 = c3.digit ?? 0;
      const mult = c4.multiplier ?? 1;
      totalVal = (d1 * 100 + d2 * 10 + d3) * mult;
      tolVal = c5.tolerance ?? 1;
      tempVal = c6.tempCoeff;
    }

    setResistance(totalVal);
    setTolerance(tolVal);
    setTempCo(tempVal);
  }, [bands, b1, b2, b3, b4, b5, b6]);

  const handleBandChange = (val: 4 | 5 | 6) => {
    TactileAudio.playClick();
    setBands(val);
  };

  const handleSelection = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  const formatValue = (ohms: number): string => {
    if (ohms >= 1e9) return `${(ohms / 1e9).toFixed(1)} GΩ`;
    if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(1)} MΩ`;
    if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(1)} kΩ`;
    return `${ohms.toFixed(1)} Ω`;
  };

  // Resistor band colors
  const colorMap = new Map(COLORS.map((c) => [c.name, c.hex]));
  const hex1 = colorMap.get(b1) || "#8B4513";
  const hex2 = colorMap.get(b2) || "#000000";
  const hex3 = colorMap.get(b3) || "#FF0000";
  const hex4 = colorMap.get(b4) || "#D4AF37";
  const hex5 = colorMap.get(b5) || "#8B4513";
  const hex6 = colorMap.get(b6) || "#FF0000";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left pane: Controls */}
      <div className="lg:col-span-7 space-y-6">
        <div className="border border-accent/20 bg-card/65 p-6">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4">[ BAND MODE ]</div>
          <div className="flex gap-2">
            {([4, 5, 6] as const).map((b) => (
              <button
                key={b}
                onClick={() => handleBandChange(b)}
                className={`py-2 px-4 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                  bands === b
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                {b} Bands
              </button>
            ))}
          </div>
        </div>

        <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
          <div className="font-mono text-[10px] text-accent tracking-widest">[ BAND SELECTION ]</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-foreground/50">Band 1 (1st Digit)</label>
              <select
                value={b1}
                onChange={(e) => handleSelection(setB1, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              >
                {COLORS.filter((c) => c.digit !== null).map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-foreground/50">Band 2 (2nd Digit)</label>
              <select
                value={b2}
                onChange={(e) => handleSelection(setB2, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
              >
                {COLORS.filter((c) => c.digit !== null).map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {bands > 4 ? (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Band 3 (3rd Digit)</label>
                <select
                  value={b3}
                  onChange={(e) => handleSelection(setB3, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {COLORS.filter((c) => c.digit !== null).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Band 3 (Multiplier)</label>
                <select
                  value={b3}
                  onChange={(e) => handleSelection(setB3, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {COLORS.filter((c) => c.multiplier !== null).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {bands > 4 && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Band 4 (Multiplier)</label>
                <select
                  value={b4}
                  onChange={(e) => handleSelection(setB4, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {COLORS.filter((c) => c.multiplier !== null).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {bands === 4 ? (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Band 4 (Tolerance)</label>
                <select
                  value={b4}
                  onChange={(e) => handleSelection(setB4, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {COLORS.filter((c) => c.tolerance !== null).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Band 5 (Tolerance)</label>
                <select
                  value={b5}
                  onChange={(e) => handleSelection(setB5, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {COLORS.filter((c) => c.tolerance !== null).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {bands === 6 && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Band 6 (Temp Coeff)</label>
                <select
                  value={b6}
                  onChange={(e) => handleSelection(setB6, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {COLORS.filter((c) => c.tempCoeff !== null).map((c) => (
                    <option key={c.name} value={c.name}>{c.name} ({c.tempCoeff} ppm)</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Readout panel */}
        <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ RESISTANCE VALUE ]</div>
          <div className="font-mono text-4xl font-light text-accent-glow">
            {formatValue(resistance)}
            <span className="text-xl ml-2 font-normal text-foreground/60">±{tolerance}%</span>
          </div>
          {tempCo !== null && (
            <div className="font-mono text-xs text-accent mt-2">
              Temperature Coefficient: {tempCo} ppm/K
            </div>
          )}
        </div>
      </div>

      {/* Right pane: Resistor Graphic & Theory */}
      <div className="lg:col-span-5 space-y-6">
        {/* SVG Resistor representation */}
        <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-6 align-self-start">[ PHYSICAL MODEL ]</div>
          
          <svg viewBox="0 0 260 100" className="w-full h-24 max-w-[280px]">
            {/* Lead Wires */}
            <line x1="10" y1="50" x2="60" y2="50" stroke="#7A8B99" strokeWidth="3.5" />
            <line x1="200" y1="50" x2="250" y2="50" stroke="#7A8B99" strokeWidth="3.5" />

            {/* Resistor Body */}
            <rect x="50" y="30" width="160" height="40" fill="#E6D3B3" rx="5" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
            
            {/* Color Bands */}
            {bands === 4 ? (
              <>
                <rect x="75" y="30" width="8" height="40" fill={hex1} />
                <rect x="105" y="30" width="8" height="40" fill={hex2} />
                <rect x="135" y="30" width="8" height="40" fill={hex3} />
                <rect x="175" y="30" width="8" height="40" fill={hex4} />
              </>
            ) : bands === 5 ? (
              <>
                <rect x="70" y="30" width="8" height="40" fill={hex1} />
                <rect x="95" y="30" width="8" height="40" fill={hex2} />
                <rect x="120" y="30" width="8" height="40" fill={hex3} />
                <rect x="145" y="30" width="8" height="40" fill={hex4} />
                <rect x="180" y="30" width="8" height="40" fill={hex5} />
              </>
            ) : (
              <>
                <rect x="65" y="30" width="8" height="40" fill={hex1} />
                <rect x="88" y="30" width="8" height="40" fill={hex2} />
                <rect x="110" y="30" width="8" height="40" fill={hex3} />
                <rect x="132" y="30" width="8" height="40" fill={hex4} />
                <rect x="160" y="30" width="8" height="40" fill={hex5} />
                <rect x="185" y="30" width="8" height="40" fill={hex6} />
              </>
            )}
          </svg>
        </div>

        {/* Theory */}
        <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ HOW TO READ ]</div>
          <p>
            Read bands from <strong>left to right</strong>. The first band is the one closest to one end of the resistor.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>4-band</strong>: Digit 1, Digit 2, Multiplier, Tolerance.</li>
            <li><strong>5-band</strong>: Digit 1, Digit 2, Digit 3, Multiplier, Tolerance.</li>
            <li><strong>6-band</strong>: Adds Temperature Coefficient (ppm/K) at the end.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
