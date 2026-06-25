/* ═══════════════════════════════════════════════════════════════
   ELCS — Static Product & Solutions Data Registry
   ═══════════════════════════════════════════════════════════════
   Single source of truth for the Products catalog.
   Images live under /public/images/products/
   Datasheets/STEP files live under /public/downloads/
   ═══════════════════════════════════════════════════════════════ */

/* ─────────── Types ─────────── */

export interface ProductCategory {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  coverImage: string;
  productCount: number;
  comingSoon: boolean;
}

export interface ProductItem {
  slug: string;
  name: string;
  sku: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  image: string | null;
  datasheetUrl: string | null;
  stepFileUrl: string | null;
  specs: Record<string, string>;
  tags: string[];
}

export interface Solution {
  slug: string;
  title: string;
  tagline: string;
  coverDescription: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  relatedProductSlugs: string[];
}

/* ─────────── Categories ─────────── */

export const CATEGORIES: ProductCategory[] = [
  {
    slug: "leds-and-switches",
    name: "LEDs and Switches",
    tagline: "Indicate. Control. Connect.",
    description:
      "High-visibility indicator LEDs, addressable LED strips, tactile switches, and joystick modules for user interface and control applications.",
    coverImage: "/images/products/categories/leds-and-switches.png",
    productCount: 4,
    comingSoon: false,
  },
  {
    slug: "level-shifters-protocols",
    name: "Level Shifters & Communication Protocols",
    tagline: "Bridge Voltages. Connect Worlds.",
    description:
      "Bi-directional level shifters and multi-protocol communication modules supporting I2C, SPI, UART, and TTL interfaces.",
    coverImage: "/images/products/categories/level-shifters-protocols.png",
    productCount: 0,
    comingSoon: true,
  },
  {
    slug: "microcontrollers-development-boards",
    name: "Microcontroller Kits & Development Boards",
    tagline: "Build. Program. Innovate.",
    description:
      "High-speed, low-power microcontroller boards and complete development kits for prototyping, learning, and production embedded applications.",
    coverImage: "/images/products/categories/microcontrollers-development-boards.png",
    productCount: 0,
    comingSoon: true,
  },
  {
    slug: "modules",
    name: "Modules",
    tagline: "Plug In. Power Up. Build More.",
    description:
      "EEPROM memory modules, SD card interfaces, solid-state relays, and other essential building blocks for embedded systems.",
    coverImage: "/images/products/categories/modules.png",
    productCount: 4,
    comingSoon: false,
  },
  {
    slug: "power-supplies",
    name: "Power Supplies",
    tagline: "Stable Power. Stronger Projects.",
    description:
      "Step-down converters, dual-rail power modules, and voltage regulators designed for development boards, IoT, robotics, and industrial use.",
    coverImage: "/images/products/categories/power-supplies.png",
    productCount: 2,
    comingSoon: false,
  },
  {
    slug: "zero-pcbs-breakout-boards",
    name: "Zero PCBs & Breakout Boards",
    tagline: "Design It. Break It Out. Build It Better.",
    description:
      "High-quality blank PCBs, USB breakout boards, audio jack breakouts, and battery holders for fast prototyping and custom circuit design.",
    coverImage: "/images/products/categories/zero-pcbs-breakout-boards.png",
    productCount: 7,
    comingSoon: false,
  },
];

/* ─────────── Products ─────────── */

export const PRODUCTS: ProductItem[] = [
  // ── LEDs and Switches ──────────────────────────────────────
  {
    slug: "joystick-switch-module-1114",
    name: "Joystick Switch Module",
    sku: "ELCS-1114",
    categorySlug: "leds-and-switches",
    shortDescription: "Analog 2-axis joystick with integrated push-button switch for directional control.",
    description:
      "The ELCS Joystick Switch Module provides precise analog X/Y-axis positioning with an integrated push-button select function. Based on dual potentiometer output, it delivers smooth proportional control ideal for robotics, gaming controllers, and menu navigation. Standard 4-pin header for plug-and-play integration with Arduino, ESP32, and STM32 boards.",
    image: "/images/products/leds-and-switches/joy_stick_switch_module_1114.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Operating Voltage": "3.3V – 5V DC",
      "Output": "Analog X/Y + Digital Button",
      "Axes": "2 (X, Y) + Push Switch",
      "Interface": "Analog (ADC)",
      "Connector": "4-Pin Male Header",
      "Dimensions": "26 × 34 mm",
    },
    tags: ["Joystick", "Analog", "Switch", "Control", "Input"],
  },
  {
    slug: "laser-module-1115",
    name: "Laser Module",
    sku: "ELCS-1115",
    categorySlug: "leds-and-switches",
    shortDescription: "650nm red laser diode module with adjustable focus for alignment and sensing.",
    description:
      "The ELCS Laser Module emits a focused 650nm red laser beam suitable for alignment, distance indication, and sensor trigger applications. Features a spring-loaded lens for focus adjustment and a simple 2-pin power interface. Compatible with 3.3V and 5V logic systems.",
    image: "/images/products/leds-and-switches/laser_module_1115.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Wavelength": "650nm (Red)",
      "Output Power": "<5mW (Class IIIA)",
      "Operating Voltage": "3.3V – 5V DC",
      "Current Draw": "~30mA",
      "Focus": "Adjustable",
      "Connector": "2-Pin Header (VCC, GND)",
    },
    tags: ["Laser", "650nm", "Optics", "Sensor", "Alignment"],
  },
  {
    slug: "ws2812b-led-matrix-module-1124",
    name: "WS2812B LED Matrix Module",
    sku: "ELCS-1124",
    categorySlug: "leds-and-switches",
    shortDescription: "Individually addressable RGB LED matrix module with WS2812B chipset.",
    description:
      "The ELCS WS2812B LED Matrix Module features individually addressable RGB LEDs arranged in a compact matrix grid. Each LED contains an integrated driver IC, enabling full 24-bit color control via a single data pin. Ideal for scrolling text displays, status indicators, ambient lighting, and creative visual projects. Chainable for larger displays.",
    image: "/images/products/leds-and-switches/ws2812b_led_matrix_module_1124.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "LED Type": "WS2812B (Addressable RGB)",
      "Color Depth": "24-bit (16.7M colors)",
      "Operating Voltage": "5V DC",
      "Data Protocol": "Single-wire NRZ",
      "Current per LED": "~60mA (full white)",
      "Interface": "DIN / DOUT (chainable)",
    },
    tags: ["WS2812B", "RGB", "LED", "Matrix", "NeoPixel", "Addressable"],
  },
  {
    slug: "ws2812b-led-tri-module-1125",
    name: "WS2812B LED Tri Module",
    sku: "ELCS-1125",
    categorySlug: "leds-and-switches",
    shortDescription: "3-LED addressable RGB strip module with WS2812B chipset for compact indicators.",
    description:
      "A compact 3-LED addressable RGB module built with WS2812B LEDs. Perfect for status indicators, notification lights, and small-scale ambient lighting projects. Single data-pin control with cascading support allows chaining multiple modules for extended displays.",
    image: "/images/products/leds-and-switches/ws2812b_led_tri_module_1125.jpeg",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "LED Count": "3 × WS2812B",
      "Color Depth": "24-bit RGB",
      "Operating Voltage": "5V DC",
      "Data Protocol": "Single-wire NRZ",
      "Chainable": "Yes (DIN → DOUT)",
      "Current": "~180mA max (all white)",
    },
    tags: ["WS2812B", "RGB", "LED", "Indicator", "NeoPixel"],
  },

  // ── Modules ────────────────────────────────────────────────
  {
    slug: "eeprom-module-2mb-1116",
    name: "EEPROM Module 2MB",
    sku: "ELCS-1116",
    categorySlug: "modules",
    shortDescription: "2 Megabit I2C EEPROM module for non-volatile data storage.",
    description:
      "The ELCS EEPROM Module provides 2 Megabits (256 KB) of non-volatile I2C-accessible storage for configuration data, calibration values, and small datasets. Features a standard AT24C256-compatible interface with hardware address pins for multi-device I2C bus operation. Write-protect pin included for data integrity.",
    image: "/images/products/modules/eeprom_module_2mb_1116.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Capacity": "2 Mbit (256 KB)",
      "Interface": "I2C (up to 400 kHz)",
      "IC": "AT24C256 compatible",
      "Operating Voltage": "2.7V – 5.5V",
      "Write Cycles": "1,000,000",
      "Data Retention": "100 years",
      "Address Pins": "A0, A1, A2 (8 devices)",
    },
    tags: ["EEPROM", "I2C", "Memory", "Non-volatile", "AT24C256"],
  },
  {
    slug: "sd-card-module-vertical-1117",
    name: "SD Card Module (Vertical)",
    sku: "ELCS-1117",
    categorySlug: "modules",
    shortDescription: "Vertical-mount Micro SD card module with SPI interface for data logging.",
    description:
      "A vertical-mount Micro SD card breakout module with SPI interface for data logging, firmware storage, and file system access. Supports FAT16/FAT32 file systems and cards up to 32 GB. Includes an onboard 3.3V regulator and level shifting for 5V compatibility.",
    image: "/images/products/modules/sd_card_module_vertical_1117.jpeg",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Interface": "SPI (MISO, MOSI, SCK, CS)",
      "Card Format": "Micro SD (TF)",
      "File System": "FAT16 / FAT32",
      "Max Capacity": "32 GB",
      "Operating Voltage": "3.3V – 5V",
      "Orientation": "Vertical mount",
    },
    tags: ["SD Card", "SPI", "Data Logging", "Storage", "FAT32"],
  },
  {
    slug: "sd-card-module-horizontal-1118",
    name: "SD Card Module (Horizontal)",
    sku: "ELCS-1118",
    categorySlug: "modules",
    shortDescription: "Low-profile horizontal Micro SD card module with SPI interface.",
    description:
      "A low-profile horizontal-mount Micro SD card breakout offering the same SPI interface and FAT32 support as its vertical counterpart, but designed for space-constrained enclosures. Built-in voltage regulator and level shifter ensure compatibility with both 3.3V and 5V microcontroller systems.",
    image: "/images/products/modules/sd_card_module_horizontal_1118.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Interface": "SPI (MISO, MOSI, SCK, CS)",
      "Card Format": "Micro SD (TF)",
      "File System": "FAT16 / FAT32",
      "Max Capacity": "32 GB",
      "Operating Voltage": "3.3V – 5V",
      "Orientation": "Horizontal (low-profile)",
    },
    tags: ["SD Card", "SPI", "Data Logging", "Low-profile", "Storage"],
  },
  {
    slug: "ssr-relay-2amps-1119",
    name: "SSR Relay 2A Module",
    sku: "ELCS-1119",
    categorySlug: "modules",
    shortDescription: "2A solid-state relay module for safe, silent DC load switching.",
    description:
      "The ELCS SSR Relay Module provides optically-isolated solid-state switching for DC loads up to 2A. Zero mechanical wear, zero contact bounce, and silent operation make it ideal for motor control, solenoid driving, LED dimming, and automated test equipment. Logic-level compatible trigger input (3.3V / 5V).",
    image: "/images/products/modules/ssr_relay_2amps_1119.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Type": "Solid-State Relay (SSR)",
      "Max Load Current": "2A DC",
      "Max Load Voltage": "40V DC",
      "Trigger Voltage": "3.3V – 5V",
      "Isolation": "Optical (>1kV)",
      "Switching Speed": "<1ms",
      "Quiescent Current": "<5mA",
    },
    tags: ["SSR", "Relay", "Solid-State", "DC Switch", "Isolation"],
  },

  // ── Power Supplies ─────────────────────────────────────────
  {
    slug: "12v-to-5v-1a-module-1126",
    name: "12V to 5V 1A Step-Down Module",
    sku: "ELCS-1126",
    categorySlug: "power-supplies",
    shortDescription: "Compact 12V-to-5V 1A buck converter for efficient voltage regulation.",
    description:
      "A compact, high-efficiency buck converter module that steps down 12V input to a stable 5V output at up to 1A. Built around a synchronous switching regulator for >90% efficiency with low heat dissipation. Ideal for powering microcontrollers, sensors, and peripherals from 12V automotive or industrial supplies.",
    image: "/images/products/power-supplies/12_to_5v_1amp_module_1126.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Input Voltage": "7V – 28V DC",
      "Output Voltage": "5V DC (fixed)",
      "Max Output Current": "1A",
      "Efficiency": ">90%",
      "Topology": "Synchronous Buck",
      "Ripple": "<30mV pk-pk",
      "Protection": "OVP, OCP, Thermal shutdown",
    },
    tags: ["Buck", "Step-down", "12V", "5V", "Power", "Regulator"],
  },
  {
    slug: "12v-to-5v-3v3-rail-1136",
    name: "12V to 5V & 3.3V Breadboard Rail Power",
    sku: "ELCS-1136",
    categorySlug: "power-supplies",
    shortDescription: "Dual-output breadboard power module providing 5V and 3.3V rails from 12V input.",
    description:
      "A dual-output breadboard-compatible power module that takes a 12V DC input and provides regulated 5V and 3.3V power rails simultaneously. Designed to plug directly into standard breadboards, it powers mixed-voltage prototyping setups with separate output enable switches and LED indicators for each rail.",
    image: "/images/products/power-supplies/12_to_5v_and3.3_rail_1136.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Input Voltage": "6.5V – 12V DC",
      "Output 1": "5V (up to 700mA)",
      "Output 2": "3.3V (up to 700mA)",
      "Connector": "DC barrel jack + USB",
      "Form Factor": "Breadboard-mount",
      "Indicators": "Dual power LEDs",
      "Switch": "Per-rail enable toggle",
    },
    tags: ["Dual Rail", "Breadboard", "5V", "3.3V", "Power", "Prototyping"],
  },

  // ── Zero PCBs & Breakout Boards ────────────────────────────
  {
    slug: "audio-jack-breakout-4pin-1111",
    name: "Audio Jack Breakout 4-Pin",
    sku: "ELCS-1111",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "3.5mm TRRS audio jack breakout with 4 labeled pins for easy prototyping.",
    description:
      "A 3.5mm TRRS (Tip-Ring-Ring-Sleeve) audio jack breakout board that exposes all 4 contact pins to standard 2.54mm pitch headers. Labeled pins for Tip, Ring 1, Ring 2, and Sleeve make it easy to interface with microphones, headphones, and audio circuits during prototyping.",
    image: "/images/products/zero-pcbs-breakout-boards/audio_jack_break_out_4pin_1111.jpeg",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Jack Type": "3.5mm TRRS (4-pole)",
      "Pins": "Tip, Ring1, Ring2, Sleeve",
      "Pitch": "2.54mm header",
      "PCB Material": "FR4 1.6mm",
      "Mounting": "Through-hole",
    },
    tags: ["Audio", "3.5mm", "TRRS", "Breakout", "Prototyping"],
  },
  {
    slug: "audio-jack-breakout-5pin-1120",
    name: "Audio Jack Breakout 5-Pin",
    sku: "ELCS-1120",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "3.5mm audio jack breakout with 5 contact pins including switch detect.",
    description:
      "An extended 5-pin audio jack breakout that includes all standard TRRS contacts plus an additional switch-detect pin. The detect pin outputs a logic signal when a plug is inserted, enabling automatic audio routing in embedded audio projects.",
    image: "/images/products/zero-pcbs-breakout-boards/audio_jack_break_out_5pin_1120.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Jack Type": "3.5mm with switch detect",
      "Pins": "Tip, Ring1, Ring2, Sleeve, Detect",
      "Pitch": "2.54mm header",
      "PCB Material": "FR4 1.6mm",
      "Detect Output": "Active low on insertion",
    },
    tags: ["Audio", "3.5mm", "Breakout", "Detect", "5-Pin"],
  },
  {
    slug: "cr2032-battery-holder-1112",
    name: "CR2032 Battery Holder",
    sku: "ELCS-1112",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "PCB-mount CR2032 coin cell battery holder with breakout pins.",
    description:
      "A PCB-mount CR2032 coin cell holder that provides 3V backup power for RTC modules, CMOS memory, and low-power IoT sensor nodes. Breakout pins on 2.54mm pitch for direct breadboard or PCB integration. Spring-loaded contact ensures reliable cell retention.",
    image: "/images/products/zero-pcbs-breakout-boards/cr2032_batter_holder_1112.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Battery Type": "CR2032 (3V lithium coin)",
      "Output Voltage": "3V nominal",
      "Capacity": "~220mAh (typical CR2032)",
      "Contact": "Spring-loaded retention",
      "Pitch": "2.54mm breakout pins",
      "Applications": "RTC backup, CMOS, low-power IoT",
    },
    tags: ["CR2032", "Battery", "3V", "Coin Cell", "RTC", "Backup"],
  },
  {
    slug: "usb-micro-female-breakout-1123",
    name: "USB Micro Female Breakout",
    sku: "ELCS-1123",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "USB Micro-B female connector breakout for power and data prototyping.",
    description:
      "A USB Micro-B female connector breakout board that exposes VCC, D\u2212, D+, ID, and GND pins on standard 2.54mm headers. Ideal for adding USB power input or USB communication capability to custom embedded projects without soldering fine-pitch SMD connectors.",
    image: null,
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Connector": "USB Micro-B Female",
      "Pins": "VCC, D\u2212, D+, ID, GND",
      "Pitch": "2.54mm breakout",
      "USB Standard": "USB 2.0",
      "PCB Material": "FR4 1.6mm",
    },
    tags: ["USB", "Micro-B", "Breakout", "Power", "Data"],
  },
  {
    slug: "usb-mini-b-female-breakout-1121",
    name: "USB Mini B Female Breakout",
    sku: "ELCS-1121",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "USB Mini-B female connector breakout with labeled pin headers.",
    description:
      "A USB Mini-B female connector breakout board that provides clearly labeled VCC, D\u2212, D+, and GND pins on 2.54mm headers. Designed for power delivery and USB communication prototyping with legacy USB Mini-B cables.",
    image: "/images/products/zero-pcbs-breakout-boards/usb_mini_b_female_break_out_1121.png",
    datasheetUrl: "/downloads/usb_mini_b_female_break_out_1121/Datasheet.docx",
    stepFileUrl: null,
    specs: {
      "Connector": "USB Mini-B Female",
      "Pins": "VCC, D\u2212, D+, GND",
      "Pitch": "2.54mm breakout",
      "USB Standard": "USB 2.0",
      "PCB Material": "FR4 1.6mm",
    },
    tags: ["USB", "Mini-B", "Breakout", "Legacy", "Datasheet"],
  },
  {
    slug: "usb-type-a-female-breakout-1122",
    name: "USB Type A Female Breakout",
    sku: "ELCS-1122",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "USB Type-A female connector breakout for host-side USB prototyping.",
    description:
      "A USB Type-A female connector breakout board with labeled VCC, D\u2212, D+, and GND pins. Enables host-side USB connectivity for custom embedded projects \u2014 connect USB peripherals like keyboards, mice, flash drives, or custom HID devices to your microcontroller.",
    image: "/images/products/zero-pcbs-breakout-boards/usb_type_a_female_break_out_1122.png",
    datasheetUrl: "/downloads/usb_type_a_female_break_out_1122/Datasheet.docx",
    stepFileUrl: null,
    specs: {
      "Connector": "USB Type-A Female",
      "Pins": "VCC (5V), D\u2212, D+, GND",
      "Pitch": "2.54mm breakout",
      "USB Standard": "USB 2.0",
      "Max Current": "500mA (per USB spec)",
      "PCB Material": "FR4 1.6mm",
    },
    tags: ["USB", "Type-A", "Host", "Breakout", "Datasheet"],
  },
  {
    slug: "zero-pcb-1113",
    name: "Zero PCB",
    sku: "ELCS-1113",
    categorySlug: "zero-pcbs-breakout-boards",
    shortDescription: "High-quality blank perfboard with plated through-holes for custom circuits.",
    description:
      "The ELCS Zero PCB is a high-quality blank perfboard with precision-drilled, plated through-holes on a 2.54mm grid. Made from FR4 substrate with copper pads and HASL finish for reliable soldering. Ideal for building one-off custom circuits, sensor interfaces, and prototype assemblies.",
    image: "/images/products/zero-pcbs-breakout-boards/zero_pcb_1113.png",
    datasheetUrl: null,
    stepFileUrl: null,
    specs: {
      "Grid Pitch": "2.54mm (0.1 inch)",
      "Substrate": "FR4 1.6mm",
      "Copper": "1oz, HASL finish",
      "Holes": "Plated through-hole",
      "Applications": "Custom circuits, prototyping",
    },
    tags: ["Zero PCB", "Perfboard", "Prototype", "FR4", "Custom"],
  },
];

/* ─────────── Solutions ─────────── */

export const SOLUTIONS: Solution[] = [
  {
    slug: "smart-agricultural-telemetry",
    title: "Smart Agricultural Telemetry System",
    tagline: "Monitor. Analyze. Optimize.",
    coverDescription: "End-to-end embedded telemetry for precision agriculture.",
    description:
      "A complete embedded telemetry solution for precision agriculture combining soil moisture sensors, environmental monitoring nodes, and a centralized gateway. Real-time data on temperature, humidity, soil moisture, and light levels is transmitted wirelessly to a cloud dashboard for analysis and automated irrigation control.",
    features: [
      "Multi-sensor environmental monitoring (temperature, humidity, soil moisture, light)",
      "LoRa / Wi-Fi wireless mesh networking between field nodes",
      "Cloud dashboard with historical trends and alerts",
      "Automated irrigation control via SSR relay modules",
      "Solar-powered sensor nodes with CR2032 RTC backup",
      "OTA firmware updates for all field devices",
    ],
    specs: {
      "Sensor Nodes": "Up to 50 per gateway",
      "Wireless Range": "2 km (LoRa) / 50m (Wi-Fi)",
      "Power": "Solar + 18650 Li-ion battery",
      "Data Interval": "Configurable (1 min \u2013 1 hour)",
      "Cloud": "MQTT \u2192 AWS IoT / custom dashboard",
      "MCU": "ESP32-S3 based",
    },
    relatedProductSlugs: [
      "ssr-relay-2amps-1119",
      "eeprom-module-2mb-1116",
      "cr2032-battery-holder-1112",
      "12v-to-5v-1a-module-1126",
    ],
  },
  {
    slug: "industrial-automation-control",
    title: "Custom Industrial Automation Control Rack",
    tagline: "Automate. Monitor. Scale.",
    coverDescription: "Modular PLC-compatible control systems for factory automation.",
    description:
      "A modular industrial automation control solution built around custom ELCS I/O controller boards. Designed for factory floor deployment with DIN-rail mounting, Modbus RTU/TCP communication, and web-based ladder logic programming. Supports digital I/O, analog sensing, motor control, and solid-state relay switching.",
    features: [
      "DIN-rail mount enclosure with industrial-grade connectors",
      "Modbus RTU (RS-485) and Modbus TCP communication",
      "Web-based ladder logic programming interface",
      "Expandable digital and analog I/O modules",
      "Solid-state relay switching for AC/DC loads",
      "Real-time monitoring via SCADA integration",
    ],
    specs: {
      "I/O Capacity": "Up to 128 DI + 64 DO + 32 AI",
      "Communication": "Modbus RTU, TCP, MQTT",
      "Power Supply": "24V DC industrial",
      "Operating Temp": "-20\u00b0C to +60\u00b0C",
      "Enclosure": "IP20 DIN-rail",
      "Programming": "IEC 61131-3 (Ladder / FBD)",
    },
    relatedProductSlugs: [
      "ssr-relay-2amps-1119",
      "12v-to-5v-3v3-rail-1136",
      "sd-card-module-horizontal-1118",
    ],
  },
  {
    slug: "ev-battery-management",
    title: "EV Battery Management System (BMS)",
    tagline: "Protect. Balance. Extend.",
    coverDescription: "Precision battery management for electric vehicle applications.",
    description:
      "A custom-designed Battery Management System (BMS) for electric vehicle and energy storage applications. Provides per-cell voltage monitoring, passive/active balancing, current sensing, temperature monitoring, and state-of-charge (SoC) estimation. Communicates via CAN bus for seamless integration with vehicle ECUs.",
    features: [
      "Per-cell voltage monitoring (up to 16S configuration)",
      "Active and passive cell balancing",
      "Temperature monitoring with NTC thermistors",
      "Coulomb counting for accurate SoC estimation",
      "CAN bus communication (J1939 compatible)",
      "Pre-charge and contactor control logic",
      "Over-voltage, under-voltage, over-current, and thermal protection",
    ],
    specs: {
      "Cell Configuration": "4S \u2013 16S Li-ion / LiFePO4",
      "Voltage Accuracy": "\u00b12mV per cell",
      "Current Range": "\u00b1200A (Hall-effect sensor)",
      "Balancing": "Active (100mA) + Passive (50mA)",
      "Communication": "CAN 2.0B / UART",
      "MCU": "STM32F407 (ARM Cortex-M4)",
      "Protection": "OVP, UVP, OCP, OTP, short-circuit",
    },
    relatedProductSlugs: [
      "eeprom-module-2mb-1116",
      "12v-to-5v-1a-module-1126",
    ],
  },
];

/* ─────────── Helpers ─────────── */

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProductsByCategory(categorySlug: string): ProductItem[] {
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getSolutionBySlug(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
