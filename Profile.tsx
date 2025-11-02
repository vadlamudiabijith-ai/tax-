import { useEffect, useState } from 'react';
import { supabase, Profile as ProfileType, CrowdfundingCampaign, TaxPayment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Save, ArrowLeft, Heart, DollarSign, TrendingUp, Receipt } from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

interface Contribution {
  id: string;
  amount: number;
  donation_term: string;
  created_at: string;
  campaign_title?: string;
}

export const Profile = ({ onNavigate }: ProfileProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [myCampaigns, setMyCampaigns] = useState<CrowdfundingCampaign[]>([]);
  const [myContributions, setMyContributions] = useState<Contribution[]>([]);
  const [myPayments, setMyPayments] = useState<(TaxPayment & { sector_name?: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'contributions' | 'payments'>('overview');

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMyCampaigns();
      loadMyContributions();
      loadMyPayments();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name);
    }
    setLoading(false);
  };

  const loadMyCampaigns = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('crowdfunding_campaigns')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setMyCampaigns(data);
    }
  };

  const loadMyContributions = async () => {
    if (!user) return;

    const { data: contributionsData } = await supabase
      .from('crowdfunding_contributions')
      .select('*')
      .eq('contributor_id', user.id)
      .order('created_at', { ascending: false });

    if (contributionsData) {
      const { data: campaignsData } = await supabase
        .from('crowdfunding_campaigns')
        .select('id, title');

      const campaignsMap = new Map(campaignsData?.map(c => [c.id, c.title]) || []);

      const enrichedContributions = contributionsData.map(c => ({
        ...c,
        campaign_title: campaignsMap.get(c.campaign_id) || 'Unknown Campaign'
      }));

      setMyContributions(enrichedContributions);
    }
  };

  const loadMyPayments = async () => {
    if (!user) return;

    const { data: paymentsData } = await supabase
      .from('tax_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false })
      .limit(5);

    if (paymentsData) {
      const { data: sectorsData } = await supabase
        .from('tax_sectors')
        .select('*');

      const sectorsMap = new Map(sectorsData?.map(s => [s.id, s.name]) || []);

      const enrichedPayments = paymentsData.map(p => ({
        ...p,
        sector_name: sectorsMap.get(p.sector_id) || 'Unknown'
      }));

      setMyPayments(enrichedPayments);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      setMessage('Error updating profile');
    } else {
      setMessage('Profile updated successfully');
      loadProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const totalContributed = myContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalTaxPaid = myPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCampaignFunds = myCampaigns.reduce((sum, c) => sum + c.current_amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-full">
                  <User className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">{profile?.full_name}</h1>
              <p className="text-center text-slate-600 dark:text-slate-400 mb-6">{user?.email}</p>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{user?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Campaigns Created</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{myCampaigns.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Total Contributed</span>
                    <span className="font-bold text-green-600 dark:text-green-400">${totalContributed.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Total Tax Paid</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">${totalTaxPaid.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <div className="flex space-x-2 mb-8 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${activeTab === 'campaigns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  My Campaigns ({myCampaigns.length})
                </button>
                <button
                  onClick={() => setActiveTab('contributions')}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${activeTab === 'contributions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  Contributions ({myContributions.length})
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
                >
                  Payments
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                      <Heart className="w-10 h-10 text-blue-600 mb-3" />
                      <div className="text-3xl font-bold text-blue-900 mb-1">{myCampaigns.length}</div>
                      <div className="text-blue-700 font-medium">Campaigns Created</div>
                      <div className="text-sm text-blue-600 mt-2">Raised ${totalCampaignFunds.toFixed(2)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 dark:border-green-800">
                      <DollarSign className="w-10 h-10 text-green-600 mb-3" />
                      <div className="text-3xl font-bold text-green-900 mb-1">${totalContributed.toFixed(2)}</div>
                      <div className="text-green-700 font-medium">Total Contributed</div>
                      <div className="text-sm text-green-600 mt-2">{myContributions.length} contributions</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                      <Receipt className="w-10 h-10 text-orange-600 mb-3" />
                      <div className="text-3xl font-bold text-orange-900 mb-1">${totalTaxPaid.toFixed(2)}</div>
                      <div className="text-orange-700 font-medium">Tax Payments</div>
                      <div className="text-sm text-orange-600 mt-2">{myPayments.length} payments</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Recent Activity</h3>
                    <div className="space-y-3">
                      {myPayments.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <div>
                              <div className="font-medium text-slate-900">{payment.sector_name}</div>
                              <div className="text-xs text-slate-600">{new Date(payment.payment_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="font-bold text-slate-900">${payment.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'campaigns' && (
                <div className="space-y-4">
                  {myCampaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-600">You haven't created any campaigns yet</p>
                      <button
                        onClick={() => onNavigate('crowdfunding')}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Create Campaign
                      </button>
                    </div>
                  ) : (
                    myCampaigns.map((campaign) => {
                      const progress = (campaign.current_amount / campaign.goal_amount) * 100;
                      return (
                        <div key={campaign.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-slate-900">{campaign.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{campaign.description}</p>
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400 text-sm">Raised</span>
                            <span className="font-bold text-slate-900">
                              ${campaign.current_amount.toFixed(2)} / ${campaign.goal_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'contributions' && (
                <div className="space-y-3">
                  {myContributions.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-600">You haven't made any contributions yet</p>
                      <button
                        onClick={() => onNavigate('crowdfunding')}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Browse Campaigns
                      </button>
                    </div>
                  ) : (
                    myContributions.map((contribution) => (
                      <div key={contribution.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900">{contribution.campaign_title}</div>
                          <div className="text-sm text-slate-600">
                            {new Date(contribution.created_at).toLocaleDateString()} • {contribution.donation_term}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 text-lg">${contribution.amount.toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-3">
                  {myPayments.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-600">No payment history</p>
                      <button
                        onClick={() => onNavigate('tax-payment')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Make Payment
                      </button>
                    </div>
                  ) : (
                    <>
                      {myPayments.map((payment) => (
                        <div key={payment.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-slate-900">{payment.sector_name}</div>
                            <div className="text-sm text-slate-600">
                              {new Date(payment.payment_date).toLocaleDateString()} at {new Date(payment.payment_date).toLocaleTimeString()}
                            </div>
                            {payment.auto_pay && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                Auto-pay
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900 dark:text-white text-lg">${payment.amount.toFixed(2)}</div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => onNavigate('settings')}
                        className="w-full mt-4 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-slate-700"
                      >
                        View Full History
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
