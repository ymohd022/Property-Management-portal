-- Create database
CREATE DATABASE IF NOT EXISTS qmaks_property;
USE qmaks_property;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent', 'manager') NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(12,2),
  locality VARCHAR(100) NOT NULL,
  status ENUM('Active', 'Upcoming', 'Completed') DEFAULT 'Active',
  total_count INT NOT NULL,
  total_land_area VARCHAR(50) NOT NULL,
  unit_sizes VARCHAR(50) NOT NULL,
  amenities JSON,
  has_blocks BOOLEAN DEFAULT FALSE,
  total_blocks INT DEFAULT 1,
  target_market VARCHAR(100),
  permit_number VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Property Images table
CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  block_name VARCHAR(50) NOT NULL,
  total_floors INT NOT NULL,
  flats_per_floor INT NOT NULL,
  parking_facilities_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Flats table
CREATE TABLE IF NOT EXISTS flats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  block_id INT,
  flat_number VARCHAR(20) NOT NULL,
  flat_type VARCHAR(50) NOT NULL,
  flat_size DECIMAL(10,2) NOT NULL,
  flat_price DECIMAL(12,2) NOT NULL,
  status ENUM('Available', 'Booked', 'Sold') DEFAULT 'Available',
  floor_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agent Assignments table
CREATE TABLE IF NOT EXISTS agent_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  property_id INT NOT NULL,
  block_id INT,
  flat_id INT,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  notes TEXT,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  assignment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  client_name VARCHAR(100) NOT NULL,
  client_email VARCHAR(100) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  property_id INT NOT NULL,
  block_id INT,
  flat_id INT,
  status ENUM('Active', 'Converted', 'Lost') DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT,
  property_id INT NOT NULL,
  block_id INT,
  flat_id INT,
  client_id INT NOT NULL,
  sale_amount DECIMAL(12,2) NOT NULL,
  sale_date DATE NOT NULL,
  status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  sale_id INT NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
  payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, status) 
VALUES ('Admin User', 'admin@qmaks.com', '$2a$10$zJz7ZyS/0h8x5AZELFRKfejBFZgxLGEu3DEiTYMpGP.4Y2qHCZ5vO', 'admin', 'Active')
ON DUPLICATE KEY UPDATE id=id;
