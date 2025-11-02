import { useEffect, useState } from 'react';
import { supabase, CampaignUpdate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Image as ImageIcon, X, Calendar } from 'lucide-react';

interface CampaignUpdatesProps {
  campaignId: string;
  isCreator: boolean;
}

export const CampaignUpdates = ({ campaignId, isCreator }: CampaignUpdatesProps) => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUpdates();
  }, [campaignId]);

  const loadUpdates = async () => {
    const { data } = await supabase
      .from('campaign_updates')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (data) {
      setUpdates(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('campaign_updates')
      .insert([
        {
          campaign_id: campaignId,
          creator_id: user.id,
          title,
          description,
          image_url: imageUrl || null,
        },
      ]);

    if (error) {
      setMessage('Error posting update');
    } else {
      setMessage('Update posted successfully!');
      setTitle('');
      setDescription('');
      setImageUrl('');
      setShowForm(false);
      loadUpdates();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Campaign Updates</h3>
        {isCreator && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'Cancel' : 'Post Update'}</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Post Progress Update</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="updateTitle" className="block text-sm font-medium text-slate-700 mb-2">
                Update Title
              </label>
              <input
                id="updateTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Milestone Reached!"
              />
            </div>

            <div>
              <label htmlFor="updateDescription" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="updateDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Share your progress with contributors..."
              />
            </div>

            <div>
              <label htmlFor="updateImage" className="block text-sm font-medium text-slate-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Progress Image URL (optional)
              </label>
              <input
                id="updateImage"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://example.com/progress-image.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Posting...' : 'Post Update'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p>No updates yet</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              {update.image_url && (
                <div className="h-48 overflow-hidden bg-slate-100">
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{update.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{update.description}</p>
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(update.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
