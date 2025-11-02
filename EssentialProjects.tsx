import { useState, useEffect } from 'react';
import { Home, Vote, TrendingUp, Users, CheckCircle, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface EssentialProjectsProps {
  onNavigate: (page: string) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  estimated_cost: number;
  priority_score: number;
  votes: number;
  status: string;
  category: string;
  deadline: string;
  created_at: string;
}

export const EssentialProjects = ({ onNavigate }: EssentialProjectsProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [votingMessage, setVotingMessage] = useState('');

  useEffect(() => {
    loadProjects();
    loadUserVotes();
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('essential_projects')
        .select('*')
        .eq('status', 'active')
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_votes')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const votes: Record<string, boolean> = {};
      data?.forEach(vote => {
        votes[vote.project_id] = true;
      });
      setUserVotes(votes);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const handleVote = async (projectId: string) => {
    if (!user) {
      setVotingMessage('Please log in to vote');
      return;
    }

    if (userVotes[projectId]) {
      setVotingMessage('You have already voted for this project');
      return;
    }

    try {
      const { error: voteError } = await supabase
        .from('project_votes')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            vote_weight: 1
          }
        ]);

      if (voteError) throw voteError;

      const project = projects.find(p => p.id === projectId);
      if (project) {
        const { error: updateError } = await supabase
          .from('essential_projects')
          .update({
            votes: project.votes + 1,
            priority_score: project.priority_score + 10
          })
          .eq('id', projectId);

        if (updateError) throw updateError;
      }

      setUserVotes({ ...userVotes, [projectId]: true });
      setVotingMessage('Vote recorded successfully!');
      loadProjects();

      setTimeout(() => setVotingMessage(''), 3000);
    } catch (error) {
      console.error('Error voting:', error);
      setVotingMessage('Error recording vote. Please try again.');
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 100) return 'bg-red-100 dark:bg-black text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
    if (score >= 50) return 'bg-orange-100 dark:bg-black text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
    return 'bg-yellow-100 dark:bg-black text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 100) return 'Critical';
    if (score >= 50) return 'High';
    return 'Medium';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <nav className="bg-white dark:bg-black shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Vote className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-slate-900 dark:text-black">Essential Projects</span>
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">Essential Infrastructure Projects</h1>
          <p className="text-blue-100 text-lg mb-4">
            Vote for the projects you believe should be prioritized. Projects with the highest votes will be completed first.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Vote className="w-5 h-5" />
              <span>One vote per project</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Democratic decision making</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Real-time priority updates</span>
            </div>
          </div>
        </div>

        {votingMessage && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-black border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-lg">
            {votingMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-black">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-xl shadow-lg p-12 text-center">
            <Vote className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-black mb-2">No Active Projects</h3>
            <p className="text-slate-600 dark:text-black">There are no essential projects available for voting at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-black">{project.title}</h3>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(project.priority_score)}`}>
                        {getPriorityLabel(project.priority_score)} Priority
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900 dark:text-black">{project.votes}</div>
                      <div className="text-sm text-slate-500 dark:text-black">votes</div>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-black mb-4 text-lg">{project.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-black rounded-lg p-4">
                      <p className="text-sm text-slate-500 dark:text-black mb-1">Estimated Cost</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-black">
                        ₹{project.estimated_cost.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-black rounded-lg p-4">
                      <p className="text-sm text-slate-500 dark:text-black mb-1">Category</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-black capitalize">
                        {project.category}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-black rounded-lg p-4">
                      <p className="text-sm text-slate-500 dark:text-black mb-1">Target Completion</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-black">
                        {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-black">
                      <TrendingUp className="w-5 h-5" />
                      <span>Priority Score: {project.priority_score}</span>
                    </div>
                    <button
                      onClick={() => handleVote(project.id)}
                      disabled={userVotes[project.id]}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
                        userVotes[project.id]
                          ? 'bg-slate-200 dark:bg-black text-slate-500 dark:text-black cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {userVotes[project.id] ? (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Voted</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" />
                          <span>Vote for This Project</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {userVotes[project.id] && (
                  <div className="bg-green-50 dark:bg-black border-t border-green-200 dark:border-green-800 px-6 py-3">
                    <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You voted for this project</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white dark:bg-black rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-black mb-4">How Voting Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">📊 Democratic Process</h4>
              <p className="text-slate-600 dark:text-black">
                Each registered taxpayer gets one vote per project. Projects with the most votes are prioritized for completion.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">🔐 Blockchain Verified</h4>
              <p className="text-slate-600 dark:text-black">
                All votes are recorded on the blockchain, ensuring transparency and preventing manipulation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">⏱️ Real-Time Updates</h4>
              <p className="text-slate-600 dark:text-black">
                Priority scores update immediately as votes are cast, reflecting the community's will in real-time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-black mb-2">✅ Essential Projects Only</h4>
              <p className="text-slate-600 dark:text-black">
                These projects address critical infrastructure needs that benefit everyone in the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
