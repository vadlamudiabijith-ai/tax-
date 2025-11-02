/*
  # Add Images and Term-based Donations

  ## Overview
  This migration enhances the platform with:
  - Image support for crowdfunding campaigns
  - Image URLs for tax sectors
  - Term-based donation options (monthly, quarterly, yearly)
  - Additional tax sectors with descriptive images

  ## Changes

  ### 1. Crowdfunding Campaigns Table
  - Add `image_url` column for campaign images
  - Add `donation_term` column for recurring donation options

  ### 2. Tax Sectors Table
  - Add `image_url` column for sector images
  - Add `icon` column for sector icon representation

  ### 3. Additional Tax Sectors
  - Road Tax
  - Army/Defense Tax
  - Education Tax
  - Healthcare Tax
  - Infrastructure Tax

  ## Notes
  - Image URLs will use placeholder service (Pexels) or be uploaded by users
  - Term donations allow monthly, quarterly, or yearly contributions
  - Existing data is preserved with safe ALTER TABLE operations
*/

-- Add image_url column to crowdfunding_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crowdfunding_campaigns' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE crowdfunding_campaigns ADD COLUMN image_url text;
  END IF;
END $$;

-- Add image_url and icon columns to tax_sectors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_sectors' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE tax_sectors ADD COLUMN image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_sectors' AND column_name = 'icon'
  ) THEN
    ALTER TABLE tax_sectors ADD COLUMN icon text;
  END IF;
END $$;

-- Update existing tax sectors with images and icons
UPDATE tax_sectors SET 
  image_url = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
  icon = 'Building2'
WHERE name = 'Property Tax';

UPDATE tax_sectors SET 
  image_url = 'https://images.pexels.com/photos/7621135/pexels-photo-7621135.jpeg',
  icon = 'Briefcase'
WHERE name = 'Business Tax';

UPDATE tax_sectors SET 
  image_url = 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg',
  icon = 'Car'
WHERE name = 'Vehicle Tax';

UPDATE tax_sectors SET 
  image_url = 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
  icon = 'Wallet'
WHERE name = 'Income Tax';

-- Insert new tax sectors
INSERT INTO tax_sectors (name, description, image_url, icon) VALUES
  ('Road Tax', 'Tax for road maintenance and infrastructure development', 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg', 'Construction'),
  ('Army/Defense Tax', 'Tax supporting national defense and military services', 'https://images.pexels.com/photos/3992933/pexels-photo-3992933.jpeg', 'Shield'),
  ('Education Tax', 'Tax funding public education and schools', 'https://images.pexels.com/photos/1152500/pexels-photo-1152500.jpeg', 'GraduationCap'),
  ('Healthcare Tax', 'Tax supporting public healthcare services', 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg', 'Heart'),
  ('Infrastructure Tax', 'Tax for public infrastructure and utilities', 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg', 'Building')
ON CONFLICT DO NOTHING;

-- Add donation_term column to crowdfunding_contributions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crowdfunding_contributions' AND column_name = 'donation_term'
  ) THEN
    ALTER TABLE crowdfunding_contributions ADD COLUMN donation_term text DEFAULT 'one-time';
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crowdfunding_contributions_donation_term ON crowdfunding_contributions(donation_term);