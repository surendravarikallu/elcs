"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

export function Timer555() {
  const [mode, setMode] = useState<"astable" | "monostable">("astable");

  // Inputs
  const [rA, setRA] = useState("10000");  // R_A (ohms)
  const [rB, setRB] = useState("47000");  // R_B (ohms) - only for astable
  const [cap, setCap] = useState("1e-7"); // C (farads, e.g. 0.1 uF)

  // Calculated values
  const [freq, setFreq] = useState(132.8);
  const [dutyCycle, setDutyCycle] = useState(54.8);
  const [tHigh, setTHigh] = useState(0.0039);
  const [tLow, setTLow] = useState(0.0032);
  const [delay, setDelay] = useState(0.0011); // Monostable pulse duration

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    const ra = parseFloat(rA) || 0;
    const rb = parseFloat(rB) || 0;
    const c = parseFloat(cap) || 0;

    if (ra <= 0 || c <= 0 || (mode === "astable" && rb <= 0)) {
      setErrorMsg("Resistor and capacitor values must be greater than zero.");
      return;
    }

    if (mode === "astable") {
      // f = 1.44 / ((Ra + 2*Rb) * C)
      const denominator = (ra + 2 * rb) * c;
      if (denominator === 0) return;
      const f = 1.44 / denominator;
      setFreq(f);

      // tHigh = 0.693 * (Ra + Rb) * C
      const th = 0.693 * (ra + rb) * c;
      setTHigh(th);

      // tLow = 0.693 * Rb * C
      const tl = 0.693 * rb * c;
      setTLow(tl);

      // Duty Cycle = (Ra + Rb) / (Ra + 2*Rb) * 100
      const dc = ((ra + rb) / (ra + 2 * rb)) * 100;
      setDutyCycle(dc);
    } else {
      // Delay = 1.1 * Ra * C
      const d = 1.1 * ra * c;
      setDelay(d);
    }
  }, [mode, rA, rB, cap]);

  const handleModeChange = (newMode: typeof mode) => {
    TactileAudio.playClick();
    setMode(newMode);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  const formatUnit = (val: number, unit: string): string => {
    if (val === 0 || isNaN(val) || !isFinite(val)) return "N/A";
    if (val >= 1e6) return `${(val / 1e6).toFixed(3)} M${unit}`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(3)} k${unit}`;
    if (val < 1) {
      if (val >= 1e-3) return `${(val * 1e3).toFixed(2)} m${unit}`;
      if (val >= 1e-6) return `${(val * 1e6).toFixed(2)} µ${unit}`;
      if (val >= 1e-9) return `${(val * 1e9).toFixed(2)} n${unit}`;
    }
    return `${val.toFixed(3)} ${unit}`;
  };

  // SVG Waveform generation based on duty cycle
  let wavePoints = "";
  if (mode === "astable") {
    // 3 complete cycles
    const highPct = dutyCycle / 100;
    
    // Total width is 160px (from x=20 to x=180)
    // One cycle takes e.g. 50px
    const cycleW = 50;
    const highW = cycleW * highPct;

    let x = 20;
    wavePoints = `M ${x} 80 `;
    for (let i = 0; i < 3; i++) {
      wavePoints += `L ${x} 30 L ${x + highW} 30 L ${x + highW} 80 L ${x + cycleW} 80 `;
      x += cycleW;
    }
  } else {
    // Monostable shows: Trigger pulse (falling edge), then output pulse (width delay)
    // Total width 160px
    // Pulse starts at x=60 and ends at x=140
    wavePoints = "M 20 80 L 50 80 L 50 30 L 130 30 L 130 80 L 180 80";
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left pane: Controls & Inputs */}
      <div className="lg:col-span-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-accent/20 bg-card/65 p-5">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ IC 555 MODE ]</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange("astable")}
                className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                  mode === "astable"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                Astable (Oscillator)
              </button>
              <button
                onClick={() => handleModeChange("monostable")}
                className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                  mode === "monostable"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                Monostable (One-Shot)
              </button>
            </div>
          </div>

          <div className="border border-accent/20 bg-card/65 p-5 flex flex-col justify-center">
            {mode === "astable" ? (
              <>
                <div className="font-mono text-[10px] text-accent tracking-widest mb-1">[ FREQUENCY OUTPUT ]</div>
                <div className="font-mono text-2xl font-light text-accent-glow">
                  f = {formatUnit(freq, "Hz")}
                </div>
              </>
            ) : (
              <>
                <div className="font-mono text-[10px] text-accent tracking-widest mb-1">[ PULSE DURATION (Td) ]</div>
                <div className="font-mono text-2xl font-light text-accent-glow">
                  Td = {formatUnit(delay, "s")}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
          <div className="font-mono text-[10px] text-accent tracking-widest">[ TUNING PARAMETERS ]</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-foreground/50">Resistor R_A (Ω)</label>
              <input
                type="number"
                value={rA}
                onChange={(e) => handleInputChange(setRA, e.target.value)}
                className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            {mode === "astable" ? (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Resistor R_B (Ω)</label>
                <input
                  type="number"
                  value={rB}
                  onChange={(e) => handleInputChange(setRB, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            ) : (
              <div className="space-y-1 opacity-30 select-none">
                <label className="block font-mono text-[10px] text-foreground/50">Resistor R_B (Disabled)</label>
                <input
                  type="text"
                  disabled
                  value="N/A"
                  className="w-full bg-background border border-foreground/10 py-2 px-3 font-mono text-sm text-foreground/30 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-foreground/50">Capacitor C (F)</label>
              <input
                type="text"
                value={cap}
                placeholder="e.g. 1e-7"
                onChange={(e) => handleInputChange(setCap, e.target.value)}
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

        {/* Readout details */}
        {mode === "astable" && (
          <div className="border border-accent-glow bg-accent/5 p-6 text-center">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-4">[ DETAILED WAVEFORM METRICS ]</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-background/30 border border-foreground/5">
                <div className="font-mono text-[8px] text-foreground/45 uppercase">Duty Cycle</div>
                <div className="font-mono text-lg font-medium text-accent-glow mt-1">{dutyCycle.toFixed(1)} %</div>
              </div>
              <div className="p-3 bg-background/30 border border-foreground/5">
                <div className="font-mono text-[8px] text-foreground/45 uppercase">High Time (t_H)</div>
                <div className="font-mono text-lg font-medium text-accent-glow mt-1">{formatUnit(tHigh, "s")}</div>
              </div>
              <div className="p-3 bg-background/30 border border-foreground/5">
                <div className="font-mono text-[8px] text-foreground/45 uppercase">Low Time (t_L)</div>
                <div className="font-mono text-lg font-medium text-accent-glow mt-1">{formatUnit(tLow, "s")}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right pane: Waveform representation and theory */}
      <div className="lg:col-span-5 space-y-6">
        {/* Waveform graphic */}
        <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[200px]">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ SIMULATED PULSE OUTPUT ]</div>
          
          <svg viewBox="0 0 200 110" className="w-full h-32 max-w-[280px]">
            {/* Grid */}
            <line x1="20" y1="30" x2="180" y2="30" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.1" />
            <line x1="20" y1="55" x2="180" y2="55" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.1" />
            <line x1="20" y1="80" x2="180" y2="80" stroke="var(--color-foreground)" strokeWidth="0.8" opacity="0.3" />
            <line x1="20" y1="20" x2="20" y2="90" stroke="var(--color-foreground)" strokeWidth="0.8" opacity="0.3" />

            <text x="12" y="33" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">Vcc</text>
            <text x="12" y="83" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">GND</text>

            {/* Path */}
            <path d={wavePoints} fill="none" stroke="var(--color-accent-glow)" strokeWidth="1.8" />

            {/* Labels overlay */}
            {mode === "astable" ? (
              <>
                <text x="45" y="23" textAnchor="middle" fill="var(--color-accent)" fontSize="6" fontFamily="JetBrains Mono">t_High</text>
                <text x="70" y="93" textAnchor="middle" fill="var(--color-accent)" fontSize="6" fontFamily="JetBrains Mono">t_Low</text>
              </>
            ) : (
              <>
                <text x="90" y="23" textAnchor="middle" fill="var(--color-accent)" fontSize="6" fontFamily="JetBrains Mono">Td = {formatUnit(delay, "s")}</text>
                {/* Trigger falling edge marker */}
                <circle cx="50" cy="80" r="3" fill="red" opacity="0.6" />
                <text x="50" y="93" textAnchor="middle" fill="var(--color-foreground)" opacity="0.5" fontSize="5" fontFamily="JetBrains Mono">TRIG</text>
              </>
            )}
          </svg>
        </div>

        {/* 555 timing description */}
        <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ DESIGN LAWS ]</div>
          <p>
            The <strong>NE555 Timer</strong> is a highly versatile analog IC used for clock generation, timing delays, and pulse-width modulation.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Astable Mode</strong>: Free-running multivibrator. The capacitor C charges through R_a + R_b and discharges through R_b. The duty cycle is always greater than 50% (t_high &gt; t_low).</li>
            <li><strong>Monostable Mode</strong>: One-shot delay. When a negative trigger pulse is applied to the trigger pin (Pin 2), the output rises to V_cc for the period T_d = 1.1 * R_a * C before discharging.</li>
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
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">What is a 555 Timer IC?</h4>
              <p>
                The 555 Timer is a highly popular and versatile timer IC used to generate time delays, square wave oscillations, PWM signals, pulse generation, and LED flashing circuits. It works based on RC (Resistor-Capacitor) charging and discharging, and operates in two main modes: Monostable (one-shot pulse) and Astable (continuous oscillation).
              </p>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">555 Timer Applications:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Power-on delay circuits</li>
                <li>Push-button timers</li>
                <li>LED blinker / flasher circuits</li>
                <li>Tone and frequency generators</li>
                <li>PWM signal generation</li>
                <li>Relay delay and auto switch-off</li>
              </ol>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">How It Works:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Monostable: generates a single timed pulse when triggered (one-shot)</li>
                <li>Astable: generates a continuous square wave (oscillator)</li>
                <li>Timing is set by external resistor(s) and capacitor values</li>
                <li>RC charging determines HIGH time, RC discharging determines LOW time</li>
                <li>Output is at Pin 3, can drive LEDs, relays (via transistor), or buzzers</li>
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
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">T</td>
                      <td className="p-2">Time delay or total period (seconds)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">R</td>
                      <td className="p-2">Timing resistor &mdash; monostable (&Omega;)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">R1</td>
                      <td className="p-2">Resistor between Vcc and Pin 7 &mdash; astable (&Omega;)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">R2</td>
                      <td className="p-2">Resistor between Pin 7 and Pins 6 &amp; 2 &mdash; astable (&Omega;)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">C</td>
                      <td className="p-2">Timing capacitor (F)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">f</td>
                      <td className="p-2">Frequency (Hz)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Duty Cycle</td>
                      <td className="p-2">(T_HIGH / T_total) &times; 100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Monostable Mode:</h4>
              <p className="mb-2">
                In Monostable mode, the output gives one pulse when triggered. The pulse width (time delay) depends on R and C. Used for delay circuits, push-button timers, relay delay, and automatic switch-off.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Formula:</strong> T = 1.1 &times; R &times; C</li>
                <li><strong>Circuit Path:</strong> R connected between Vcc and Discharge (Pin 7) | C connected from Threshold (Pin 6) to Ground | Trigger at Pin 2 | Output at Pin 3</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Astable Mode:</h4>
              <p className="mb-2">
                In Astable mode, the output continuously switches between HIGH and LOW, generating a square wave. Used for LED blinkers, tone generators, clock signals, and PWM.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>HIGH Time (T_H):</strong> 0.693 &times; (R1 + R2) &times; C</li>
                <li><strong>LOW Time (T_L):</strong> 0.693 &times; R2 &times; C</li>
                <li><strong>Total Period (T):</strong> T_H + T_L = 0.693 &times; (R1 + 2 &times; R2) &times; C</li>
                <li><strong>Frequency (f):</strong> 1.44 / ((R1 + 2 &times; R2) &times; C)</li>
                <li><strong>Duty Cycle:</strong> T_H / T &times; 100%</li>
                <li><strong>Circuit Path:</strong> R1 between Vcc and Pin 7 | R2 between Pin 7 and Pins 6 &amp; 2 | C from Pins 6 &amp; 2 to Ground | Output at Pin 3</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Practical Notes:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Standard 555 minimum R &asymp; 1k&Omega;</li>
                <li>For long delays, use large capacitors (electrolytic)</li>
                <li>Electrolytic capacitor leakage affects accuracy for long timings</li>
                <li>CMOS 555 (like TLC555) gives better precision and lower power</li>
                <li>Maximum output current &asymp; 200mA (use transistor for relay loads)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Worked Example &mdash; Monostable:</h4>
              <p className="mb-1"><strong>Given:</strong> R = 100k&Omega;, C = 100&micro;F</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Calculate Time Delay:</strong> T = 1.1 &times; 100,000 &times; 0.0001 = 11 seconds</li>
                <li><strong>Conclusion:</strong> Output stays HIGH for 11 seconds after trigger.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Worked Example &mdash; Astable:</h4>
              <p className="mb-1"><strong>Given:</strong> R1 = 10k&Omega;, R2 = 10k&Omega;, C = 100&micro;F</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Calculate HIGH &amp; LOW times:</strong> T_H = 0.693 &times; (10k + 10k) &times; 100&micro;F = 1.386s, T_L = 0.693 &times; 10k &times; 100&micro;F = 0.693s</li>
                <li><strong>Calculate Period &amp; Frequency:</strong> T = 1.386 + 0.693 = 2.079s, f = 1/2.079 &asymp; 0.48 Hz</li>
                <li><strong>Conclusion:</strong> LED blinks about once every 2 seconds with &asymp;67% duty cycle.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Key Features:</h4>
              <p>Monostable delay calculator | Astable oscillator calculator | Frequency &amp; duty cycle | HIGH/LOW time breakdown | Practical design notes</p>
            </div>

            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Specifications:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Monostable</td>
                      <td className="p-2 font-mono">T = 1.1 &times; R &times; C</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Astable Period</td>
                      <td className="p-2 font-mono">T = 0.693 &times; (R1 + 2R2) &times; C</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Frequency</td>
                      <td className="p-2 font-mono">f = 1.44 / ((R1 + 2R2) &times; C)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Duty Cycle</td>
                      <td className="p-2 font-mono">(R1+R2) / (R1+2R2) &times; 100%</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Output</td>
                      <td className="p-2">Time, frequency, duty cycle</td>
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
