# ELCS Website — Full Content Scrape

> All visible text content from every page and section of the site.

---

## NAVBAR (appears on all pages)

- **Logo:** ELCS (image: ELCS_final_logo.png)
- **Nav Links:** iT Talk | Progress | Login *(or: [user email] | Profile | Logout when logged in)*
- **Right side:** 🛒 Cart icon | **Products** button

---

## PAGE: Home (`/`)

### Section 1 — Hero / About

**Heading:** About

**Body text:**
> At ELCS, we design and manufacture future-ready embedded modules, control systems, and connectivity devices built with precision and quality.
> Our mission is to simplify hardware development by offering plug-and-play modules, ready-to-use PCB designs, and custom embedded solutions that help engineers, makers, and industries innovate faster.
> Every product comes with complete 3D models, technical documentation, and full support files, making integration easy for everyone from beginners to professionals.
> We follow recognized industry standards such as IPC design rules, RoHS compliance, and ESD-safe processes, ensuring reliable and robust performance in real-world applications.
> At ELCS, we aim to make advanced embedded technology accessible, allowing everyone to build smarter, safer, and more efficient systems.

*(A video plays alongside this text — `/videos/about.mp4`)*

### Section 2 — Care / Infographic

- Displays a full-width infographic image (`/images/infographic.png`)

### Section 3 — Partners

**Heading:** Partnered with

**Body:** coming soon...

---

## PAGE: Products (`/products`)

**Page heading:** Products

- Category filter buttons (dynamic, pulled from database — e.g. "All" + category names)
- Product grid cards, each showing:
  - Product image
  - Product name
  - Product description
  - **Download Manual** button *(login required)*
  - **Add to Cart 🛒** button *(login required)*

*(Products are stored in Firestore — actual product names, descriptions, and categories are database-driven.)*

---

## PAGE: iT Talk (`/ittalk`)

### Header

**Heading:** Our Tools

**Subheading:** Explore our range of electronics calculators and design tools

### Sidebar label: Tools

---

### Tool 1 — Voltage Divider Calculator

**Title:** Voltage Divider Calculator – Formula, Theory & Online Tool

**Description:** A voltage divider is a simple and widely used electronic circuit that reduces a higher input voltage to a lower output voltage using two resistors connected in series.

#### Theory

**What is a Voltage Divider?**
A voltage divider is a simple and widely used electronic circuit that reduces a higher input voltage to a lower output voltage using two resistors connected in series.

**It is commonly used in:**
1. Signal level reduction
2. ADC input scaling (microcontrollers)
3. Sensor interfacing
4. Reference voltage generation

**How It Works:**
- In a voltage divider, the same current flows through both resistors because they are in series.
- The voltage drop across each resistor depends on its resistance value.
- Higher resistance → higher voltage drop
- Lower resistance → lower voltage drop
- By choosing proper resistor values, we can get the desired output voltage.

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| Vin | Input Voltage (V) |
| Vout | Output Voltage (V) |
| R1, R2 | Resistor values (Ω) |

**Key Features:** Calculate Vout from Vin, R1, R2 | Calculate Vin from Vout, R1, R2 | Calculate R1 from Vin, Vout, R2 | Calculate R2 from Vin, Vout, R1 | Real-time calculation

**Specifications:**
| | |
|--|--|
| Formula | Vout = Vin × (R2 / (R1 + R2)) |
| Inputs | Vin, R1, R2, Vout |
| Output | Unknown value |
| Precision | Up to 6 decimal places |
| Units | Volts, Ohms |

---

### Tool 2 — Resistor Color Code Calculator

**Title:** Resistor Color Code Calculator – Decode Resistor Values Instantly

**Description:** The Resistor Color Code Calculator helps you quickly identify resistor values from their color bands. Simply select the colors and get the resistance value with tolerance. You can also reverse calculate - enter a resistance value and get the corresponding color code. Supports 4-band, 5-band, and 6-band resistors including temperature coefficient for precision resistors.

#### Theory

**What is Resistor Color Code?**
Resistor color codes are a standardized system of colored bands painted on resistors to indicate their resistance value, tolerance, and sometimes temperature coefficient. This system allows quick identification without needing measuring equipment.

**Common Applications:**
1. Quick resistor identification in circuits
2. Verifying component values during assembly
3. Selecting correct replacement resistors
4. Educational and learning purposes

**How It Works:**
- Each color represents a specific digit (0-9) or multiplier value
- 4-band resistors: 1st digit + 2nd digit + multiplier + tolerance
- 5-band resistors: 1st digit + 2nd digit + 3rd digit + multiplier + tolerance
- 6-band resistors: 3 digits + multiplier + tolerance + temperature coefficient
- Read bands from left to right, starting from the band closest to one end

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| D1 | First color band value (0-9) |
| D2 | Second color band value (0-9) |
| Multiplier | Power of 10 (×1, ×10, ×100, etc.) |
| Tolerance | Accuracy range (±%) |

**Formulas:**
- 4-band: Resistance = (D1 × 10 + D2) × Multiplier
- 5-band: Resistance = (D1 × 100 + D2 × 10 + D3) × Multiplier

**Key Features:** 4, 5, and 6-band support | Reverse color code lookup | Tolerance calculation | Temperature coefficient (6-band) | Visual resistor display

**Specifications:**
| | |
|--|--|
| Band Types | 4, 5, 6 bands |
| Range | 0.1Ω - 99MΩ |
| Tolerance | ±0.05% to ±20% |
| Temp Coefficient | Available for 6-band |
| Output | Resistance, Tolerance |

---

### Tool 3 — Series & Parallel Resistor Calculator

**Title:** Series & Parallel Resistor Calculator – Find Equivalent Resistance

**Description:** The Series and Parallel Resistor Calculator computes the equivalent resistance for any combination of resistors. For series connections, resistances simply add up. For parallel connections, the calculator uses the reciprocal formula. You can add multiple resistors and see real-time results. Perfect for circuit design and troubleshooting.

#### Theory

**What are Series and Parallel Resistors?**
In electronic circuits, resistors can be connected in series, parallel, or a combination of both. These configurations are used to control current, adjust resistance, and distribute voltage according to circuit requirements.

**Understanding these configurations is essential for:**
1. Circuit design and analysis
2. Power distribution
3. Current limiting
4. Sensor and signal conditioning
5. Load balancing

**Series Connection:**
In a series connection, resistors are connected end-to-end, so the same current flows through all resistors.
- Same current through all resistors
- Total resistance increases
- Voltage divides across resistors
- Formula: R_total = R₁ + R₂ + R₃ + ...

**Parallel Connection:**
In a parallel connection, all resistors are connected across the same two points, so the voltage across each resistor is the same.
- Same voltage across all resistors
- Total resistance decreases
- Current divides between resistors
- Formula: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...
- Two resistor formula: R_total = (R₁ × R₂) / (R₁ + R₂)

**Rules:**
- Series resistance is always greater than the largest resistor
- Parallel resistance is always smaller than the smallest resistor
- Use series resistors to increase resistance
- Use parallel resistors to reduce resistance or increase current capacity

**Key Features:** Series calculation | Parallel calculation | Multiple resistor support | Add/remove resistors | Visual circuit diagram

**Specifications:**
| | |
|--|--|
| Series | Rtotal = R1 + R2 + ... + Rn |
| Parallel | 1/Rt = 1/R1 + 1/R2 + ... + 1/Rn |
| Max Resistors | Up to 10 |
| Units | Ω, kΩ, MΩ |
| Output | Equivalent resistance |

---

### Tool 4 — RC Low Pass & High Pass Filter Calculator

**Title:** RC Low-Pass & High-Pass Filter Calculator – Design RC Filters

**Description:** The RC Filter Calculator helps you design passive first-order filters. For low-pass filters, frequencies below the cutoff pass through while higher frequencies are attenuated. High-pass filters do the opposite. Enter any two values (R, C, or cutoff frequency) and calculate the third. Includes frequency response visualization.

#### Theory

**What is an RC Filter?**
An RC filter is a basic analog circuit made using a resistor (R) and a capacitor (C). It is used to control which frequencies pass through a circuit and which are blocked. RC filters are simple, low-cost, and widely used in electronic systems.

**Common Applications:**
1. Noise reduction
2. Signal smoothing
3. Audio processing
4. Sensor signal filtering
5. ADC input conditioning

**How It Works:**
*(No explicit "how it works" list — theory is split into Low-Pass and High-Pass sections)*

**Low-Pass Filter (LPF):**
A Low-Pass Filter (LPF) allows low-frequency signals to pass and attenuates high-frequency signals. It is mainly used to remove high-frequency noise from signals.
- Circuit: Resistor R connected in series with input, Capacitor C connected from output to ground. Output voltage taken across the capacitor.
- Uses: Removing noise from sensor signals | Smoothing PWM signals to analog voltage | Audio bass filtering | ADC input protection

**High-Pass Filter (HPF):**
A High-Pass Filter (HPF) allows high-frequency signals to pass and blocks low-frequency (DC) signals. It is commonly used to remove DC offset and slow variations.
- Circuit: Capacitor C connected in series with input, Resistor R connected from output to ground. Output voltage taken across the resistor.
- Uses: Removing DC offset | Audio treble filtering | Signal coupling between stages | Vibration and motion sensing

**Formula:** fc = 1 / (2πRC)

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| R | Resistance (Ω) |
| C | Capacitance (F) |
| fc | Cutoff Frequency (Hz) |

**Notes:**
- RC filters are first-order filters
- Attenuation rate is 20 dB/decade
- Cutoff frequency depends on both R and C
- Output amplitude changes gradually, not suddenly
- At cutoff frequency, output voltage drops to 70.7% of input

**Key Features:** Low-pass filter design | High-pass filter design | Cutoff frequency calculation | Component value calculation | Frequency response graph

**Specifications:**
| | |
|--|--|
| Formula | fc = 1 / (2πRC) |
| Rolloff | -20dB/decade |
| Frequency Range | 0.1Hz - 10MHz |
| Components | Resistor, Capacitor |
| Output | Cutoff frequency, R, C values |

---

### Tool 5 — Ohm's Law Calculator

**Title:** Ohm's Law Calculator – Voltage, Current & Resistance

**Description:** The Ohm's Law Calculator is a fundamental electronics tool that applies V = IR and P = VI relationships. Enter any two known values (voltage, current, resistance, or power) and instantly calculate the remaining values. Essential for circuit analysis, component selection, and electrical troubleshooting.

#### Theory

**What is Ohm's Law?**
Ohm's Law is one of the most fundamental rules in electronics. It defines the relationship between Voltage (V), Current (I), and Resistance (R) in an electrical circuit. It states that the current flowing through a conductor is directly proportional to the voltage applied and inversely proportional to the resistance.

**Common Uses of Ohm's Law:**
1. Selecting resistor values for LEDs
2. Calculating current consumption
3. Power supply design
4. Circuit troubleshooting
5. Battery and load calculations

**Formulas:**
- Voltage: V = I × R
- Current: I = V / R
- Resistance: R = V / I

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| V | Voltage (Volts, V) |
| I | Current (Amperes, A) |
| R | Resistance (Ohms, Ω) |

**Worked Examples:**
- Find Current: V = 12V, R = 6Ω → I = V/R = 12/6 = **2 A**
- Find Voltage: I = 0.5A, R = 10Ω → V = I × R = 0.5 × 10 = **5 V**
- Find Resistance: V = 9V, I = 0.3A → R = V/I = 9/0.3 = **30 Ω**

**Notes:**
- Ohm's Law applies to linear components (resistors)
- It does not directly apply to diodes, transistors, or ICs
- Excess current can damage components
- Always check power rating of resistors

**Key Features:** Voltage calculation (V = IR) | Current calculation (I = V/R) | Resistance calculation (R = V/I) | Power calculation (P = VI) | All formulas in one tool

**Specifications:**
| | |
|--|--|
| Ohm's Law | V = I × R |
| Power | P = V × I = I²R = V²/R |
| Voltage Range | mV to kV |
| Current Range | μA to kA |
| Output | V, I, R, P values |

---

### Tool 6 — Capacitor Charge Time & RC Time Constant

**Title:** Capacitor Charging Calculator – RC Time Constant & Voltage

**Description:** When a capacitor is connected to a voltage source through a resistor, it does not charge instantly. Instead, the voltage across the capacitor increases gradually over time. This calculator determines the RC time constant (τ), capacitor voltage at any time t, and shows the charging behavior of the RC circuit.

#### Theory

**What is Capacitor Charging?**
When a capacitor is connected to a voltage source through a resistor, it does not charge instantly. Instead, the voltage across the capacitor increases gradually over time. This charging behavior depends on the resistance (R), the capacitance (C), and the applied voltage (Vin). The rate at which the capacitor charges is determined by the Time Constant (τ).

**Applications of RC Charging Circuits:**
1. Timer circuits (like 555 timer)
2. Power-on delay circuits
3. Signal filtering
4. Debouncing circuits
5. Analog waveform generation
6. Soft start circuits

**How It Works:**
- A resistor (R) is connected in series with a capacitor (C)
- Input voltage (Vin) is applied across R + C
- Output is taken across the capacitor
- The capacitor charges gradually following an exponential curve
- After 5 time constants (5τ), the capacitor is considered fully charged (~99.3%)

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| Vc(t) | Capacitor voltage at time t (V) |
| Vin | Input Voltage (V) |
| R | Resistance (Ω) |
| C | Capacitance (F) |
| t | Time (seconds) |
| τ (Tau) | Time Constant = R × C (seconds) |
| e | Euler's constant (2.718) |

**Charging Table:**
| Time | Voltage |
|------|---------|
| 1τ | 63.2% of Vin |
| 2τ | 86.5% of Vin |
| 3τ | 95.0% of Vin |
| 4τ | 98.2% of Vin |
| 5τ | 99.3% (Fully charged) |

**Worked Example:**
Given: Vin = 5V, R = 10kΩ, C = 100µF
- Calculate Time Constant: τ = R × C = 10,000 × 0.0001 = 1 second
- Voltage after 1 second (1τ): Vc = 5 × (1 - e⁻¹) = 5 × (1 - 0.368) ≈ 3.16V
- Conclusion: After 1 second, the capacitor reaches ~63% of 5V (3.16V). After 5 seconds (5τ), it is almost fully charged (~5V).

**Key Features:** Time constant (τ) calculation | Capacitor voltage at any time t | Charging time table (1τ to 5τ) | Worked example with step-by-step | Interactive RC charging calculator

**Specifications:**
| | |
|--|--|
| Time Constant | τ = R × C |
| Charging Formula | Vc(t) = Vin × (1 - e^(-t/RC)) |
| Full Charge | ~5τ (99.3%) |
| At 1τ | 63.2% of Vin |
| Output | τ, Vc(t), charging table |

---

### Tool 7 — PCB Trace Width & Current Calculator

**Title:** PCB Trace Width Calculator – IPC-2221 Current & Width Tool

**Description:** PCB trace width is the width of the copper track on a printed circuit board that carries electrical current. If the trace is too thin for the current, it will heat up, voltage drop increases, copper may burn, and PCB reliability reduces. Choosing the correct trace width is important for safe and stable circuit operation.

#### Theory

**What is PCB Trace Width?**
PCB trace width is the width of the copper track on a printed circuit board that carries electrical current. If the trace is too thin, it heats up, voltage drop increases, and copper may burn. If the trace is wider, there is less heating, lower resistance, and better reliability. Choosing the correct trace width is critical for safe and stable circuit operation.

**Applications of PCB Trace Width Design:**
1. Power supply PCB design
2. Battery-powered devices
3. Motor driver circuits
4. LED power circuits
5. DC-DC converter layouts

**How It Works:**
- Current flowing through the trace determines minimum width needed
- Copper thickness (oz/ft²) affects current-carrying capacity
- Allowed temperature rise (°C) sets the thermal limit
- External layers dissipate heat better than internal layers
- IPC-2221 standard provides conservative, reliable calculations

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| I | Current (Amps) |
| ΔT | Temperature rise (°C) |
| A | Cross-sectional area (mil²) |
| k | Layer constant (0.048 external, 0.024 internal) |
| W | Trace width (mil or mm) |
| T | Copper thickness (mil) |

**Copper Thickness Reference:**
| Weight | Thickness |
|--------|-----------|
| 1 oz | 35 µm (1.378 mil) |
| 2 oz | 70 µm (2.756 mil) |
| 3 oz | 105 µm (4.134 mil) |

**Design Tips:**
- Always add 20–30% safety margin to calculated width
- Use polygon/copper pour for high current paths
- For >5A, consider using parallel traces
- Keep high-current traces as short as possible
- IPC-2221 gives conservative values — real results depend on airflow and PCB stackup

**Worked Example:**
Given: Current = 2A, Copper = 1 oz, Temp Rise = 10°C, External layer
- Calculate cross-sectional area from IPC formula: A = (I / (k × ΔT^0.44))^(1/0.725) = (2 / (0.048 × 10^0.44))^(1/0.725) ≈ 66.2 mil²
- Calculate trace width: Width = A / Thickness = 66.2 / 1.378 ≈ 48 mil ≈ 1.22 mm
- Conclusion: For 2A on an external 1oz copper layer with 10°C rise, you need approximately 1.22 mm (48 mil) trace width.

**Key Features:** IPC-2221 compliant calculations | Internal & external layer support | Trace width from current (and reverse) | Resistance per cm estimation | Auto unit conversion (mil ↔ mm)

**Specifications:**
| | |
|--|--|
| Standard | IPC-2221 |
| Formula | I = k × ΔT^0.44 × A^0.725 |
| Copper Weights | 1oz, 2oz, 3oz |
| Temp Rise | 5°C - 100°C |
| Output | Width (mm/mil), Area, Resistance |

---

### Tool 8 — Battery Life Calculator

**Title:** Battery Life Calculator – Estimate Runtime for Any Device

**Description:** Battery life is the estimated amount of time a battery can power a device before it needs recharging or replacement. It depends on battery capacity, load current consumption, operating conditions, and circuit efficiency. This calculator helps estimate how long your device will run on a given battery.

#### Theory

**What is Battery Life?**
Battery life is the estimated amount of time a battery can power a device before it needs recharging or replacement. It depends on battery capacity (mAh or Ah), load current consumption (mA or A), operating conditions, and efficiency of the circuit. This calculator helps estimate runtime for both continuous and duty-cycled loads.

**Common Applications:**
1. ESP8266 / ESP32 projects
2. IoT sensor nodes
3. GPS trackers
4. Portable devices
5. Wireless sensors
6. R&D prototypes

**How It Works:**
- Battery capacity (mAh) divided by load current (mA) gives runtime in hours
- Real batteries are not 100% efficient — an efficiency factor (70–90%) is applied
- For duty-cycled devices, average current is calculated from active and sleep periods
- Battery chemistry affects nominal voltage and discharge behavior
- Higher discharge rates reduce effective capacity

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| Capacity | Battery capacity (mAh or Ah) |
| I_load | Load current (mA or A) |
| η (Efficiency) | Battery efficiency factor (0.7–0.9) |
| I_active | Active mode current (mA) |
| T_active | Active time per cycle (seconds) |
| I_sleep | Sleep mode current (mA) |
| T_sleep | Sleep time per cycle (seconds) |
| I_avg | Weighted average current (mA) |

**Battery Chemistry Reference:**
| Type | Voltage | Notes |
|------|---------|-------|
| Li-ion | 3.7V nominal (4.2V full) | Most common for portable devices |
| Lead-acid | 2.0V per cell (12V battery) | Used in UPS, vehicles |
| LiFePO4 | 3.2V nominal | Safer, longer cycle life |
| NiMH | 1.2V per cell | Rechargeable AA/AAA |

**Engineering Notes:**
- Li-ion nominal voltage = 3.7V, full charge = 4.2V
- Capacity reduces at high discharge current (C-rate)
- Temperature affects battery performance significantly
- Always add 20–30% safety margin to estimated runtime
- Deep discharge shortens battery cycle life

**Worked Example (Basic):**
Given: Battery = 2000 mAh, Load Current = 200 mA
- Basic battery life: 2000 / 200 = 10 hours
- With 85% efficiency: (2000 × 0.85) / 200 = 8.5 hours
- Conclusion: The device will run approximately 8.5 hours with efficiency losses accounted for.

**Worked Example (IoT / Duty Cycle):**
Given: Active: 80mA × 5s, Sleep: 0.05mA × 55s, Cycle: 60s, Battery: 2000mAh
- Calculate average current: I_avg = (80 × 5 + 0.05 × 55) / 60 ≈ 6.7 mA
- Calculate battery life: Life = 2000 / 6.7 ≈ 298 hours ≈ 12.4 days
- Conclusion: Using duty cycling, the same 2000mAh battery lasts ~12 days instead of just 10 hours!

**Key Features:** Basic & advanced (IoT) modes | Efficiency factor support | Duty cycle average current | Battery chemistry selection | Power consumption in Watts & Wh

**Specifications:**
| | |
|--|--|
| Basic Formula | Life = Capacity / Current |
| Advanced | Life = (Capacity × η) / I_avg |
| Avg Current | I_avg = (I_act×T_act + I_slp×T_slp) / T_total |
| Capacity Units | mAh, Ah |
| Output | Hours, days, power (W, Wh) |

---

### Tool 9 — Op-Amp Voltage & Gain Calculator

**Title:** Op-Amp Voltage Amplifier & Gain Calculator – Inverting & Non-Inverting

**Description:** An Operational Amplifier (Op-Amp) is a high-gain voltage amplifier used to amplify small input signals. It amplifies the difference between its two input terminals: Non-inverting (+) and Inverting (–). This calculator covers inverting and non-inverting amplifier configurations with gain, output voltage, and dB calculations.

#### Theory

**What is an Operational Amplifier (Op-Amp)?**
An Operational Amplifier (Op-Amp) is a high-gain voltage amplifier used to amplify small input signals. It amplifies the difference between its two input terminals — the non-inverting (+) and inverting (–) inputs. Op-amps are fundamental building blocks in analog electronics.

**Op-Amp Applications:**
1. Sensor signal conditioning
2. Audio amplification & microphone preamps
3. ADC signal scaling
4. Active filters
5. Voltage buffering
6. Signal conditioning circuits

**How It Works:**
- Inverting amplifier: input applied to (–) terminal, output is 180° phase shifted
- Non-inverting amplifier: input applied to (+) terminal, output is in phase
- Gain is set by external resistor ratio (Rf and Rin or Rg)
- Output voltage cannot exceed the supply rails (Vcc+ and Vcc–)
- Bandwidth reduces at higher gain (Gain-Bandwidth Product)

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| Av | Voltage Gain (dimensionless ratio) |
| Rf | Feedback Resistor (Ω) |
| Rin | Input Resistor — inverting config (Ω) |
| Rg | Ground Resistor — non-inverting config (Ω) |
| Vin | Input Voltage (V) |
| Vout | Output Voltage (V) |
| Gain (dB) | 20 × log₁₀(|Av|) |

**Inverting Configuration:**
In the inverting configuration, the input signal is applied to the inverting terminal (–) through an input resistor (Rin). The feedback resistor (Rf) connects the output back to the inverting terminal. The non-inverting terminal (+) is connected to ground.
- Gain Formula: Av = –Rf / Rin
- Output Formula: Vout = –(Rf / Rin) × Vin
- Circuit: Vin → Rin → (–) terminal | Rf from Output to (–) terminal | (+) terminal connected to Ground

**Non-Inverting Configuration:**
In the non-inverting configuration, the input signal is applied directly to the non-inverting terminal (+). The feedback resistor (Rf) connects the output to the inverting terminal (–), and a ground resistor (Rg) connects the inverting terminal to ground.
- Gain Formula: Av = 1 + (Rf / Rg)
- Output Formula: Vout = (1 + Rf / Rg) × Vin
- Circuit: Vin → (+) terminal | Rf from Output to (–) terminal | Rg from (–) terminal to Ground

**Practical Notes:**
- Output voltage cannot exceed supply voltage (rail clipping)
- Rail-to-rail op-amps needed for 3.3V systems
- Bandwidth reduces at high gain (GBP = Gain × Bandwidth)
- Slew rate limits high-frequency signals
- Always add decoupling capacitors near supply pins

**Worked Example — Inverting:**
Given: Vin = 1V, Rin = 10kΩ, Rf = 100kΩ
- Calculate Gain: Av = –Rf / Rin = –100k / 10k = –10
- Calculate Output Voltage: Vout = –10 × 1V = –10V (limited by supply rails)
- Conclusion: The inverting amplifier gives a gain of –10 with 180° phase inversion.

**Worked Example — Non-Inverting:**
Given: Vin = 0.5V, Rf = 90kΩ, Rg = 10kΩ
- Calculate Gain: Av = 1 + Rf/Rg = 1 + 90k/10k = 1 + 9 = 10
- Calculate Output Voltage: Vout = 10 × 0.5V = 5V
- Conclusion: The non-inverting amplifier gives a gain of +10 with no phase inversion.

**Key Features:** Inverting & non-inverting modes | Voltage gain (Av) calculation | Gain in dB | Output voltage calculation | Supply rail clipping warning

**Specifications:**
| | |
|--|--|
| Inverting Gain | Av = –Rf / Rin |
| Non-Inverting | Av = 1 + Rf / Rg |
| Gain in dB | 20 × log₁₀(|Av|) |
| Output | Vout = Gain × Vin |
| Clipping | Supply rail warning |

---

### Tool 10 — 555 Timer Circuit & Delay Calculator

**Title:** 555 Timer Calculator – Monostable & Astable Mode Design Tool

**Description:** The 555 Timer is a very popular and versatile timer IC used to generate time delays, square wave oscillations, PWM signals, and pulse generation. It works based on RC (Resistor-Capacitor) charging and discharging. This calculator covers both Monostable (one-shot delay) and Astable (continuous oscillation) modes.

#### Theory

**What is a 555 Timer IC?**
The 555 Timer is a very popular and versatile timer IC used to generate time delays, square wave oscillations, PWM signals, pulse generation, and LED flashing circuits. It works based on RC (Resistor-Capacitor) charging and discharging, and operates in two main modes: Monostable (one-shot pulse) and Astable (continuous oscillation).

**555 Timer Applications:**
1. Power-on delay circuits
2. Push-button timers
3. LED blinker / flasher circuits
4. Tone and frequency generators
5. PWM signal generation
6. Relay delay and auto switch-off

**How It Works:**
- Monostable: generates a single timed pulse when triggered (one-shot)
- Astable: generates a continuous square wave (oscillator)
- Timing is set by external resistor(s) and capacitor values
- RC charging determines HIGH time, RC discharging determines LOW time
- Output is at Pin 3, can drive LEDs, relays (via transistor), buzzers

**Formula Variables:**
| Symbol | Description |
|--------|-------------|
| T | Time delay or total period (seconds) |
| R | Timing resistor — monostable (Ω) |
| R1 | Resistor between Vcc and Pin 7 — astable (Ω) |
| R2 | Resistor between Pin 7 and Pins 6&2 — astable (Ω) |
| C | Timing capacitor (F) |
| f | Frequency (Hz) |
| Duty Cycle | (T_HIGH / T_total) × 100% |

**Monostable Mode:**
In Monostable mode, the output gives one pulse when triggered. The pulse width (time delay) depends on R and C. Used for delay circuits, push-button timers, relay delay, and automatic switch-off.
- Formula: T = 1.1 × R × C
- Circuit: R connected between Vcc and Discharge (Pin 7) | C connected from Threshold (Pin 6) to Ground | Trigger at Pin 2 | Output at Pin 3

**Astable Mode:**
In Astable mode, the output continuously switches between HIGH and LOW, generating a square wave. Used for LED blinkers, tone generators, clock signals, and PWM.
- T_H = 0.693 × (R1 + R2) × C
- T_L = 0.693 × R2 × C
- T = T_H + T_L = 0.693 × (R1 + 2×R2) × C
- f = 1.44 / ((R1 + 2×R2) × C)
- Duty Cycle = T_H / T × 100%
- Circuit: R1 between Vcc and Pin 7 | R2 between Pin 7 and Pins 6 & 2 | C from Pins 6 & 2 to Ground | Output at Pin 3

**Practical Notes:**
- Standard 555 minimum R ≈ 1kΩ
- For long delays, use large capacitors (electrolytic)
- Electrolytic capacitor leakage affects accuracy for long timings
- CMOS 555 (like TLC555) gives better precision and lower power
- Maximum output current ≈ 200mA (use transistor for relay loads)

**Worked Example — Monostable:**
Given: R = 100kΩ, C = 100µF
- Calculate Time Delay: T = 1.1 × 100,000 × 0.0001 = 11 seconds
- Conclusion: Output stays HIGH for 11 seconds after trigger.

**Worked Example — Astable:**
Given: R1 = 10kΩ, R2 = 10kΩ, C = 100µF
- Calculate HIGH & LOW times: T_H = 0.693 × (10k + 10k) × 100µF = 1.386s, T_L = 0.693 × 10k × 100µF = 0.693s
- Calculate Period & Frequency: T = 1.386 + 0.693 = 2.079s, f = 1/2.079 ≈ 0.48 Hz
- Conclusion: LED blinks about once every 2 seconds with ~67% duty cycle.

**Key Features:** Monostable delay calculator | Astable oscillator calculator | Frequency & duty cycle | HIGH/LOW time breakdown | Practical design notes

**Specifications:**
| | |
|--|--|
| Monostable | T = 1.1 × R × C |
| Astable Period | T = 0.693 × (R1 + 2R2) × C |
| Frequency | f = 1.44 / ((R1 + 2R2) × C) |
| Duty Cycle | (R1+R2) / (R1+2R2) × 100% |
| Output | Time, frequency, duty cycle |

---

## PAGE: Login (`/login`)

**Heading:** Login

**Form fields:**
- Email address *(placeholder: Enter email)*
- Password *(placeholder: Enter password)*

**Button:** Login

**Link:** Don't have an account? Register

**Error messages (dynamic):**
- "❌ Email not verified. Register once again and check email for latest verification link."
- "Login failed: [error message]"

---

## PAGE: Register (`/register`)

**Heading:** Register Account

**Form fields:**
- Email address *(placeholder: Enter email)*
- Password (min 6 characters) *(placeholder: Enter password)*
- Confirm Password *(placeholder: Re-enter password)*

**Button:** Register

**Link:** Already have an account? Login

**Success message:** ✅ Registration successful! Please check your email to verify.

**Error messages (dynamic):**
- ❌ This email is already registered. Try logging in.
- ❌ Password should be at least 6 characters.
- ❌ Registration failed: [error message]

**Post-registration button:** Resend Verification Email

---

## PAGE: Cart (`/cart`)

**Heading:** Your Cart

**Empty cart state:**
- "Your cart is empty"
- Button: Browse Products

**Cart with items shows:**
- Product image, name, price (₹)
- Quantity controls: − [qty] +
- Subtotal per item (₹)
- ✕ remove button

**Delivery address selection:**
- Heading: Select Delivery Address
- Dropdown: "Select Address" → shows saved addresses as "[name] - [address] ([type])"

**Order summary:**
- Total: ₹[amount]
- Button: **Place Enquiry for further details** *(shows "Placing Enquiry..." while loading)*

**After order placed:**
- Heading: Product Enquiry Placed Successfully!
- "Confirmation email has been sent. Owner will approach you"
- Button: Continue Shopping

**Alert messages:**
- "Please login first"
- "Your cart is empty!"
- "Please select Delivery Address!"
- "Failed to place order"
- "Item added to cart. Go and check once" *(from Products page)*

---

## PAGE: Profile (`/profile`)

**Heading:** User Profile

**Profile card shows:**
- **Full Name:** [name]
- **Company:** [company]
- **Email:** [email]
- **Phone:** [phone]
- Button: Edit Profile

**Edit Profile modal fields:**
- Full Name
- Email *(read-only)*
- Company
- Phone
- Button: Save Changes

**Section heading:** Manage Addresses

**Add address form fields:**
- Name *(placeholder: Name)*
- Full Address *(placeholder: Full Address)*
- Contact *(placeholder: Contact)*
- Type dropdown: Delivery / Invoice
- Button: Add *(or "Update" when editing)*

**Address card shows:**
- [name] ([type])
- 📍 [address]
- 📞 [contact]
- Buttons: Edit | Delete

---

## PAGE: Progress (`/progress`)

*(Page exists in the nav but has no content — blank page)*

---

## FOOTER (appears on all pages)

### Company Address
**ELCS Pvt Ltd**
Ambapuram - 6th line
Vijayawada, AP 520012
India

### Contact
- **Email:** elcs.1126.main@gmail.com
- **WhatsApp:** 7382382685
- **Phone:** 7382382685

### Follow Us
- LinkedIn: https://www.linkedin.com/company/embedded-labs-and-control-systems/?viewAsMember=true
- Instagram: https://www.instagram.com/elcs_electronics?igsh=MWFmdWpjMW9odnV0OA
- YouTube: *(link not set yet)*

### Quick Message (Contact Form)
- Input: Your Name
- Input: Your Email
- Textarea: Your Message
- Button: **Send Message**

### Copyright
© [current year] ELCS Pvt Ltd. All rights reserved.

---

## IMAGES USED ON SITE

| File | Used In |
|------|---------|
| ELCS_final_logo.png | Navbar logo |
| infographic.png | Home page care section |
| about-background.jpg | Background |
| voltage_divider.jpg | iT Talk — Voltage Divider tool |
| Resistor_color_code.png | iT Talk — Resistor Color Code tool |
| Resistor_series_and_parallel.png | iT Talk — Series & Parallel tool |
| RC_low_and_high_ pass_filters.png | iT Talk — RC Filter tool |
| Ohm's Law diagram.png | iT Talk — Ohm's Law tool |
| Capacitor charging infographic with calculator.png | iT Talk — Capacitor Charging tool |
| PCB_tarce_width_Calculator.png | iT Talk — PCB Trace Width tool |
| Battery life calculator infographic.png | iT Talk — Battery Life tool |
| OP-Amp_voltage amplifier.png | iT Talk — Op-Amp tool |
| 555 timer design tool and calculator.png | iT Talk — 555 Timer tool |
| voltage divider caluculator circuit diagram.jpeg | iT Talk — Voltage Divider |
| efftronics-standards-22.webp | (in public/images) |
| logo1.png | (in public/images) |

**Video:** `/videos/about.mp4` — plays on Home page hero section
