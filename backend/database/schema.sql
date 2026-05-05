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
  'Industry 4.0',
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

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  role ENUM('admin', 'client') NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(160) NOT NULL,
  sector VARCHAR(50) NULL,
  plan VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(120) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  issued_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user_id (user_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(64) PRIMARY KEY,
  company VARCHAR(160) NOT NULL UNIQUE,
  sector VARCHAR(50) NOT NULL,
  sector_label VARCHAR(120) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  plan_name VARCHAR(120) NOT NULL,
  status ENUM('active', 'paused', 'trial') NOT NULL DEFAULT 'active',
  devices INT NOT NULL DEFAULT 0,
  smart_cards INT NOT NULL DEFAULT 0,
  monthly_usage INT NOT NULL DEFAULT 0,
  credits_remaining INT NOT NULL DEFAULT 0,
  sales_today DECIMAL(12, 2) NOT NULL DEFAULT 0,
  calls_handled INT NOT NULL DEFAULT 0,
  tasks_automated INT NOT NULL DEFAULT 0,
  new_leads INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_accounts_sector (sector),
  INDEX idx_accounts_plan (plan)
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  level ENUM('info', 'success', 'warning') NOT NULL DEFAULT 'info',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR(64) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  size_kb INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  company VARCHAR(160) NOT NULL,
  sector VARCHAR(50) NOT NULL,
  sector_label VARCHAR(120) NOT NULL,
  message TEXT NULL,
  status ENUM('new', 'contacted', 'qualified', 'closed') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_company (company),
  INDEX idx_leads_sector (sector),
  INDEX idx_leads_status (status)
);

CREATE TABLE IF NOT EXISTS smart_cards (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(120) NOT NULL UNIQUE,
  sector VARCHAR(50) NOT NULL,
  sector_label VARCHAR(120) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  plan_name VARCHAR(120) NOT NULL,
  status ENUM('available', 'assigned', 'activated') NOT NULL DEFAULT 'available',
  owner_company VARCHAR(160) NULL,
  device_key VARCHAR(80) NULL,
  issued_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_smart_cards_plan (plan),
  INDEX idx_smart_cards_sector (sector),
  INDEX idx_smart_cards_status (status)
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  company VARCHAR(160) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  plan_name VARCHAR(120) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  card_brand ENUM('visa', 'mastercard', 'amex') NOT NULL,
  last4 CHAR(4) NOT NULL,
  status ENUM('paid', 'refunded', 'failed') NOT NULL DEFAULT 'paid',
  linked_card_code VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_company (company),
  INDEX idx_payments_plan (plan),
  INDEX idx_payments_status (status),
  CONSTRAINT fk_payments_card
    FOREIGN KEY (linked_card_code) REFERENCES smart_cards(code)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activations (
  id VARCHAR(64) PRIMARY KEY,
  company VARCHAR(160) NOT NULL,
  sector VARCHAR(50) NOT NULL,
  sector_label VARCHAR(120) NOT NULL,
  device_key VARCHAR(80) NOT NULL,
  device_name VARCHAR(120) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  plan_name VARCHAR(120) NOT NULL,
  site VARCHAR(190) NOT NULL,
  status ENUM('queued', 'provisioning', 'live') NOT NULL DEFAULT 'queued',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activations_company (company),
  INDEX idx_activations_status (status),
  INDEX idx_activations_sector (sector)
);

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(64) PRIMARY KEY,
  company VARCHAR(160) NOT NULL,
  contact_email VARCHAR(190) NOT NULL,
  priority ENUM('critical', 'priority', 'standard') NOT NULL DEFAULT 'standard',
  category ENUM('automation', 'integration', 'support') NOT NULL,
  summary VARCHAR(280) NOT NULL,
  status ENUM('open', 'investigating', 'resolved') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tickets_company (company),
  INDEX idx_tickets_priority (priority),
  INDEX idx_tickets_status (status)
);

CREATE TABLE IF NOT EXISTS scratch_card_reveals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  company VARCHAR(160) NOT NULL,
  card_id VARCHAR(64) NOT NULL,
  code VARCHAR(120) NOT NULL,
  sector VARCHAR(50) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validated_at DATETIME NULL,
  INDEX idx_scratch_reveals_user (user_id),
  INDEX idx_scratch_reveals_card (card_id)
);

CREATE TABLE IF NOT EXISTS scratch_card_reservations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  company VARCHAR(160) NOT NULL,
  card_id VARCHAR(64) NOT NULL,
  code VARCHAR(120) NOT NULL,
  sector VARCHAR(50) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scratch_reservations_card (card_id)
);

CREATE TABLE IF NOT EXISTS vpn_endpoints (
  id VARCHAR(64) PRIMARY KEY,
  location VARCHAR(120) NOT NULL,
  country CHAR(2) NOT NULL,
  status ENUM('online', 'offline', 'maintenance') NOT NULL DEFAULT 'online'
);

CREATE TABLE IF NOT EXISTS vpn_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  endpoint_id VARCHAR(64) NOT NULL,
  location VARCHAR(120) NOT NULL,
  protocol VARCHAR(40) NOT NULL,
  status ENUM('connected', 'disconnected') NOT NULL DEFAULT 'connected',
  encryption_level VARCHAR(80) NOT NULL,
  bandwidth VARCHAR(80) NOT NULL,
  issued_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  INDEX idx_vpn_sessions_user (user_id),
  INDEX idx_vpn_sessions_endpoint (endpoint_id),
  CONSTRAINT fk_vpn_sessions_endpoint
    FOREIGN KEY (endpoint_id) REFERENCES vpn_endpoints(id)
    ON DELETE CASCADE
);

INSERT INTO vpn_endpoints (id, location, country, status) VALUES
('vpn-eu-1', 'EU Central', 'DE', 'online'),
('vpn-us-1', 'US East', 'US', 'online'),
('vpn-asia-1', 'Asia Pacific', 'SG', 'online'),
('vpn-uk-1', 'UK', 'GB', 'online')
ON DUPLICATE KEY UPDATE
  location = VALUES(location),
  country = VALUES(country),
  status = VALUES(status);
