-- Remove the placeholder slide added in 006
delete from carousel_slides where title = 'Embedded Solutions for Connected Systems';

-- Seed the 5 hero images as proper carousel slides
-- image_url uses public-folder paths — works locally and in production
insert into carousel_slides (badge, title, description, image_url, sort_order, is_published) values
  (
    'WHAT''S NEW',
    'Custom PCB Fabrication',
    'High-density multi-layer routing, precision impedance control, and rapid manufacturing prototyping — engineered for IPC Class 3 compliance.',
    '/images/hero/hero-custom-pcbs.jpg',
    1, true
  ),
  (
    null,
    'Core System Modules',
    'Compact, ARM-based processing solutions and plug-and-play module architecture for faster embedded device scaling.',
    '/images/hero/hero-embedded-modules.jpg',
    2, true
  ),
  (
    null,
    'IoT Connectivity',
    'Secure, low-latency communication frameworks bridging hardware interfaces and wireless networks for mission-critical applications.',
    '/images/hero/hero-connectivity.jpg',
    3, true
  ),
  (
    null,
    'Automation Control',
    'Industrial-grade deterministic execution environments — closed-loop pipelines built for real-time process control.',
    '/images/hero/hero-control.jpg',
    4, true
  ),
  (
    null,
    'Firmware Engineering',
    'Bare-metal optimization and RTOS-grade device orchestration for reliable, predictable embedded system performance.',
    '/images/hero/hero-firmware.jpg',
    5, true
  )
on conflict do nothing;
