import { useEffect, useState } from 'react';
import { supabase, CrowdfundingCampaign } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ArrowLeft, Plus, DollarSign, TrendingUp, Upload, Calendar, Clock, Eye } from 'lucide-react';
import { CampaignUpdates } from '../components/CampaignUpdates';

interface CrowdfundingProps {
  onNavigate: (page: string) => void;
}

export const Crowdfunding = ({ onNavigate }: CrowdfundingProps) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<(CrowdfundingCampaign & { image_url?: string })[]>([]);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [donationTerm, setDonationTerm] = useState<'one-time' | 'monthly' | 'quarterly' | 'yearly'>('one-time');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('crowdfunding_campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCampaigns(data);
    }
  };

  const handleContribute = async (campaignId: string) => {
    if (!user) return;

    setLoading(true);
    setMessage('');

    const amount = parseFloat(contributionAmount);

    const { error: contributionError } = await supabase
      .from('crowdfunding_contributions')
      .insert([
        {
          campaign_id: campaignId,
          contributor_id: user.id,
          amount: amount,
          donation_term: donationTerm,
        },
      ]);

    if (contributionError) {
      setMessage('Error processing contribution');
      setLoading(false);
      return;
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const { error: updateError } = await supabase
        .from('crowdfunding_campaigns')
        .update({
          current_amount: campaign.current_amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) {
        setMessage('Error updating campaign');
      } else {
        setMessage('Contribution successful!');
        setShowContribute(null);
        setContributionAmount('');
        setDonationTerm('one-time');
        loadCampaigns();
      }
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('crowdfunding_campaigns')
      .insert([
        {
          creator_id: user.id,
          title,
          description,
          goal_amount: parseFloat(goalAmount),
          current_amount: 0,
          status: 'active',
          image_url: imageUrl || 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg',
        },
      ]);

    if (error) {
      setMessage('Error creating campaign');
    } else {
      setMessage('Campaign created successfully!');
      setShowRegister(false);
      setTitle('');
      setDescription('');
      setGoalAmount('');
      setImageUrl('');
      loadCampaigns();
    }

    setLoading(false);
  };

  const termOptions = [
    { value: 'one-time', label: 'One-time', icon: DollarSign, description: 'Single donation' },
    { value: 'monthly', label: 'Monthly', icon: Calendar, description: 'Recurring monthly' },
    { value: 'quarterly', label: 'Quarterly', icon: Clock, description: 'Every 3 months' },
    { value: 'yearly', label: 'Yearly', icon: TrendingUp, description: 'Annual donation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Register Campaign</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-full mb-4 shadow-lg">
            <Heart className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Crowdfunding Campaigns</h1>
          <p className="text-xl text-slate-600">Support community projects with flexible donation options</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg max-w-3xl mx-auto ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message}
          </div>
        )}

        {showRegister && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Register New Campaign</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Campaign Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Help Build Community Center"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Tell your story and explain how the funds will be used..."
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Campaign Image URL
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="https://example.com/image.jpg (optional)"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Provide an image URL or leave blank for a default image
                  </p>
                </div>
                <div>
                  <label htmlFor="goalAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Goal Amount ($)
                  </label>
                  <input
                    id="goalAmount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="5000.00"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegister(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 shadow-md"
                  >
                    {loading ? 'Creating...' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const progress = (campaign.current_amount / campaign.goal_amount) * 100;
            return (
              <div key={campaign.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
                  {campaign.image_url ? (
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Heart className="w-16 h-16 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">{progress.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{campaign.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">{campaign.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Progress</span>
                      <span className="font-semibold text-slate-900">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        ${campaign.current_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-600">
                        of ${campaign.goal_amount.toFixed(2)} goal
                      </div>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>

                  {showContribute === campaign.id ? (
                    <div className="space-y-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {termOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setDonationTerm(option.value as typeof donationTerm)}
                            className={`p-3 rounded-lg border-2 transition ${
                              donationTerm === option.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <option.icon className="w-5 h-5 mx-auto mb-1" />
                            <div className="text-xs font-semibold">{option.label}</div>
                          </button>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setShowContribute(null);
                            setContributionAmount('');
                            setDonationTerm('one-time');
                          }}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleContribute(campaign.id)}
                          disabled={loading || !contributionAmount}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowContribute(campaign.id)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-md flex items-center justify-center space-x-2"
                      >
                        <DollarSign className="w-5 h-5" />
                        <span>Contribute</span>
                      </button>
                      <button
                        onClick={() => setSelectedCampaign(campaign.id)}
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-medium hover:bg-slate-200 transition flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Updates</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-300 mb-4">
              <Heart className="w-24 h-24 mx-auto" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xl mb-2">No active campaigns yet</p>
            <p className="text-slate-500">Be the first to create one and make a difference!</p>
          </div>
        )}

        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-4xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Campaign Updates</h2>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="p-2 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              <CampaignUpdates
                campaignId={selectedCampaign}
                isCreator={campaigns.find(c => c.id === selectedCampaign)?.creator_id === user?.id}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
