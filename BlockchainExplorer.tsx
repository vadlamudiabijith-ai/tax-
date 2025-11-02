import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Search, Filter, TrendingUp, Clock, Hash, User, DollarSign, Box } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { blockchain, Block } from '../utils/blockchain';

interface BlockchainExplorerProps {
  onNavigate: (page: string) => void;
}

interface BlockData {
  id: string;
  block_index: number;
  block_timestamp: number;
  transaction_id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  category: string | null;
  hash: string;
  previous_hash: string;
  nonce: number;
  created_at: string;
}

export const BlockchainExplorer = ({ onNavigate }: BlockchainExplorerProps) => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      setLoading(true);

      const { data: blocksData, error: blocksError } = await supabase
        .from('blockchain_blocks')
        .select('*')
        .order('block_index', { ascending: false })
        .limit(50);

      if (blocksError) throw blocksError;

      if (blocksData) {
        setBlocks(blocksData);
      }

      const { data: statsData, error: statsError } = await supabase
        .rpc('get_blockchain_stats');

      if (!statsError && statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyBlockchain = async () => {
    try {
      setVerifying(true);

      const blockObjects: Block[] = blocks.map(b => ({
        index: b.block_index,
        timestamp: b.block_timestamp,
        data: {
          transactionId: b.transaction_id,
          userId: b.user_id,
          type: b.transaction_type as any,
          amount: Number(b.amount),
          category: b.category || undefined,
        },
        previousHash: b.previous_hash,
        hash: b.hash,
        nonce: b.nonce,
      })).reverse();

      const valid = await blockchain.verifyChain(blockObjects);
      setIsValid(valid);

      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase.from('blockchain_verification').insert({
          blocks_verified: blocks.length,
          is_valid: valid,
          verified_by: user.data.user.id,
          verification_hash: blockchain.generateTransactionId(),
        });
      }
    } catch (error) {
      console.error('Error verifying blockchain:', error);
      setIsValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch =
      block.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || block.transaction_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tax_payment':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'crowdfunding':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'donation':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">Blockchain Explorer</span>
              </div>
            </div>
            <button
              onClick={verifyBlockchain}
              disabled={verifying || blocks.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify Chain</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isValid !== null && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${isValid ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
            <div className="flex items-center space-x-3">
              {isValid ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <div>
                <div className={`font-semibold ${isValid ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {isValid ? 'Blockchain Verified' : 'Blockchain Invalid'}
                </div>
                <div className={`text-sm ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isValid
                    ? 'All blocks have been verified and the chain integrity is intact.'
                    : 'The blockchain has been tampered with or contains invalid blocks.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Blocks</div>
                <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_blocks}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Amount</div>
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ${Number(stats.total_amount).toLocaleString()}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">Tax Payments</div>
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_tax_payments}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">Crowdfunding</div>
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_crowdfunding}</div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, hash, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="tax_payment">Tax Payments</option>
                <option value="crowdfunding">Crowdfunding</option>
                <option value="donation">Donations</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <div className="text-slate-600 dark:text-slate-400">Loading blockchain data...</div>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No blocks found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlocks.map((block) => (
                <div
                  key={block.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Block #{block.block_index}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimestamp(block.block_timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(block.transaction_type)}`}>
                      {block.transaction_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 mb-1">Transaction ID</div>
                      <div className="font-mono text-slate-900 dark:text-white break-all">{block.transaction_id}</div>
                    </div>
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 mb-1">Amount</div>
                      <div className="font-semibold text-green-600 dark:text-green-400 text-lg">
                        ${Number(block.amount).toLocaleString()}
                      </div>
                    </div>
                    {block.category && (
                      <div>
                        <div className="text-slate-600 dark:text-slate-400 mb-1">Category</div>
                        <div className="text-slate-900 dark:text-white capitalize">{block.category}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 mb-1">Nonce</div>
                      <div className="text-slate-900 dark:text-white font-mono">{block.nonce}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-start space-x-2">
                      <Hash className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Block Hash</div>
                        <div className="font-mono text-xs text-slate-900 dark:text-white break-all">{block.hash}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Hash className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Previous Hash</div>
                        <div className="font-mono text-xs text-slate-900 dark:text-white break-all">{block.previous_hash}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
