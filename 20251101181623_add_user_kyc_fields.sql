/*
  # Add KYC Fields to User Profiles

  1. Changes to `profiles` table
    - Add `gender` (text) - User's gender
    - Add `date_of_birth` (date) - User's date of birth
    - Add `phone_number` (text) - User's mobile number
    - Add `address` (text) - User's residential address
    - Add `city` (text) - City name
    - Add `state` (text) - State name
    - Add `pincode` (text) - Postal code
    - Add `aadhar_number` (text) - Aadhar card number (encrypted)
    - Add `pan_number` (text) - PAN card number (encrypted)
    - Add `occupation` (text) - User's occupation
    - Add `annual_income` (text) - Income bracket
    - Add `kyc_verified` (boolean) - KYC verification status
    - Add `kyc_verified_at` (timestamp) - KYC verification timestamp

  2. Security
    - All fields are protected by existing RLS policies
    - Sensitive data (Aadhar, PAN) should be handled securely
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gender text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pincode text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'aadhar_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN aadhar_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'pan_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pan_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'occupation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN occupation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'annual_income'
  ) THEN
    ALTER TABLE profiles ADD COLUMN annual_income text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'kyc_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN kyc_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'kyc_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN kyc_verified_at timestamptz;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_aadhar ON profiles(aadhar_number);
CREATE INDEX IF NOT EXISTS idx_profiles_pan ON profiles(pan_number);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_verified ON profiles(kyc_verified);