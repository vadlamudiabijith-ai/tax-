/*
  # Create OTP Authentication Table

  1. New Tables
    - `otp_codes`
      - `id` (uuid, primary key)
      - `user_email` (text) - User's email address
      - `otp_code` (text) - 6-digit OTP code
      - `created_at` (timestamp) - When OTP was generated
      - `expires_at` (timestamp) - When OTP expires (5 minutes from creation)
      - `used` (boolean) - Whether OTP has been used
      - `used_at` (timestamp) - When OTP was used

  2. Security
    - Enable RLS on `otp_codes` table
    - Add policy for users to read only their own OTP codes
    - Add policy for service role to insert OTP codes
    - Add index on email for fast lookups
    - Add index on expires_at for cleanup

  3. Notes
    - OTP codes expire after 5 minutes
    - Only unused OTP codes can be validated
    - Automatic cleanup of expired OTPs can be done via scheduled function
*/

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  otp_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own OTP codes (for verification)
CREATE POLICY "Users can read own OTP codes"
  ON otp_codes
  FOR SELECT
  TO authenticated
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Service role can insert OTP codes (for generation)
CREATE POLICY "Service role can insert OTP codes"
  ON otp_codes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: System can update OTP codes (for marking as used)
CREATE POLICY "System can update OTP codes"
  ON otp_codes
  FOR UPDATE
  TO authenticated
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND used = false
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_used ON otp_codes(used);

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;