import { useState, useEffect } from 'react';
import { Home, Sparkles, DollarSign, Users, CheckCircle, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface NonEssentialProjectsProps {
  onNavigate: (page: string) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  estimated_cost: number;
  funding_received: number;
  funding_goal: number;
  contributor_count: number;
  status: string;
  category: string;
  created_at: string;
}

export const NonEssentialProjects = ({ onNavigate }: NonEssentialProjectsProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userContributions, setUserContributions] = useState<Record<string, number>>({});
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProjects();
    loadUserContributions();
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('non_essential_projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserContributions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_contributions')
        .select('project_id, amount')
        .eq('user_id', user.id);

      if (error) throw error;

      const contributions: Record<string, number> = {};
      data?.forEach(contrib => {
        contributions[contrib.project_id] = (contributions[contrib.project_id] || 0) + contrib.amount;
      });
      setUserContributions(contributions);
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const handleContribute = async (projectId: string) => {
    if (!user) {
      setMessage('Please log in to contribute');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.funding_received + amount > project.funding_goal) {
      setMessage('Contribution would exceed funding goal');
      return;
    }

    try {
      const { error: contribError } = await supabase
        .from('project_contributions')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            amount: amount
          }
        ]);

      if (contribError) throw contribError;

      const isFirstContribution = !userContributions[projectId];

      const { error: updateError } = await supabase
        .from('non_essential_projects')
        .update({
          funding_received: project.funding_received + amount,
          contributor_count: project.contributor_count + (isFirstContribution ? 1 : 0)
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      setMessage('Contribution successful! Thank you for your support.');
      setSelectedProject(null);
      setContributionAmount('');
      loadProjects();
      loadUserContributions();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error contributing:', error);
      setMessage('Error processing contribution. Please try again.');
    }
  };

  const getFundingPercentage = (project: Project) => {
    return Math.min(100, (project.funding_received / project.funding_goal) * 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500 dark:bg-green-600';
    if (percentage >= 75) return 'bg-blue-500 dark:bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-orange-500 dark:bg-orange-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <nav className="bg-white dark:bg-black shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold text-slate-900 dark:text-black">Community Projects</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-700 dark:text-black"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-900 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">Community Enhancement Projects</h1>
          <p className="text-purple-100 text-lg mb-4">
            Support projects that improve quality of life in our community. Taxpayers can choose which projects to fund with their contributions.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Flexible contributions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Community driven</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Transparent funding</span>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-black border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-lg">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-slate-600 dark:text-black">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-xl shadow-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-black mb-2">No Active Projects</h3>
            <p className="text-slate-600 dark:text-black">There are no community projects available for funding at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const percentage = getFundingPercentage(project);
              const isFullyFunded = percentage >= 100;

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-black flex-1">{project.title}</h3>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-black text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium capitalize">
                        {project.category}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-black mb-4">{project.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-black">Funding Progress</span>
                        <span className="font-semibold text-slate-900 dark:text-black">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-black rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getStatusColor(percentage)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-black">
                          ₹{project.funding_received.toLocaleString()} raised
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-black">
                          Goal: ₹{project.funding_goal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 dark:bg-black rounded-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-black mb-1">Contributors</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-black">{project.contributor_count}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-black rounded-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-black mb-1">Your Contribution</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-black">
                          ₹{(userContributions[project.id] || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedProject === project.id ? (
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-black text-slate-900 dark:text-black"
                          min="1"
                          step="1"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleContribute(project.id)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                          >
                            Contribute
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(null);
                              setContributionAmount('');
                            }}
                            className="px-6 bg-slate-200 dark:bg-black hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-black py-3 rounded-lg font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedProject(project.id)}
                        disabled={isFullyFunded}
                        className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition ${
                          isFullyFunded
                            ? 'bg-slate-200 dark:bg-black text-slate-500 dark:text-black cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {isFullyFunded ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Fully Funded</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Contribute to This Project</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {userContributions[project.id] > 0 && (
                    <div className="bg-purple-50 dark:bg-black border-t border-purple-200 dark:border-purple-800 px-6 py-3">
                      <div className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">You supported this project</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-white dark:bg-black rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-black mb-4">How Community Projects Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">💰 Flexible Funding</h4>
              <p className="text-slate-600 dark:text-black">
                Contribute any amount you choose. Projects are funded based on taxpayer contributions and preferences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">🔐 Blockchain Transparency</h4>
              <p className="text-slate-600 dark:text-black">
                All contributions are recorded on the blockchain, providing complete transparency and accountability.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">🎯 Your Choice Matters</h4>
              <p className="text-slate-600 dark:text-black">
                Projects are initiated once they reach their funding goal, giving you direct control over community improvements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">✨ Quality of Life</h4>
              <p className="text-slate-600 dark:text-black">
                These projects enhance community amenities, culture, recreation, and other quality-of-life aspects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
