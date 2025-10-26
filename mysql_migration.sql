-- =====================================================
-- PharmaPay Ledger - MySQL Migration Script
-- Converted from Supabase/PostgreSQL to MySQL
-- =====================================================

-- Create database and use it
CREATE DATABASE IF NOT EXISTS pharmapay_ledger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharmapay_ledger;

-- Set SQL mode for strict data validation
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- TABLES
-- =====================================================

-- Create parties table for pharmaceutical businesses
CREATE TABLE parties (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_parties_name (name)
) ENGINE=InnoDB;

-- Create app_role enum equivalent using CHECK constraint
CREATE TABLE user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role ENUM('owner', 'manager') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_roles_user_id (user_id),
    INDEX idx_user_roles_role (role)
) ENGINE=InnoDB;

-- Create profiles table with username
CREATE TABLE profiles (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profiles_username (username)
) ENGINE=InnoDB;

-- Create transactions table with GST calculations
CREATE TABLE transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    party_id CHAR(36) NOT NULL,
    date DATE DEFAULT (CURRENT_DATE) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    cgst DECIMAL(12, 2) NOT NULL,
    sgst DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    payment_type ENUM('Cash', 'UPI', 'Bank') NOT NULL,
    status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    ptr_number VARCHAR(255),
    cheque_number VARCHAR(255),
    payment_date DATE,
    invoice_number VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_transactions_party_id 
        FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT check_cgst_positive CHECK (cgst >= 0),
    CONSTRAINT check_sgst_positive CHECK (sgst >= 0),
    CONSTRAINT check_total_positive CHECK (total >= 0),
    CONSTRAINT check_date_not_future CHECK (date <= CURRENT_DATE),
    CONSTRAINT check_payment_date_valid CHECK (payment_date IS NULL OR payment_date >= date),
    CONSTRAINT check_total_matches CHECK (ABS(total - (subtotal + cgst + sgst)) < 0.01),
    CONSTRAINT check_notes_length CHECK (notes IS NULL OR CHAR_LENGTH(notes) <= 1000),
    
    -- Indexes for better query performance
    INDEX idx_transactions_party_id (party_id),
    INDEX idx_transactions_date (date),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_payment_type (payment_type),
    INDEX idx_transactions_created_at (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- FUNCTIONS (MySQL Stored Functions)
-- =====================================================

-- Function to check if user has a specific role
DELIMITER //
CREATE FUNCTION has_role(_user_id CHAR(36), _role VARCHAR(20))
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE role_exists BOOLEAN DEFAULT FALSE;
    
    SELECT EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
          AND role = _role
    ) INTO role_exists;
    
    RETURN role_exists;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to handle new user profile creation
-- Note: In MySQL, we'll need to manually call this or use application logic
-- since MySQL doesn't have the same auth system as Supabase

DELIMITER //
CREATE TRIGGER handle_new_user_profile
    BEFORE INSERT ON profiles
    FOR each ROW
BEGIN
    -- Set UUID if not provided
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
    
    -- Set created_at if not provided
    IF NEW.created_at IS NULL THEN
        SET NEW.created_at = CURRENT_TIMESTAMP;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert the 15 pharmaceutical party accounts
INSERT INTO parties (name) VALUES
    ('ISHA PHARMA'),
    ('AMBIKA PHARMA'),
    ('JAI PHARMA'),
    ('SUVARNA ENTERPRISES'),
    ('PHYDE MARKETING'),
    ('BHARNI ENTERPRISES'),
    ('RAJ AGENCY (BANGALORE)'),
    ('RAMA STORE'),
    ('RAJ COSMETICS'),
    ('LYFE CARE DIPERS'),
    ('SURABHI ENTERPRISES'),
    ('JANATHA PHARMA'),
    ('JAN AUSHADHI (HUBLI)'),
    ('JAN AUSHADHI (MYSURU)'),
    ('JAN AUSHADHI (BANGALORE)');

-- =====================================================
-- USER MANAGEMENT & SECURITY
-- =====================================================

-- Create application users (MySQL equivalent of RLS policies)
-- Note: In production, you should create specific MySQL users with appropriate privileges

-- Create owner role user
CREATE USER IF NOT EXISTS 'pharmapay_owner'@'%' IDENTIFIED BY 'secure_owner_password_change_me';
GRANT ALL PRIVILEGES ON pharmapay_ledger.* TO 'pharmapay_owner'@'%';

-- Create manager role user  
CREATE USER IF NOT EXISTS 'pharmapay_manager'@'%' IDENTIFIED BY 'secure_manager_password_change_me';
GRANT SELECT, INSERT, UPDATE ON pharmapay_ledger.parties TO 'pharmapay_manager'@'%';
GRANT SELECT, INSERT ON pharmapay_ledger.transactions TO 'pharmapay_manager'@'%';
GRANT UPDATE (party_id, date, subtotal, cgst, sgst, total, payment_type, notes, ptr_number, cheque_number, payment_date, invoice_number) 
    ON pharmapay_ledger.transactions TO 'pharmapay_manager'@'%';
GRANT SELECT ON pharmapay_ledger.profiles TO 'pharmapay_manager'@'%';
GRANT SELECT ON pharmapay_ledger.user_roles TO 'pharmapay_manager'@'%';

-- Create read-only user for reports
CREATE USER IF NOT EXISTS 'pharmapay_readonly'@'%' IDENTIFIED BY 'secure_readonly_password_change_me';
GRANT SELECT ON pharmapay_ledger.* TO 'pharmapay_readonly'@'%';

-- =====================================================
-- VIEWS FOR BUSINESS LOGIC
-- =====================================================

-- View for transaction summary by party
CREATE VIEW transaction_summary AS
SELECT 
    p.id as party_id,
    p.name as party_name,
    COUNT(t.id) as total_transactions,
    SUM(CASE WHEN t.status = 'Paid' THEN t.total ELSE 0 END) as paid_amount,
    SUM(CASE WHEN t.status = 'Unpaid' THEN t.total ELSE 0 END) as unpaid_amount,
    SUM(t.total) as total_amount,
    MAX(t.date) as last_transaction_date
FROM parties p
LEFT JOIN transactions t ON p.id = t.party_id
GROUP BY p.id, p.name;

-- View for monthly transaction summary
CREATE VIEW monthly_summary AS
SELECT 
    YEAR(date) as year,
    MONTH(date) as month,
    COUNT(*) as transaction_count,
    SUM(subtotal) as total_subtotal,
    SUM(cgst) as total_cgst,
    SUM(sgst) as total_sgst,
    SUM(total) as total_amount,
    SUM(CASE WHEN status = 'Paid' THEN total ELSE 0 END) as paid_amount,
    SUM(CASE WHEN status = 'Unpaid' THEN total ELSE 0 END) as unpaid_amount
FROM transactions
GROUP BY YEAR(date), MONTH(date)
ORDER BY year DESC, month DESC;

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Procedure to create a new transaction
DELIMITER //
CREATE PROCEDURE create_transaction(
    IN p_party_id CHAR(36),
    IN p_date DATE,
    IN p_subtotal DECIMAL(12,2),
    IN p_cgst DECIMAL(12,2),
    IN p_sgst DECIMAL(12,2),
    IN p_payment_type VARCHAR(20),
    IN p_notes TEXT,
    IN p_invoice_number VARCHAR(255)
)
BEGIN
    DECLARE v_total DECIMAL(12,2);
    DECLARE v_transaction_id CHAR(36);
    
    -- Calculate total
    SET v_total = p_subtotal + p_cgst + p_sgst;
    SET v_transaction_id = UUID();
    
    -- Insert transaction
    INSERT INTO transactions (
        id, party_id, date, subtotal, cgst, sgst, total, 
        payment_type, notes, invoice_number
    ) VALUES (
        v_transaction_id, p_party_id, p_date, p_subtotal, p_cgst, p_sgst, v_total,
        p_payment_type, p_notes, p_invoice_number
    );
    
    -- Return the new transaction ID
    SELECT v_transaction_id as transaction_id;
END //
DELIMITER ;

-- Procedure to update payment status
DELIMITER //
CREATE PROCEDURE update_payment_status(
    IN p_transaction_id CHAR(36),
    IN p_status VARCHAR(20),
    IN p_payment_date DATE,
    IN p_ptr_number VARCHAR(255),
    IN p_cheque_number VARCHAR(255)
)
BEGIN
    UPDATE transactions 
    SET 
        status = p_status,
        payment_date = p_payment_date,
        ptr_number = p_ptr_number,
        cheque_number = p_cheque_number
    WHERE id = p_transaction_id;
    
    -- Return affected rows
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- =====================================================
-- INDEXES FOR OPTIMIZATION
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_transactions_party_status ON transactions(party_id, status);
CREATE INDEX idx_transactions_date_status ON transactions(date, status);
CREATE INDEX idx_transactions_payment_type_status ON transactions(payment_type, status);

-- =====================================================
-- FINAL SETUP
-- =====================================================

-- Flush privileges to ensure all user changes take effect
FLUSH PRIVILEGES;

-- Show completion message
SELECT 'PharmaPay Ledger MySQL migration completed successfully!' as message;

-- Show table summary
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'pharmapay_ledger'
ORDER BY TABLE_NAME;
