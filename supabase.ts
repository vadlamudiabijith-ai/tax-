import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  auto_pay_enabled: boolean;
  updated_at: string;
};

export type TaxSector = {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  icon?: string;
  annual_budget_limit: number;
  current_year_collected: number;
  budget_year: number;
  is_active: boolean;
  created_at: string;
};

export type TaxPayment = {
  id: string;
  user_id: string;
  sector_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed';
  auto_pay: boolean;
  created_at: string;
};

export type CrowdfundingCampaign = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type CrowdfundingContribution = {
  id: string;
  campaign_id: string;
  contributor_id: string;
  amount: number;
  created_at: string;
};

export type CampaignUpdate = {
  id: string;
  campaign_id: string;
  creator_id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
};
