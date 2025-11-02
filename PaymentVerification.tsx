import { useState } from 'react';
import { supabase, TaxPayment } from '../lib/supabase';
import { ArrowLeft, Search, CheckCircle, XCircle, FileText, Calendar, DollarSign } from 'lucide-react';

interface PaymentVerificationProps {
  onNavigate: (page: string) => void;
}

export const PaymentVerification = ({ onNavigate }: PaymentVerificationProps) => {
  const [searchType, setSearchType] = useState<'id' | 'email'>('id');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<(TaxPayment & { sector_name?: string; user_email?: string }) | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a value to search');
      return;
    }

    setLoading(true);
    setError('');
    setPayment(null);

    try {
      if (searchType === 'id') {
        const { data: paymentData, error: paymentError } = await supabase
          .from('tax_payments')
          .select('*')
          .eq('id', searchValue)
          .maybeSingle();

        if (paymentError) throw paymentError;

        if (paymentData) {
          const { data: sectorData } = await supabase
            .from('tax_sectors')
            .select('name')
            .eq('id', paymentData.sector_id)
            .single();

          const { data: userData } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', paymentData.user_id)
            .single();

          if (userData) {
            const { data: authData } = await supabase.auth.admin.getUserById(paymentData.user_id);
            setPayment({
              ...paymentData,
              sector_name: sectorData?.name || 'Unknown',
              user_email: authData.user?.email || 'Unknown'
            });
          }
        } else {
          setError('Payment not found with this ID');
        }
      } else {
        setError('Email search is not yet implemented. Please use Payment ID.');
      }
    } catch (err) {
      setError('Error searching for payment. Please try again.');
      console.error(err);
    }

    setLoading(false);
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-cyan-100 to-cyan-200 p-4 rounded-full mb-4 shadow-lg">
            <CheckCircle className="w-12 h-12 text-cyan-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Verify Payment</h1>
          <p className="text-xl text-slate-600">Check the status of your tax payment</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Search Payment</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Search By
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSearchType('id')}
                  className={`p-4 rounded-lg border-2 transition ${
                    searchType === 'id'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Payment ID</div>
                </button>
                <button
                  onClick={() => setSearchType('email')}
                  className={`p-4 rounded-lg border-2 transition ${
                    searchType === 'email'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Search className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Email Address</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="searchValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {searchType === 'id' ? 'Enter Payment ID' : 'Enter Email Address'}
              </label>
              <input
                id="searchValue"
                type={searchType === 'email' ? 'email' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                placeholder={searchType === 'id' ? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' : 'your@email.com'}
              />
              <p className="mt-2 text-sm text-slate-500">
                {searchType === 'id'
                  ? 'You can find your Payment ID in your payment history or receipt'
                  : 'Enter the email address used for the payment'}
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 transition disabled:opacity-50 shadow-lg text-lg flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>{loading ? 'Searching...' : 'Search Payment'}</span>
            </button>
          </div>
        </div>

        {payment && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Payment Details</h2>
              <div className={`px-4 py-2 rounded-full font-semibold ${
                payment.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : payment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {payment.status === 'completed' && <CheckCircle className="w-5 h-5 inline mr-2" />}
                {payment.status === 'failed' && <XCircle className="w-5 h-5 inline mr-2" />}
                {payment.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Payment ID</div>
                  <div className="font-mono text-sm text-slate-900 dark:text-white break-all">{payment.id}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tax Sector</div>
                  <div className="font-semibold text-slate-900">{payment.sector_name}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Amount Paid</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    <DollarSign className="w-5 h-5" />
                    {payment.amount.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Payment Date</div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(payment.payment_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {payment.auto_pay && (
                  <div className="bg-blue-50 p-4 rounded-lg md:col-span-2">
                    <div className="text-sm text-blue-700 font-semibold">
                      This was an automatic payment
                    </div>
                  </div>
                )}
              </div>

              {payment.status === 'completed' && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-6 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-green-900 mb-2">Payment Verified</div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        This payment has been successfully processed and recorded in our system.
                        You can download your receipt from your profile settings.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => onNavigate('settings')}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  View All Payments
                </button>
                <button
                  onClick={() => onNavigate('tax-payment')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Make Another Payment
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Need Help?</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
            If you're having trouble finding your payment or have questions about your transaction,
            please contact our support team.
          </p>
          <button
            onClick={() => onNavigate('help')}
            className="text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
};
