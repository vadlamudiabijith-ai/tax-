/*
  # Add Project Voting and Payment History Features

  1. New Tables
    - `essential_projects` - Critical infrastructure projects for voting
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `estimated_cost` (numeric)
      - `priority_score` (integer)
      - `votes` (integer)
      - `status` (text)
      - `category` (text)
      - `deadline` (timestamptz)
      - `created_at` (timestamptz)

    - `non_essential_projects` - Community enhancement projects for funding
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `estimated_cost` (numeric)
      - `funding_received` (numeric)
      - `funding_goal` (numeric)
      - `contributor_count` (integer)
      - `status` (text)
      - `category` (text)
      - `created_at` (timestamptz)

    - `project_votes` - User votes for essential projects
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `vote_weight` (integer)
      - `blockchain_hash` (text)
      - `created_at` (timestamptz)

    - `project_contributions` - User contributions to non-essential projects
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `amount` (numeric)
      - `blockchain_hash` (text)
      - `created_at` (timestamptz)

  2. Schema Changes
    - Add `pan_number` and `aadhar_number` to `tax_payments`
    - Add `payment_type` to `tax_payments` if not exists
    - Add `transaction_id` to `tax_payments` if not exists

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add PAN and Aadhar columns to tax_payments if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_payments' AND column_name = 'pan_number'
  ) THEN
    ALTER TABLE tax_payments ADD COLUMN pan_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_payments' AND column_name = 'aadhar_number'
  ) THEN
    ALTER TABLE tax_payments ADD COLUMN aadhar_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_payments' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE tax_payments ADD COLUMN payment_type text DEFAULT 'tax_payment';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_payments' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE tax_payments ADD COLUMN transaction_id text DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

-- Create essential_projects table
CREATE TABLE IF NOT EXISTS essential_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  estimated_cost numeric NOT NULL DEFAULT 0,
  priority_score integer NOT NULL DEFAULT 0,
  votes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  category text NOT NULL,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create non_essential_projects table
CREATE TABLE IF NOT EXISTS non_essential_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  estimated_cost numeric NOT NULL DEFAULT 0,
  funding_received numeric NOT NULL DEFAULT 0,
  funding_goal numeric NOT NULL DEFAULT 0,
  contributor_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create project_votes table
CREATE TABLE IF NOT EXISTS project_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES essential_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_weight integer NOT NULL DEFAULT 1,
  blockchain_hash text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_contributions table
CREATE TABLE IF NOT EXISTS project_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES non_essential_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  blockchain_hash text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE essential_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_essential_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contributions ENABLE ROW LEVEL SECURITY;

-- Policies for essential_projects (everyone can view active projects)
CREATE POLICY "Anyone can view active essential projects"
  ON essential_projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage essential projects"
  ON essential_projects FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for non_essential_projects (everyone can view active projects)
CREATE POLICY "Anyone can view active non-essential projects"
  ON non_essential_projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage non-essential projects"
  ON non_essential_projects FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for project_votes
CREATE POLICY "Users can view all votes"
  ON project_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON project_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update votes"
  ON project_votes FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Users cannot delete votes"
  ON project_votes FOR DELETE
  TO authenticated
  USING (false);

-- Policies for project_contributions
CREATE POLICY "Users can view all contributions"
  ON project_contributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own contributions"
  ON project_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update contributions"
  ON project_contributions FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Users cannot delete contributions"
  ON project_contributions FOR DELETE
  TO authenticated
  USING (false);

-- Insert sample essential projects
INSERT INTO essential_projects (title, description, estimated_cost, priority_score, votes, status, category, deadline) VALUES
  ('Highway Bridge Repair', 'Critical repair of the main highway bridge connecting to the city center. Structural engineers have identified safety concerns that need immediate attention.', 5000000, 150, 0, 'active', 'infrastructure', now() + interval '6 months'),
  ('Water Treatment Plant Upgrade', 'Upgrade aging water treatment facilities to ensure safe drinking water for all residents and meet new environmental standards.', 8000000, 120, 0, 'active', 'utilities', now() + interval '12 months'),
  ('Emergency Response System', 'Implement city-wide emergency alert system with backup power and communication infrastructure for disaster preparedness.', 3000000, 100, 0, 'active', 'public_safety', now() + interval '9 months'),
  ('School Building Modernization', 'Renovate and modernize three public school buildings with updated HVAC, electrical systems, and accessibility improvements.', 6000000, 90, 0, 'active', 'education', now() + interval '18 months'),
  ('Sewer System Expansion', 'Expand sewer infrastructure to serve growing neighborhoods and reduce environmental impact on local waterways.', 4500000, 80, 0, 'active', 'utilities', now() + interval '15 months')
ON CONFLICT DO NOTHING;

-- Insert sample non-essential projects
INSERT INTO non_essential_projects (title, description, estimated_cost, funding_received, funding_goal, contributor_count, status, category) VALUES
  ('Community Park Renovation', 'Renovate Central Park with new playground equipment, walking trails, and outdoor fitness stations for community wellness.', 1500000, 0, 1500000, 0, 'active', 'recreation'),
  ('Public Art Installation', 'Commission local artists to create murals and sculptures throughout downtown to enhance community culture and tourism.', 500000, 0, 500000, 0, 'active', 'culture'),
  ('Smart City Wi-Fi Network', 'Install free public Wi-Fi hotspots in parks, libraries, and community centers to improve digital access.', 800000, 0, 800000, 0, 'active', 'technology'),
  ('Community Garden Project', 'Develop community gardens with educational programs teaching sustainable agriculture and providing fresh produce.', 300000, 0, 300000, 0, 'active', 'environment'),
  ('Youth Sports Complex', 'Build modern sports facilities including basketball courts, soccer fields, and a running track for youth programs.', 2000000, 0, 2000000, 0, 'active', 'recreation')
ON CONFLICT DO NOTHING;
