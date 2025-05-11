-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flat_id INT NOT NULL,
  property_id INT NOT NULL,
  payment_date DATE NOT NULL,
  payment_type ENUM('Cash', 'UPI', 'Cheque', 'Bank Transfer', 'Other') NOT NULL,
  payment_amount DECIMAL(12,2) NOT NULL,
  payment_category ENUM('Base Price', 'Semi Finished', 'Work Order Estimate', 'RGST', 'Miscellaneous Charges', 'Other') NOT NULL,
  reference_number VARCHAR(100),
  receipt_image_path VARCHAR(255),
  comments TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Flat pricing details table
CREATE TABLE IF NOT EXISTS flat_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flat_id INT NOT NULL,
  base_price DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  semi_finished_price DECIMAL(12,2),
  work_order_estimate DECIMAL(12,2),
  registration_gst DECIMAL(12,2),
  miscellaneous_amount DECIMAL(12,2),
  total_flat_amount DECIMAL(12,2) NOT NULL,
  ownership_type ENUM('Builder', 'Owner') DEFAULT 'Builder',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE CASCADE
);

-- Update flats table to add additional fields
ALTER TABLE flats 
ADD COLUMN IF NOT EXISTS bhk_type VARCHAR(20) AFTER flat_type,
ADD COLUMN IF NOT EXISTS uds DECIMAL(10,2) AFTER flat_size,
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE AFTER uds,
ADD COLUMN IF NOT EXISTS sold_by INT AFTER status,
ADD COLUMN IF NOT EXISTS flat_owner VARCHAR(100) AFTER sold_by,
ADD COLUMN IF NOT EXISTS ownership_type ENUM('Builder', 'Owner') DEFAULT 'Builder' AFTER flat_owner;

-- Add foreign key for sold_by if it doesn't exist
ALTER TABLE flats
ADD CONSTRAINT IF NOT EXISTS fk_flats_sold_by FOREIGN KEY (sold_by) REFERENCES agents(id) ON DELETE SET NULL;

-- Payment history view for easier querying
CREATE OR REPLACE VIEW payment_summary_view AS
SELECT 
  p.id AS property_id,
  p.name AS property_name,
  b.id AS block_id,
  b.block_name,
  f.id AS flat_id,
  f.flat_number,
  f.floor_number,
  f.bhk_type,
  f.flat_size AS area,
  f.uds,
  f.has_parking AS parking,
  f.flat_owner,
  f.ownership_type,
  fp.base_price AS price,
  fp.unit_price,
  fp.semi_finished_price,
  fp.work_order_estimate,
  fp.registration_gst,
  fp.miscellaneous_amount,
  fp.total_flat_amount,
  COALESCE(SUM(pm.payment_amount), 0) AS total_paid_amount,
  (fp.total_flat_amount - COALESCE(SUM(pm.payment_amount), 0)) AS balance_amount,
  a.name AS sold_by_agent
FROM 
  properties p
JOIN 
  flats f ON p.id = f.property_id
LEFT JOIN 
  blocks b ON f.block_id = b.id
LEFT JOIN 
  flat_pricing fp ON f.id = fp.flat_id
LEFT JOIN 
  payments pm ON f.id = pm.flat_id
LEFT JOIN 
  agents a ON f.sold_by = a.id
GROUP BY 
  p.id, b.id, f.id, fp.id;