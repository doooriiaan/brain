CREATE TABLE IF NOT EXISTS sectors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  audience VARCHAR(255) NOT NULL,
  stat_label VARCHAR(80) NOT NULL,
  stat_value VARCHAR(80) NOT NULL,
  accent VARCHAR(20) NOT NULL,
  device_key VARCHAR(80) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  capabilities_json JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_key VARCHAR(80) NOT NULL UNIQUE,
  sector_slug VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(120) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  ports_json JSON NOT NULL,
  suited_for_json JSON NOT NULL,
  metrics_json JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  summary TEXT NOT NULL,
  annual_price DECIMAL(10, 2) NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL,
  device_allowance VARCHAR(120) NOT NULL,
  support_label VARCHAR(120) NOT NULL,
  automation_label VARCHAR(120) NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  features_json JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO sectors (
  slug, name, title, summary, audience, stat_label, stat_value, accent,
  device_key, image_url, capabilities_json, sort_order
) VALUES
(
  'commercial',
  'Commercial',
  'AI Stick for retail, hospitality, kiosks, and smart displays',
  'A compact plug-and-play device for customer-facing screens that adds voice AI, content suggestions, messaging flows, and branded experiences.',
  'Retail stores, kiosks, hospitality, distributors',
  'Fast rollout',
  'Plug & play',
  '#f2b84b',
  'ai-stick',
  '/media/commercial-stick.jpeg',
  JSON_ARRAY('Voice assistant on screens', 'Promotions and product discovery', 'Customer self-service flows', 'Brand-ready experience'),
  1
),
(
  'business',
  'Business',
  'Business Hub for automation, analytics, and communication',
  'The core commercial package for companies that want a physical AI device plus a cloud dashboard for tasks, calls, insights, and workflow automation.',
  'SMBs, agencies, service companies, front desks',
  'Realtime actions',
  'Automation + voice',
  '#63b2ff',
  'business-hub',
  '/media/business-hub.jpeg',
  JSON_ARRAY('Realtime business analytics', 'Voice-based task execution', 'Cloud dashboard overview', 'CRM and workflow expansion'),
  2
),
(
  'healthcare',
  'Healthcare',
  'brAIn MED for clinics, pharmacies, waiting rooms, and staff',
  'Healthcare-focused assistants for appointments, front desk support, patient information, and role-based access with a medical branding direction.',
  'Clinics, pharmacies, waiting rooms, medical teams',
  'Compliance ready',
  'Secure workflow',
  '#7ce0d4',
  'med-assistant',
  '/media/healthcare-med.jpeg',
  JSON_ARRAY('Appointments and patient support', 'Pharmacy and stock guidance', 'Waiting-room information display', 'Staff card and access flow'),
  3
),
(
  'industry',
  'Industry 4.0 AI',
  'Edge box for machine monitoring, predictive alerts, and AI ops',
  'An industrial-grade device that connects to machines and sensors, then streams events into the cloud for dashboards, alerts, and AI recommendations.',
  'Factories, production lines, SCADA teams, operations leads',
  'Industrial fit',
  'PLC / SCADA ready',
  '#f59d62',
  'industry-edge',
  '/media/industry-edge.jpeg',
  JSON_ARRAY('Realtime machine monitoring', 'Predictive maintenance alerts', 'Anomaly detection', 'Factory dashboard integration'),
  4
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  title = VALUES(title),
  summary = VALUES(summary),
  audience = VALUES(audience),
  stat_label = VALUES(stat_label),
  stat_value = VALUES(stat_value),
  accent = VALUES(accent),
  device_key = VALUES(device_key),
  image_url = VALUES(image_url),
  capabilities_json = VALUES(capabilities_json),
  sort_order = VALUES(sort_order);

INSERT INTO devices (
  device_key, sector_slug, name, category, tagline, description, image_url,
  ports_json, suited_for_json, metrics_json, sort_order
) VALUES
(
  'business-hub',
  'business',
  'brAIn Hub',
  'Business device',
  'Desk-ready AI assistant for daily operations and client workflows.',
  'The Hub gives the business vertical a premium physical anchor. It is ideal for sales demos because it shows the product as something you can touch, install, and connect to the brAIn cloud system immediately.',
  '/media/business-hub-compact.jpeg',
  JSON_ARRAY('USB-C', 'USB 3.0', 'HDMI', 'Ethernet', 'Wi-Fi 6', 'Bluetooth 5.2'),
  JSON_ARRAY('Front desks', 'SMB offices', 'Showrooms', 'Sales demos'),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Display', 'value', '7 inch HD'),
    JSON_OBJECT('label', 'Voice', 'value', '4-mic array'),
    JSON_OBJECT('label', 'Connectivity', 'value', 'LAN + Wi-Fi')
  ),
  1
),
(
  'ai-stick',
  'commercial',
  'brAIn AI Stick',
  'Commercial device',
  'Turn any TV or display into a customer-facing AI screen.',
  'The AI Stick is perfect for retail and commercial use cases because it is lightweight, fast to install, and easy to explain. It transforms passive screens into active AI touchpoints.',
  '/media/commercial-stick.jpeg',
  JSON_ARRAY('HDMI', 'USB power', 'USB-C', 'Wi-Fi 6', 'Bluetooth 5.2'),
  JSON_ARRAY('Retail', 'Kiosks', 'Hospitality', 'Showcase screens'),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Footprint', 'value', 'Ultra compact'),
    JSON_OBJECT('label', 'Setup', 'value', 'Minutes'),
    JSON_OBJECT('label', 'Use case', 'value', 'Screen AI')
  ),
  2
),
(
  'med-assistant',
  'healthcare',
  'brAIn MED Assistant',
  'Healthcare device',
  'AI support device for clinics, pharmacies, and healthcare front desks.',
  'The medical lineup gives healthcare its own visual identity and workflow story. It can support appointments, patient questions, pharmacy support, and waiting-room information delivery.',
  '/media/healthcare-med.jpeg',
  JSON_ARRAY('USB-C', 'USB 3.0', 'Ethernet', 'Card access', 'Wi-Fi'),
  JSON_ARRAY('Clinics', 'Pharmacies', 'Waiting rooms', 'Reception desks'),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Security', 'value', 'Role-based'),
    JSON_OBJECT('label', 'Experience', 'value', 'Patient support'),
    JSON_OBJECT('label', 'Activation', 'value', 'Card + cloud')
  ),
  3
),
(
  'industry-edge',
  'industry',
  'brAIn Industry Edge Box',
  'Industry 4.0 device',
  'Edge AI bridge between machines on-site and cloud insights.',
  'This device makes the industrial story credible because it visually shows how data is collected at the edge and forwarded to the cloud for dashboards, alerts, and optimization logic.',
  '/media/industry-edge.jpeg',
  JSON_ARRAY('Ethernet', 'USB', 'Industrial I/O', 'Sensor inputs', 'Wi-Fi', 'PLC links'),
  JSON_ARRAY('Factories', 'Lines', 'SCADA teams', 'Maintenance teams'),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Operation', 'value', '24/7'),
    JSON_OBJECT('label', 'Use case', 'value', 'Realtime monitoring'),
    JSON_OBJECT('label', 'Outcome', 'value', 'Fewer unplanned stops')
  ),
  4
)
ON DUPLICATE KEY UPDATE
  sector_slug = VALUES(sector_slug),
  name = VALUES(name),
  category = VALUES(category),
  tagline = VALUES(tagline),
  description = VALUES(description),
  image_url = VALUES(image_url),
  ports_json = VALUES(ports_json),
  suited_for_json = VALUES(suited_for_json),
  metrics_json = VALUES(metrics_json),
  sort_order = VALUES(sort_order);

INSERT INTO plans (
  slug, name, summary, annual_price, monthly_price, device_allowance,
  support_label, automation_label, featured, features_json, sort_order
) VALUES
(
  'starter',
  'Starter',
  'Entry plan for one device and a focused AI use case.',
  180.00,
  19.00,
  '1 device connection',
  'Email support',
  'Basic AI actions',
  0,
  JSON_ARRAY('Single sector landing activation', 'Basic chatbot or voice flow', 'Secure cloud account', 'Light analytics dashboard'),
  1
),
(
  'professional',
  'Professional',
  'Best for growing teams that need multiple devices and reporting.',
  490.00,
  49.00,
  'Up to 3 devices',
  'Priority support',
  'Advanced automations',
  0,
  JSON_ARRAY('Multiple device profiles', 'Advanced analytics', 'Sector-based messaging', 'Workflow triggers and alerts'),
  2
),
(
  'business',
  'Business',
  'The commercial sweet spot for vertical product bundles.',
  990.00,
  99.00,
  'Up to 10 devices',
  'Priority support + onboarding',
  'Cloud workflows + insights',
  1,
  JSON_ARRAY('Cross-sector landing structure', 'Cloud dashboard + reporting', 'Integrations with CRM / ERP / APIs', 'Reusable branded workflows'),
  3
),
(
  'platinum',
  'Platinum',
  'Enterprise tier for large deployments and deep customization.',
  1990.00,
  199.00,
  'Unlimited devices',
  'Premium support',
  'Custom workflows + API',
  0,
  JSON_ARRAY('White-label experience', 'Dedicated AI manager', 'Advanced automation orchestration', 'Custom model and cloud integrations'),
  4
),
(
  'platinum-plus',
  'Platinum+',
  'White-label tier with usage add-ons, dedicated management, and custom AI models.',
  1990.00,
  199.00,
  'Unlimited + usage packs',
  'Dedicated AI manager',
  'White-label + custom models',
  0,
  JSON_ARRAY('18,000,000 base tokens included', 'Extra token packs and usage billing', 'White-label deployment option', 'Priority 24/7 support'),
  5
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  summary = VALUES(summary),
  annual_price = VALUES(annual_price),
  monthly_price = VALUES(monthly_price),
  device_allowance = VALUES(device_allowance),
  support_label = VALUES(support_label),
  automation_label = VALUES(automation_label),
  featured = VALUES(featured),
  features_json = VALUES(features_json),
  sort_order = VALUES(sort_order);
