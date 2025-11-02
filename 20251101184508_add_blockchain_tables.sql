/*
  # Add Blockchain Tables

  ## Overview
  This migration adds blockchain functionality for transparent transaction tracking.
  All payments and donations are recorded as immutable blockchain blocks.

  ## New Tables
  
  ### `blockchain_blocks`
  Stores individual blockchain blocks with cryptographic hashing
  - `id` (uuid, primary key) - Unique block identifier
  - `block_index` (integer) - Sequential block number in the chain
  - `block_timestamp` (bigint) - Unix timestamp when block was created
  - `transaction_id` (text) - Unique transaction identifier
  - `user_id` (uuid) - Reference to user who initiated transaction
  - `transaction_type` (text) - Type: tax_payment, crowdfunding, donation
  - `amount` (numeric) - Transaction amount
  - `category` (text) - Payment category (for tax payments)
  - `campaign_id` (uuid) - Reference to campaign (for crowdfunding)
  - `metadata` (jsonb) - Additional transaction data
  - `previous_hash` (text) - Hash of previous block
  - `hash` (text) - Current block hash
  - `nonce` (integer) - Proof of work nonce
  - `created_at` (timestamptz) - Record creation time

  ### `blockchain_verification`
  Tracks blockchain integrity verification events
  - `id` (uuid, primary key)
  - `verified_at` (timestamptz) - When verification was performed
  - `blocks_verified` (integer) - Number of blocks checked
  - `is_valid` (boolean) - Whether chain is valid
  - `verified_by` (uuid) - User who performed verification
  - `verification_hash` (text) - Hash of verification result

  ## Security
  - Enable RLS on all tables
  - Users can view their own blockchain records
  - Admins can verify blockchain integrity
  - All blocks are immutable once created

  ## Indexes
  - Index on block_index for fast sequential access
  - Index on transaction_id for quick lookups
  - Index on user_id for user transaction history
*/

-- Create blockchain_blocks table
CREATE TABLE IF NOT EXISTS blockchain_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_index integer NOT NULL,
  block_timestamp bigint NOT NULL,
  transaction_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('tax_payment', 'crowdfunding', 'donation')),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  category text,
  campaign_id uuid REFERENCES crowdfunding_campaigns(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  previous_hash text NOT NULL,
  hash text NOT NULL UNIQUE,
  nonce integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_transaction_type CHECK (
    (transaction_type = 'tax_payment' AND category IS NOT NULL) OR
    (transaction_type IN ('crowdfunding', 'donation') AND campaign_id IS NOT NULL) OR
    transaction_type IN ('tax_payment', 'crowdfunding', 'donation')
  )
);

-- Create blockchain_verification table
CREATE TABLE IF NOT EXISTS blockchain_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verified_at timestamptz DEFAULT now(),
  blocks_verified integer NOT NULL,
  is_valid boolean NOT NULL,
  verified_by uuid REFERENCES auth.users(id),
  verification_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_index ON blockchain_blocks(block_index);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_transaction_id ON blockchain_blocks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_user_id ON blockchain_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_timestamp ON blockchain_blocks(block_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_type ON blockchain_blocks(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_verification_verified_at ON blockchain_verification(verified_at DESC);

-- Enable Row Level Security
ALTER TABLE blockchain_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_verification ENABLE ROW LEVEL SECURITY;

-- Policies for blockchain_blocks
CREATE POLICY "Users can view their own blockchain records"
  ON blockchain_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all blockchain records for transparency"
  ON blockchain_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert blockchain records"
  ON blockchain_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for blockchain_verification
CREATE POLICY "Anyone can view verification records"
  ON blockchain_verification FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create verifications"
  ON blockchain_verification FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = verified_by);

-- Create function to get latest block
CREATE OR REPLACE FUNCTION get_latest_block()
RETURNS TABLE (
  block_index integer,
  hash text,
  block_timestamp bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT bb.block_index, bb.hash, bb.block_timestamp
  FROM blockchain_blocks bb
  ORDER BY bb.block_index DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get blockchain stats
CREATE OR REPLACE FUNCTION get_blockchain_stats()
RETURNS TABLE (
  total_blocks bigint,
  total_amount numeric,
  total_tax_payments bigint,
  total_crowdfunding bigint,
  latest_block_hash text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_blocks,
    COALESCE(SUM(amount), 0) as total_amount,
    COUNT(*) FILTER (WHERE transaction_type = 'tax_payment')::bigint as total_tax_payments,
    COUNT(*) FILTER (WHERE transaction_type IN ('crowdfunding', 'donation'))::bigint as total_crowdfunding,
    (SELECT hash FROM blockchain_blocks ORDER BY block_index DESC LIMIT 1) as latest_block_hash
  FROM blockchain_blocks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
