"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

type LayerType = "external" | "internal";

export function PcbTraceWidth() {
  const [layerType, setLayerType] = useState<LayerType>("external");
  
  // Inputs
  const [current, setCurrent] = useState("2.5");     // Amps
  const [tempRise, setTempRise] = useState("10");     // °C
  const [thicknessOz, setThicknessOz] = useState("1"); // oz/ft² (1oz = 1.378 mils = 35um)
  const [traceLength, setTraceLength] = useState("100"); // mm

  // Calculated values
  const [solvedWidthMils, setSolvedWidthMils] = useState(0);
  const [solvedWidthMm, setSolvedWidthMm] = useState(0);
  const [solvedAreaMils2, setSolvedAreaMils2] = useState(0);
  const [resistanceOhms, setResistanceOhms] = useState(0);
  const [voltageDropV, setVoltageDropV] = useState(0);
  const [powerLossW, setPowerLossW] = useState(0);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    const i = parseFloat(current) || 0;
    const dt = parseFloat(tempRise) || 0;
    const thOz = parseFloat(thicknessOz) || 0;
    const len = parseFloat(traceLength) || 0;

    if (i <= 0 || dt <= 0 || thOz <= 0 || len <= 0) {
      setErrorMsg("All input values must be positive, non-zero numbers.");
      return;
    }

    // IPC-2221 Constants
    // External: k = 0.048, b = 0.44, c = 0.725
    // Internal: k = 0.024, b = 0.44, c = 0.725
    const k = layerType === "external" ? 0.048 : 0.024;
    const b = 0.44;
    const c = 0.725;

    // Area (mils^2) = ( I / (k * (dT^b)) ) ^ (1 / c)
    const areaMils2 = Math.pow(i / (k * Math.pow(dt, b)), 1 / c);
    setSolvedAreaMils2(areaMils2);

    // Thickness in mils (1 oz = 1.378 mils)
    const thMils = thOz * 1.378;

    // Width (mils) = Area (mils^2) / Thickness (mils)
    const widthMils = areaMils2 / thMils;
    setSolvedWidthMils(widthMils);

    // Convert to mm (1 mil = 0.0254 mm)
    const widthMm = widthMils * 0.0254;
    setSolvedWidthMm(widthMm);

    // Resistivity of copper at 20°C: 1.72e-8 Ohm-meters = 1.72e-5 Ohm-mm
    // Adjusted for temperature: R = R20 * (1 + alpha * (T - 20))
    // We assume working temperature is Ambient (say 25°C) + Temp Rise (dt)
    // T = 25 + dt
    // alpha = 0.00393 per °C
    const tempCoeff = 0.00393;
    const workingTemp = 25 + dt;
    const rho = 1.72e-5 * (1 + tempCoeff * (workingTemp - 20)); // Ohm-mm

    // Cross-sectional Area in mm^2 (1 mil^2 = 0.00064516 mm^2)
    const areaMm2 = areaMils2 * 0.00064516;

    // Resistance = rho * L / A
    const res = (rho * len) / areaMm2;
    setResistanceOhms(res);

    // Voltage Drop = I * R
    setVoltageDropV(i * res);

    // Power Loss = I^2 * R
    setPowerLossW(i * i * res);

  }, [layerType, current, tempRise, thicknessOz, traceLength]);

  const handleLayerChange = (type: LayerType) => {
    TactileAudio.playClick();
    setLayerType(type);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Controls & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-accent/20 bg-card/65 p-5">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ TRACE PLACEMENT ]</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLayerChange("external")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    layerType === "external"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  External Layer
                </button>
                <button
                  onClick={() => handleLayerChange("internal")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    layerType === "internal"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  Internal Layer
                </button>
              </div>
            </div>

            <div className="border border-accent/20 bg-card/65 p-5 flex flex-col justify-center">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-1">[ COPPER THICKNESS ]</div>
              <div className="flex gap-2">
                {["0.5", "1.0", "2.0"].map((oz) => (
                  <button
                    key={oz}
                    onClick={() => handleInputChange(setThicknessOz, oz)}
                    className={`flex-1 py-1 border font-mono text-[9px] cursor-pointer transition-all ${
                      thicknessOz === oz
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-foreground/10 bg-background/20 text-foreground/50"
                    }`}
                  >
                    {oz} oz ({Math.round(parseFloat(oz) * 35)} µm)
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
            <div className="font-mono text-[10px] text-accent tracking-widest">[ TUNING PARAMETERS ]</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Current (A)</label>
                <input
                  type="number"
                  step="any"
                  value={current}
                  onChange={(e) => handleInputChange(setCurrent, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Temp Rise (°C)</label>
                <input
                  type="number"
                  value={tempRise}
                  onChange={(e) => handleInputChange(setTempRise, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Thickness (oz)</label>
                <input
                  type="number"
                  step="any"
                  value={thicknessOz}
                  onChange={(e) => handleInputChange(setThicknessOz, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Length (mm)</label>
                <input
                  type="number"
                  value={traceLength}
                  onChange={(e) => handleInputChange(setTraceLength, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            {errorMsg && (
              <div className="font-mono text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5">
                ERROR: {errorMsg}
              </div>
            )}
          </div>

          {/* Primary Readout */}
          <div className="border border-accent-glow bg-accent/5 p-6 text-center space-y-4">
            <div className="font-mono text-[10px] text-accent tracking-widest">[ MINIMUM RECOMMENDED WIDTH ]</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-r border-foreground/10">
                <div className="font-mono text-4xl font-light text-accent-glow">
                  {solvedWidthMm.toFixed(3)} mm
                </div>
                <div className="font-mono text-[9px] text-foreground/45 mt-1">Metric Trace Width</div>
              </div>
              <div>
                <div className="font-mono text-4xl font-light text-accent-glow">
                  {solvedWidthMils.toFixed(1)} mils
                </div>
                <div className="font-mono text-[9px] text-foreground/45 mt-1">Imperial (1/1000 inch)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Graphic diagram and secondary results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cross Section Schematic */}
          <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ TRACE CROSS-SECTION ]</div>
            
            <svg viewBox="0 0 200 100" className="w-full h-28 max-w-[280px]">
              {/* Substrate FR4 */}
              <rect x="10" y="55" width="180" height="30" fill="var(--color-background)" stroke="var(--color-foreground)" strokeWidth="0.8" opacity="0.15" />
              <text x="100" y="73" textAnchor="middle" fill="var(--color-foreground)" opacity="0.3" fontSize="7" fontFamily="JetBrains Mono">FR-4 SUBSTRATE</text>

              {/* Trace location representations */}
              {layerType === "external" ? (
                <>
                  {/* External copper trace (on top of board) */}
                  <rect x="50" y="35" width="100" height="20" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
                  <path d="M 50 35 L 50 55 L 150 55 L 150 35 Z" fill="var(--color-accent)" opacity="0.15" />
                  
                  {/* Labels */}
                  <text x="100" y="47" textAnchor="middle" fill="var(--color-accent-glow)" fontSize="8" fontFamily="JetBrains Mono">COPPER TRACK</text>
                  
                  {/* Width dimension */}
                  <line x1="50" y1="23" x2="150" y2="23" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.4" />
                  <polygon points="50,23 54,21 54,25" fill="var(--color-foreground)" opacity="0.6" />
                  <polygon points="150,23 146,21 146,25" fill="var(--color-foreground)" opacity="0.6" />
                  <text x="100" y="18" textAnchor="middle" fill="var(--color-foreground)" opacity="0.7" fontSize="7" fontFamily="JetBrains Mono">
                    W = {solvedWidthMm.toFixed(2)} mm
                  </text>

                  {/* Thickness dimension */}
                  <line x1="158" y1="35" x2="158" y2="55" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.4" />
                  <polygon points="158,35 156,39 160,39" fill="var(--color-foreground)" opacity="0.6" />
                  <polygon points="158,55 156,51 160,51" fill="var(--color-foreground)" opacity="0.6" />
                  <text x="164" y="48" fill="var(--color-foreground)" opacity="0.7" fontSize="7" fontFamily="JetBrains Mono">
                    {thicknessOz} oz
                  </text>
                </>
              ) : (
                <>
                  {/* Internal copper trace (embedded inside board) */}
                  {/* Top substrate represent board top boundary */}
                  <line x1="10" y1="20" x2="190" y2="20" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.25" />
                  <text x="100" y="32" textAnchor="middle" fill="var(--color-foreground)" opacity="0.25" fontSize="7" fontFamily="JetBrains Mono">PREPREG / CORE</text>
                  
                  <rect x="50" y="42" width="100" height="13" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
                  <path d="M 50 42 L 50 55 L 150 55 L 150 42 Z" fill="var(--color-accent)" opacity="0.25" />
                  
                  {/* Labels */}
                  <text x="100" y="50" textAnchor="middle" fill="var(--color-accent-glow)" fontSize="7" fontFamily="JetBrains Mono">INTERNAL LAYER</text>

                  {/* Width dimension */}
                  <line x1="50" y1="13" x2="150" y2="13" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.4" />
                  <polygon points="50,13 54,11 54,15" fill="var(--color-foreground)" opacity="0.6" />
                  <polygon points="150,13 146,11 146,15" fill="var(--color-foreground)" opacity="0.6" />
                  <text x="100" y="8" textAnchor="middle" fill="var(--color-foreground)" opacity="0.7" fontSize="7" fontFamily="JetBrains Mono">
                    W = {solvedWidthMm.toFixed(2)} mm
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Secondary Electrical Analysis */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-mono text-[10px] text-foreground/75">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ TRANSMISSION METRICS ]</div>
            <div className="flex justify-between py-1 border-b border-foreground/5">
              <span>Trace Cross-Sectional Area</span>
              <span className="text-accent-glow">{solvedAreaMils2.toFixed(1)} mils²</span>
            </div>
            <div className="flex justify-between py-1 border-b border-foreground/5">
              <span>Trace Resistance ({traceLength}mm)</span>
              <span className="text-accent-glow">{resistanceOhms.toFixed(4)} Ω</span>
            </div>
            <div className="flex justify-between py-1 border-b border-foreground/5">
              <span>Estimated Voltage Drop</span>
              <span className="text-accent-glow">{voltageDropV.toFixed(4)} V</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Dissipated Power Loss</span>
              <span className="text-accent-glow">{powerLossW.toFixed(4)} W</span>
            </div>
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
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">What is PCB Trace Width?</h4>
              <p>
                PCB trace width is the width of the copper track on a printed circuit board that carries electrical current. If the trace is too thin, it heats up, voltage drop increases, and copper may burn. If the trace is wider, there is less heating, lower resistance, and better reliability. Choosing the correct trace width is critical for safe and stable circuit operation.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Applications of PCB Trace Width Design:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Power supply PCB design</li>
                <li>Battery-powered devices</li>
                <li>Motor driver circuits</li>
                <li>LED power circuits</li>
                <li>DC-DC converter layouts</li>
              </ol>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">How It Works:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Current flowing through the trace determines minimum width needed.</li>
                <li>Copper thickness (oz/ft²) affects current-carrying capacity.</li>
                <li>Allowed temperature rise (°C) sets the thermal limit.</li>
                <li>External layers dissipate heat better than internal layers.</li>
                <li>IPC-2221 standard provides conservative, reliable calculations.</li>
              </ul>
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
                      <td className="p-2 border-r border-foreground/10 font-mono">I</td>
                      <td className="p-2">Current (Amps)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">ΔT</td>
                      <td className="p-2">Temperature rise (°C)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">A</td>
                      <td className="p-2">Cross-sectional area (mil²)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">k</td>
                      <td className="p-2">Layer constant (0.048 external, 0.024 internal)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">W</td>
                      <td className="p-2">Trace width (mil or mm)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">T</td>
                      <td className="p-2">Copper thickness (mil)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Copper Thickness Reference:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <thead>
                    <tr className="border-b border-foreground/15 bg-foreground/5 font-mono text-[10px] uppercase text-accent">
                      <th className="p-2 border-r border-foreground/10">Weight</th>
                      <th className="p-2">Thickness</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">1 oz</td>
                      <td className="p-2">35 µm (1.378 mil)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">2 oz</td>
                      <td className="p-2">70 µm (2.756 mil)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">3 oz</td>
                      <td className="p-2">105 µm (4.134 mil)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Design Tips:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Always add 20–30% safety margin to calculated width.</li>
                <li>Use polygon/copper pour for high current paths.</li>
                <li>For &gt; 5A, consider using parallel traces.</li>
                <li>Keep high-current traces as short as possible.</li>
                <li>IPC-2221 gives conservative values — real results depend on airflow and PCB stackup.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Worked Example:</h4>
              <p>
                <strong>Given:</strong> Current = 2A, Copper = 1 oz, Temp Rise = 10°C, External layer
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Calculate cross-sectional area from IPC formula: A = (I / (k × ΔT^0.44))^(1/0.725) = (2 / (0.048 × 10^0.44))^(1/0.725) ≈ 66.2 mil²</li>
                <li>Calculate trace width: Width = A / Thickness = 66.2 / 1.378 ≈ 48 mil ≈ 1.22 mm</li>
                <li><strong>Conclusion:</strong> For 2A on an external 1oz copper layer with 10°C rise, you need approximately 1.22 mm (48 mil) trace width.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Key Features:</h4>
              <p>IPC-2221 compliant calculations | Internal & external layer support | Trace width from current (and reverse) | Resistance per cm estimation | Auto unit conversion (mil ↔ mm)</p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Specifications:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Standard</td>
                      <td className="p-2">IPC-2221</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Formula</td>
                      <td className="p-2 font-mono">I = k × ΔT^0.44 × A^0.725</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Copper Weights</td>
                      <td className="p-2">1oz, 2oz, 3oz</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Temp Rise</td>
                      <td className="p-2">5°C - 100°C</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Output</td>
                      <td className="p-2">Width (mm/mil), Area, Resistance</td>
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
