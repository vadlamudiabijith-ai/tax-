/*
  # Add Campaign Updates and Tax Sector Limits

  ## Overview
  This migration adds:
  - Campaign updates feature for posting progress images after registration
  - Tax sector budget limits and annual tracking
  - Total collected tracking per sector per year

  ## New Tables

  ### 1. `campaign_updates`
  Stores progress updates posted by campaign creators
  - `id` (uuid, primary key)
  - `campaign_id` (uuid) - References crowdfunding_campaigns
  - `creator_id` (uuid) - References profiles
  - `title` (text) - Update title
  - `description` (text) - Update description
  - `image_url` (text) - Progress image URL
  - `created_at` (timestamptz) - When update was posted

  ## Changes to Existing Tables

  ### 2. `tax_sectors`
  Add budget limits and tracking
  - `annual_budget_limit` (decimal) - Maximum amount that can be collected per year
  - `current_year_collected` (decimal) - Amount collected in current year
  - `budget_year` (integer) - Year for the current budget tracking
  - `is_active` (boolean) - Whether sector is accepting payments

  ## Security
  - Enable RLS on campaign_updates
  - Campaign creators can create updates for their campaigns
  - All authenticated users can view updates
  - Tax sector limits are read-only for users

  ## Notes
  1. Campaign updates allow creators to share progress with contributors
  2. Tax sectors can be disabled when budget is exceeded
  3. Budget tracking resets annually
*/

-- Create campaign_updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign updates"
  ON campaign_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Campaign creators can create updates"
  ON campaign_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM crowdfunding_campaigns
      WHERE crowdfunding_campaigns.id = campaign_id
      AND crowdfunding_campaigns.creator_id = auth.uid()
    )
  );

CREATE POLICY "Campaign creators can update own updates"
  ON campaign_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Campaign creators can delete own updates"
  ON campaign_updates FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Add budget tracking columns to tax_sectors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_sectors' AND column_name = 'annual_budget_limit'
  ) THEN
    ALTER TABLE tax_sectors ADD COLUMN annual_budget_limit decimal(12, 2) DEFAULT 1000000.00;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_sectors' AND column_name = 'current_year_collected'
  ) THEN
    ALTER TABLE tax_sectors ADD COLUMN current_year_collected decimal(12, 2) DEFAULT 0.00;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_sectors' AND column_name = 'budget_year'
  ) THEN
    ALTER TABLE tax_sectors ADD COLUMN budget_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_sectors' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE tax_sectors ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Update existing tax sectors with budget limits
UPDATE tax_sectors SET 
  annual_budget_limit = 500000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Property Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 750000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Business Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 300000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Vehicle Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 1000000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Income Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 600000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Road Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 2000000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Army/Defense Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 800000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Education Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 900000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Healthcare Tax';

UPDATE tax_sectors SET 
  annual_budget_limit = 700000.00,
  current_year_collected = 0.00,
  budget_year = EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  is_active = true
WHERE name = 'Infrastructure Tax';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_creator_id ON campaign_updates(creator_id);
CREATE INDEX IF NOT EXISTS idx_tax_sectors_is_active ON tax_sectors(is_active);