DROP TABLE IF EXISTS payment_history;
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  trip_code VARCHAR(50) NOT NULL,
  
  -- Transaction details
  transaction_type VARCHAR(20) NOT NULL, -- 'DEBIT' or 'CREDIT'
  payment_type VARCHAR(50) NOT NULL, -- 'Gaadi Balance Paid', 'Gaadi Advance Paid', 'Party Balance Received', 'Party Advance Received'
  
  -- Financial data
  amount NUMERIC(12, 2) NOT NULL,
  
  -- Trip context
  vehicle_number VARCHAR(50) NOT NULL,
  loading_date DATE NOT NULL,
  
  -- Metadata
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_history_trip_id ON payment_history(trip_id);
CREATE INDEX idx_payment_history_transaction_date ON payment_history(transaction_date);
CREATE INDEX idx_payment_history_vehicle ON payment_history(vehicle_number);
CREATE INDEX idx_payment_history_type ON payment_history(transaction_type);
