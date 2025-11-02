/*
  # Initial Schema for Tax Payment and Crowdfunding Platform

  ## Overview
  This migration creates the foundational database structure for a platform that handles:
  - Tax payments for various sectors
  - Crowdfunding campaigns
  - User profiles and settings
  - Payment history and auto-pay functionality

  ## New Tables

  ### 1. `profiles`
  Extends Supabase auth.users with additional profile information
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `avatar_url` (text, optional) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `user_settings`
  Stores user preferences and settings
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `theme` (text) - UI theme preference (light/dark)
  - `auto_pay_enabled` (boolean) - Auto-pay feature toggle
  - `updated_at` (timestamptz) - Last settings update

  ### 3. `tax_sectors`
  Defines available tax sectors for payment
  - `id` (uuid, primary key)
  - `name` (text) - Sector name
  - `description` (text) - Sector description
  - `created_at` (timestamptz)

  ### 4. `tax_payments`
  Records all tax payment transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `sector_id` (uuid) - References tax_sectors
  - `amount` (decimal) - Payment amount
  - `payment_date` (timestamptz) - When payment was made
  - `status` (text) - Payment status (pending/completed/failed)
  - `auto_pay` (boolean) - Whether this was an auto-payment
  - `created_at` (timestamptz)

  ### 5. `crowdfunding_campaigns`
  Stores crowdfunding campaign information
  - `id` (uuid, primary key)
  - `creator_id` (uuid) - References profiles (campaign creator)
  - `title` (text) - Campaign title
  - `description` (text) - Campaign description
  - `goal_amount` (decimal) - Fundraising goal
  - `current_amount` (decimal) - Current amount raised
  - `status` (text) - Campaign status (active/completed/cancelled)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `crowdfunding_contributions`
  Records contributions to crowdfunding campaigns
  - `id` (uuid, primary key)
  - `campaign_id` (uuid) - References crowdfunding_campaigns
  - `contributor_id` (uuid) - References profiles
  - `amount` (decimal) - Contribution amount
  - `created_at` (timestamptz)

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can read their own profile data
  - Users can update their own profile and settings
  - Users can view all tax sectors
  - Users can view their own payment history
  - Users can view all active crowdfunding campaigns
  - Users can view their own contributions
  - Campaign creators can manage their campaigns

  ## Notes
  1. All monetary values use DECIMAL type for precision
  2. Timestamps use timestamptz for timezone awareness
  3. RLS policies ensure data privacy and security
  4. Foreign key constraints maintain referential integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme text DEFAULT 'light',
  auto_pay_enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create tax_sectors table
CREATE TABLE IF NOT EXISTS tax_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tax_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tax sectors"
  ON tax_sectors FOR SELECT
  TO authenticated
  USING (true);

-- Insert some default tax sectors
INSERT INTO tax_sectors (name, description) VALUES
  ('Property Tax', 'Tax on real estate and property ownership'),
  ('Business Tax', 'Tax for business operations and commercial activities'),
  ('Vehicle Tax', 'Tax on vehicle registration and ownership'),
  ('Income Tax', 'Personal and corporate income tax payments')
ON CONFLICT DO NOTHING;

-- Create tax_payments table
CREATE TABLE IF NOT EXISTS tax_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sector_id uuid NOT NULL REFERENCES tax_sectors(id),
  amount decimal(10, 2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  auto_pay boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tax_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax payments"
  ON tax_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax payments"
  ON tax_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create crowdfunding_campaigns table
CREATE TABLE IF NOT EXISTS crowdfunding_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  goal_amount decimal(10, 2) NOT NULL,
  current_amount decimal(10, 2) DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE crowdfunding_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campaigns"
  ON crowdfunding_campaigns FOR SELECT
  TO authenticated
  USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "Users can create campaigns"
  ON crowdfunding_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own campaigns"
  ON crowdfunding_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Create crowdfunding_contributions table
CREATE TABLE IF NOT EXISTS crowdfunding_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crowdfunding_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions"
  ON crowdfunding_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = contributor_id);

CREATE POLICY "Users can create contributions"
  ON crowdfunding_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Campaign creators can view contributions"
  ON crowdfunding_contributions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM crowdfunding_campaigns
      WHERE crowdfunding_campaigns.id = campaign_id
      AND crowdfunding_campaigns.creator_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tax_payments_user_id ON tax_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_payments_sector_id ON tax_payments(sector_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_campaigns_creator_id ON crowdfunding_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_contributions_campaign_id ON crowdfunding_contributions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_contributions_contributor_id ON crowdfunding_contributions(contributor_id);