-- MySQL schema

-- Tabla de usuarios para el login
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para guardar los datos extraídos por la IA
CREATE TABLE IF NOT EXISTS extracted_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  data JSON NOT NULL,
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  category VARCHAR(100),
  total_products INT,
  notes TEXT,
  CONSTRAINT fk_extracted_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_extracted_data_url (url),
  KEY idx_extracted_data_user_id (user_id),
  KEY idx_extracted_data_category (category),
  KEY idx_extracted_data_date (extracted_at)
);

-- Insertar usuario admin por defecto (password: admin123)
INSERT IGNORE INTO users (username, email, password, role)
VALUES ('admin', 'admin@mobicorp.com', '$2b$10$9H8YWZv3MZGxJWGMxN0YI.1kNvkr3tF8N3YvQZZh0YmKGXY2zQ7jC', 'admin');

-- Tabla para guardar precios finales confirmados por admin
CREATE TABLE IF NOT EXISTS final_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  image_url VARCHAR(1000),
  currency VARCHAR(10) DEFAULT 'Bs',
  suggested_median DECIMAL(12,2) DEFAULT NULL,
  final_price DECIMAL(12,2) DEFAULT NULL,
  sample_count INT DEFAULT 0,
  samples JSON NULL,
  used_urls JSON NULL,
  category VARCHAR(100) DEFAULT 'sillas',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_final_prices_name (product_name),
  KEY idx_final_prices_category (category),
  CONSTRAINT fk_final_prices_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Catálogo de productos (opcional para administración)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url VARCHAR(1000),
  final_price DECIMAL(12,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_products_name (name)
);

-- Precios observados por producto (opcional)
CREATE TABLE IF NOT EXISTS product_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  price_bs DECIMAL(12,2) NOT NULL,
  source_url VARCHAR(1000),
  extracted_data_id INT,
  observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pp_product_id (product_id),
  KEY idx_pp_extracted (extracted_data_id),
  CONSTRAINT fk_pp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  ,CONSTRAINT fk_pp_extracted FOREIGN KEY (extracted_data_id) REFERENCES extracted_data(id) ON DELETE SET NULL
);
