-- ============================================================
-- ELCS — Product seed data
-- Run in Supabase SQL Editor after 002_storage_bucket.sql
--
-- Images: upload to Storage → product-images bucket, then
-- update the image_url column:
--   UPDATE products SET image_url = '<storage-url>' WHERE slug = '<slug>';
--
-- Storage public URL pattern:
--   https://ekxnlxaczfoxgaexxbol.supabase.co/storage/v1/object/public/product-images/<filename>
-- ============================================================

-- Helper: get category ID by slug
DO $$
DECLARE
  cat_core      uuid;
  cat_pcb       uuid;
  cat_iot       uuid;
  cat_control   uuid;
  cat_firmware  uuid;
  cat_power     uuid;
BEGIN

  SELECT id INTO cat_core     FROM categories WHERE slug = 'core-modules';
  SELECT id INTO cat_pcb      FROM categories WHERE slug = 'custom-pcbs';
  SELECT id INTO cat_iot      FROM categories WHERE slug = 'iot-devices';
  SELECT id INTO cat_control  FROM categories WHERE slug = 'control-systems';
  SELECT id INTO cat_firmware FROM categories WHERE slug = 'firmware-solutions';
  SELECT id INTO cat_power    FROM categories WHERE slug = 'power-systems';

  -- ── Core Modules ────────────────────────────────────────────

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'ESP32-S3 Core Module',
    'esp32-s3-core-module',
    cat_core,
    'Dual-core Xtensa LX7 @ 240 MHz with Wi-Fi 4, Bluetooth 5 & AI/vector extensions',
    'The ELCS ESP32-S3 Core Module is a compact, production-ready compute core designed for demanding IoT and edge-AI applications. Equipped with 8 MB PSRAM and 16 MB Flash, it ships pre-certified and ready to drop into your carrier board.',
    '{"MCU": "ESP32-S3", "Core": "Dual Xtensa LX7 @ 240 MHz", "Flash": "16 MB", "PSRAM": "8 MB", "Wireless": "Wi-Fi 4 + BT 5.0 (LE)", "GPIO": "45", "Interface": "SPI, I²C, I²S, UART, USB OTG", "Voltage": "3.3 V", "Dimensions": "22 × 18 mm"}',
    ARRAY['ESP32','WiFi','Bluetooth','AI','Edge','PSRAM'],
    true, true
  );

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'STM32F407 Industrial Core',
    'stm32f407-industrial-core',
    cat_core,
    'ARM Cortex-M4 @ 168 MHz with FPU, 1 MB Flash — built for real-time control',
    'Hardened for industrial environments, the STM32F407 Industrial Core delivers deterministic real-time performance with hardware floating-point. Wide input voltage and extended temperature range make it suitable for motor drives, inverters, and automation controllers.',
    '{"MCU": "STM32F407VGT6", "Core": "ARM Cortex-M4 @ 168 MHz", "FPU": "Yes", "Flash": "1 MB", "RAM": "192 KB", "Interface": "CAN, USB, SPI, I²C, USART", "ADC": "3× 12-bit", "Input voltage": "4.5–12 V", "Temp range": "-40 to +85 °C"}',
    ARRAY['STM32','ARM','Cortex-M4','Real-time','Industrial','FPU'],
    true, true
  );

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'RP2040 Compact Board',
    'rp2040-compact-board',
    cat_core,
    'Dual-core ARM Cortex-M0+ @ 133 MHz with 2 MB Flash — ultra-low-cost compute core',
    'Built around Raspberry Pi''s RP2040, this compact board gives you programmable I/O state machines, DMA, and USB 1.1 in a 21 × 21 mm footprint. Ideal for sensor hubs, USB HID devices, and rapid prototyping.',
    '{"MCU": "RP2040", "Core": "Dual ARM Cortex-M0+ @ 133 MHz", "Flash": "2 MB QSPI", "RAM": "264 KB SRAM", "PIO": "2× 8 state machines", "USB": "1.1 device/host", "GPIO": "26", "Voltage": "3.3 V", "Dimensions": "21 × 21 mm"}',
    ARRAY['RP2040','Raspberry Pi','PIO','USB','Low-cost'],
    true, false
  );

  -- ── Custom PCBs ─────────────────────────────────────────────

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    '4-Layer Industrial PCB Design',
    '4-layer-industrial-pcb',
    cat_pcb,
    'Full-service 4-layer PCB design with impedance control, DFM review, and prototype assembly',
    'Our 4-layer industrial PCB service covers schematic capture, layout, signal integrity review, and DFM sign-off. We handle RF-sensitive designs, controlled-impedance traces, and dense BGA fanouts. Gerbers delivered with assembly-ready BOM.',
    '{"Layers": "4", "Min trace": "0.1 mm", "Min via": "0.2 mm drill", "Impedance": "Controlled (50 Ω / 100 Ω diff)", "Surface finish": "HASL / ENIG", "Copper weight": "1–2 oz", "Lead time": "5–7 business days"}',
    ARRAY['PCB','4-layer','Impedance','BGA','Custom','DFM'],
    true, false
  );

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'RF-Shielded PCB Assembly',
    'rf-shielded-pcb-assembly',
    cat_pcb,
    'Custom PCB with integrated RF shield cans — designed and assembled in-house',
    'Designed for wireless products that must pass regulatory emissions testing, this service includes PCB layout with shielding zones, shield can sourcing, and soldering. Suitable for cellular, sub-GHz, and 2.4 GHz products.',
    '{"Shield material": "Tin-plated steel", "Frequency range": "100 MHz – 6 GHz", "Shield height": "2–8 mm custom", "Assembly": "Pick-and-place + reflow", "Testing": "Basic conducted EMI scan"}',
    ARRAY['RF','Shield','EMI','Wireless','Assembly','Custom PCB'],
    true, false
  );

  -- ── IoT Devices ─────────────────────────────────────────────

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'Smart Environmental Sensor Node',
    'smart-env-sensor-node',
    cat_iot,
    'Temperature, humidity, CO₂ & particulate sensor with MQTT/HTTP over Wi-Fi',
    'A ready-to-deploy sensor node for industrial and building-automation environments. Firmware ships with MQTT, HTTP REST, and configurable push intervals. Integrates directly with Home Assistant, Node-RED, AWS IoT, and Azure IoT Hub.',
    '{"Sensors": "SHT40 (T+RH), SCD41 (CO₂), PMS5003 (PM2.5/PM10)", "Connectivity": "Wi-Fi 4 (2.4 GHz)", "Protocol": "MQTT / HTTP JSON", "Power": "5 V USB-C or 9–24 V screw terminal", "Enclosure": "IP20 DIN-rail", "Firmware OTA": "Yes"}',
    ARRAY['IoT','Sensor','MQTT','Wi-Fi','CO2','Air quality','Node-RED'],
    true, true
  );

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'Industrial Modbus Gateway',
    'industrial-modbus-gateway',
    cat_iot,
    'RS-485 Modbus RTU → MQTT/Modbus TCP bridge for legacy device connectivity',
    'Bring legacy RS-485 Modbus RTU instruments onto your Ethernet/Wi-Fi network without replacing hardware. Supports up to 247 slave addresses, auto-poll configuration, and transparent TCP tunnelling.',
    '{"Protocols": "Modbus RTU (RS-485), Modbus TCP, MQTT", "Baud rates": "1200–115200", "Max slaves": "247", "Ethernet": "10/100 RJ-45", "Wireless": "Wi-Fi 4 optional", "Power": "9–36 V DC", "Isolation": "1 kV RS-485 isolation", "Enclosure": "IP20 DIN-rail"}',
    ARRAY['Modbus','RS-485','MQTT','Gateway','Industrial','IoT'],
    true, false
  );

  -- ── Control Systems ─────────────────────────────────────────

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'PLC-Compatible I/O Controller',
    'plc-compatible-io-controller',
    cat_control,
    '16 DI + 8 DO + 4 AI controller with IEC 61131-3 ladder logic firmware',
    'Drop-in replacement or expansion for PLC-based panels. Runs a subset of IEC 61131-3 ladder logic stored in non-volatile memory. Communicates over Modbus RTU/TCP and supports remote reprogramming via web UI.',
    '{"Digital inputs": "16 × 24 V DC NPN/PNP", "Digital outputs": "8 × relay 230 V / 5 A", "Analog inputs": "4 × 0–10 V / 4–20 mA", "Protocol": "Modbus RTU + TCP", "Programming": "Web-based ladder editor", "Power": "24 V DC", "Enclosure": "DIN-rail, IP20"}',
    ARRAY['PLC','Ladder logic','I/O','Modbus','Industrial','Automation'],
    true, true
  );

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    '3-Axis CNC Motion Controller',
    '3-axis-cnc-motion-controller',
    cat_control,
    'Closed-loop 3-axis stepper/servo controller with real-time G-code interpreter',
    'Designed for small-format CNC routers, laser cutters, and pick-and-place machines. Accepts standard G-code over USB or SD card. Closed-loop encoder feedback prevents missed steps, while the hardware step generator delivers up to 200 kHz pulse output per axis.',
    '{"Axes": "3 (X, Y, Z) + 1 spindle", "Step rate": "200 kHz per axis", "Encoder": "Quadrature (closed-loop)", "Interface": "USB, SD card", "G-code": "GRBL-compatible subset", "Motor types": "Stepper + brushless servo", "Power": "12–48 V DC"}',
    ARRAY['CNC','GRBL','Motion control','G-code','Stepper','Servo'],
    true, false
  );

  -- ── Firmware Solutions ──────────────────────────────────────

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'FreeRTOS Production Template',
    'freertos-production-template',
    cat_firmware,
    'Battle-tested FreeRTOS project scaffold for STM32 and ESP32 with OTA and logging',
    'Skip months of boilerplate. This template ships with UART/RTT logging, watchdog, OTA update (HTTPS), error handling middleware, and unit-test scaffolding. Supports STM32 (CubeMX) and ESP-IDF. Delivered as a Git repository with CI pipeline.',
    '{"RTOS": "FreeRTOS 10.x", "Platforms": "STM32 (HAL), ESP-IDF", "OTA": "HTTPS + signature verification", "Logging": "UART + Segger RTT", "CI": "GitHub Actions", "Tests": "Unity (C unit tests)", "Licence": "MIT"}',
    ARRAY['FreeRTOS','RTOS','OTA','STM32','ESP32','Firmware','Template'],
    true, false
  );

  -- ── Power Systems ───────────────────────────────────────────

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    '24 V Industrial Buck-Boost Module',
    '24v-industrial-buck-boost',
    cat_power,
    'Wide-input 8–48 V to regulated 24 V / 3 A buck-boost with reverse-polarity protection',
    'Reliable regulated 24 V for field panels where supply voltage is unstable or varies across battery-backed and mains sources. Features soft-start, thermal shutdown, and EMI filter to meet EN 55032 Class B.',
    '{"Input": "8–48 V DC", "Output": "24 V ± 1% / 3 A (72 W)", "Topology": "Non-inverting buck-boost", "Efficiency": "≥93%", "Ripple": "<50 mV pk-pk", "Protection": "OVP, OCP, thermal, reverse polarity", "EMI": "EN 55032 Class B", "Dimensions": "65 × 40 × 20 mm"}',
    ARRAY['Power','Buck-boost','24V','Industrial','EMI','Regulated'],
    true, true
  );

  INSERT INTO products (name, slug, category_id, short_description, description, specs, tags, is_published, is_featured)
  VALUES (
    'Isolated DC-DC Converter Module',
    'isolated-dc-dc-converter',
    cat_power,
    '5 V / 1 A isolated converter — 1500 V isolation for sensor and signal interfaces',
    'Provides galvanic isolation between control logic and field-side sensors or communication buses (RS-232, RS-485, CAN). Operates from a 5 V or 3.3 V main supply and delivers regulated isolated 5 V at 1 A.',
    '{"Input": "4.5–5.5 V DC", "Output": "5 V / 1 A isolated", "Isolation": "1500 V DC", "Regulation": "±2%", "Efficiency": "≥80%", "Package": "SIP-7", "Operating temp": "-40 to +85 °C"}',
    ARRAY['Isolated','DC-DC','Galvanic isolation','RS-485','CAN','Power'],
    true, false
  );

END $$;
