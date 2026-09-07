-- ============================================
-- CONTACT PAGE TABLES
-- ============================================

-- 1. Contact Page Hero Section
CREATE TABLE contact_hero (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Contact Us',
    subtitle TEXT DEFAULT 'Get in touch with K.E Green Health Clinic',
    background_image_url TEXT,
    overlay_opacity DECIMAL(3,2) DEFAULT 0.4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Contact Information (Address, Phone, Email, Hours)
CREATE TABLE contact_info (
    id SERIAL PRIMARY KEY,
    section_type VARCHAR(50) NOT NULL, -- 'address', 'phone', 'email', 'hours', 'social'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    icon_name VARCHAR(100), -- For icons like 'map-pin', 'phone', 'mail', etc.
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contact Form Configuration
CREATE TABLE contact_form_config (
    id SERIAL PRIMARY KEY,
    form_title VARCHAR(255) DEFAULT 'Send us a message',
    form_subtitle TEXT DEFAULT 'We will get back to you within 24 hours',
    success_message TEXT DEFAULT 'Thank you for your message. We will contact you soon!',
    error_message TEXT DEFAULT 'Sorry, there was an error sending your message. Please try again.',
    fields_config JSONB DEFAULT '[
        {"name": "full_name", "label": "Full Name", "type": "text", "required": true, "placeholder": "Enter your full name"},
        {"name": "email", "label": "Email", "type": "email", "required": true, "placeholder": "Enter your email address"},
        {"name": "phone", "label": "Phone", "type": "tel", "required": false, "placeholder": "Enter your phone number"},
        {"name": "subject", "label": "Subject", "type": "text", "required": true, "placeholder": "What is this regarding?"},
        {"name": "message", "label": "Message", "type": "textarea", "required": true, "placeholder": "Tell us how we can help you"}
    ]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Contact Form Submissions
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'closed'
    admin_notes TEXT,
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- 5. Office Locations (Multiple locations support)
CREATE TABLE office_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    fax VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    office_hours JSONB DEFAULT '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "14:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    is_main_office BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. FAQ Section for Contact Page
CREATE TABLE contact_faq (
    id SERIAL PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general', -- 'general', 'appointments', 'services', 'billing'
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Emergency Contact Information
CREATE TABLE emergency_contact (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Emergency Contact',
    description TEXT DEFAULT 'For medical emergencies, please call 911 or visit your nearest emergency room.',
    emergency_phone VARCHAR(50),
    after_hours_phone VARCHAR(50),
    urgent_care_info TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Contact submissions indexes for admin queries
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Contact info index for efficient ordering
CREATE INDEX idx_contact_info_section_order ON contact_info(section_type, display_order);

-- Office locations index
CREATE INDEX idx_office_locations_active ON office_locations(is_active, display_order);

-- FAQ index
CREATE INDEX idx_contact_faq_category_order ON contact_faq(category, display_order);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample contact hero
INSERT INTO contact_hero (title, subtitle, background_image_url, overlay_opacity) VALUES
('Contact K.E Green Health Clinic', 'We''re here to help with all your health and wellness needs', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3', 0.5);

-- Insert sample contact information
INSERT INTO contact_info (section_type, title, content, icon_name, display_order) VALUES
('address', 'Visit Our Clinic', '123 Health Avenue, Suite 200
Medical District
Accra, Ghana 00233', 'map-pin', 1),
('phone', 'Call Us', '+233 50 123 4567
+233 30 276 8900', 'phone', 2),
('email', 'Email Us', 'info@kegreenhealth.com
appointments@kegreenhealth.com', 'mail', 3),
('hours', 'Office Hours', 'Monday - Friday: 8:00 AM - 5:00 PM
Saturday: 9:00 AM - 2:00 PM
Sunday: Closed', 'clock', 4);

-- Insert contact form configuration
INSERT INTO contact_form_config (form_title, form_subtitle) VALUES
('Send us a message', 'We will get back to you within 24 hours');

-- Insert sample office location
INSERT INTO office_locations (name, address_line1, city, country, phone, email, is_main_office, latitude, longitude) VALUES
('K.E Green Health Clinic - Main Office', '123 Health Avenue, Suite 200', 'Accra', 'Ghana', '+233 50 123 4567', 'info@kegreenhealth.com', true, 5.6037, -0.1870);

-- Insert sample FAQ
INSERT INTO contact_faq (question, answer, category, display_order) VALUES
('How do I schedule an appointment?', 'You can schedule an appointment by calling us at +233 50 123 4567, using our online booking system, or visiting our clinic during office hours.', 'appointments', 1),
('What should I bring to my first appointment?', 'Please bring a valid ID, insurance card (if applicable), list of current medications, and any relevant medical records or test results.', 'appointments', 2),
('Do you accept walk-in patients?', 'We accommodate walk-in patients based on availability, but we recommend scheduling an appointment to ensure minimal wait time.', 'appointments', 3),
('What insurance plans do you accept?', 'We accept most major insurance plans. Please contact our office to verify your specific insurance coverage.', 'billing', 4);

-- Insert emergency contact info
INSERT INTO emergency_contact (title, description, emergency_phone, after_hours_phone) VALUES
('Emergency Contact', 'For life-threatening emergencies, please call 911 or visit your nearest emergency room. For urgent but non-life-threatening concerns after hours, you may call our on-call service.', '911', '+233 50 123 4567');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for contact submissions (admin only)
CREATE POLICY "Admin can view all contact submissions" ON contact_submissions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Public read access for contact information
CREATE POLICY "Anyone can view contact info" ON contact_info
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view office locations" ON office_locations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view contact FAQ" ON contact_faq
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view contact hero" ON contact_hero
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view emergency contact" ON emergency_contact
    FOR SELECT USING (is_active = true);

-- Allow public to insert contact submissions
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get formatted office hours
CREATE OR REPLACE FUNCTION get_formatted_office_hours(location_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    hours_json JSONB;
    result TEXT := '';
    day_name TEXT;
    day_info JSONB;
BEGIN
    SELECT office_hours INTO hours_json FROM office_locations WHERE id = location_id;
    
    FOR day_name IN SELECT * FROM jsonb_object_keys(hours_json) LOOP
        day_info := hours_json -> day_name;
        
        result := result || INITCAP(day_name) || ': ';
        
        IF (day_info ->> 'closed')::BOOLEAN THEN
            result := result || 'Closed';
        ELSE
            result := result || (day_info ->> 'open') || ' - ' || (day_info ->> 'close');
        END IF;
        
        result := result || E'\n';
    END LOOP;
    
    RETURN RTRIM(result, E'\n');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_contact_hero_updated_at BEFORE UPDATE ON contact_hero FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_form_config_updated_at BEFORE UPDATE ON contact_form_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_office_locations_updated_at BEFORE UPDATE ON office_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_faq_updated_at BEFORE UPDATE ON contact_faq FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contact_updated_at BEFORE UPDATE ON emergency_contact FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();