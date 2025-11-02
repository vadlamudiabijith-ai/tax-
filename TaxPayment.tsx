import { useEffect, useState } from 'react';
import { supabase, TaxSector } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Building2,
  Briefcase,
  Car,
  Wallet,
  Construction,
  Shield,
  GraduationCap,
  Heart,
  Building
} from 'lucide-react';
import { PaymentGateway } from '../components/PaymentGateway';

interface TaxPaymentProps {
  onNavigate: (page: string) => void;
}

const iconMap: Record<string, any> = {
  Building2,
  Briefcase,
  Car,
  Wallet,
  Construction,
  Shield,
  GraduationCap,
  Heart,
  Building,
};

export const TaxPayment = ({ onNavigate }: TaxPaymentProps) => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<(TaxSector & { image_url?: string; icon?: string })[]>([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [amount, setAmount] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    const { data, error } = await supabase
      .from('tax_sectors')
      .select('*')
      .order('name');

    if (!error && data) {
      setSectors(data);
    }
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const paymentAmount = parseFloat(amount);
    const sector = sectors.find(s => s.id === selectedSector);

    if (!sector) {
      setMessage('Invalid sector selected');
      return;
    }

    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      setMessage('Please enter a valid PAN number (e.g., ABCDE1234F)');
      return;
    }

    if (!aadharNumber || !/^[0-9]{12}$/.test(aadharNumber)) {
      setMessage('Please enter a valid 12-digit Aadhar number');
      return;
    }

    if (sector.current_year_collected + paymentAmount > sector.annual_budget_limit) {
      setMessage('Payment amount would exceed sector budget limit');
      return;
    }

    setMessage('');
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentGateway(false);
    if (!user) return;

    setLoading(true);
    setMessage('');

    const paymentAmount = parseFloat(amount);
    const sector = sectors.find(s => s.id === selectedSector);

    if (!sector) {
      setMessage('Invalid sector selected');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('tax_payments')
      .insert([
        {
          user_id: user.id,
          sector_id: selectedSector,
          amount: paymentAmount,
          status: 'completed',
          auto_pay: false,
          pan_number: panNumber,
          aadhar_number: aadharNumber,
        },
      ]);

    if (error) {
      setMessage('Error processing payment: ' + error.message);
      setLoading(false);
      return;
    }

    const newCollected = sector.current_year_collected + paymentAmount;
    const isNowFull = newCollected >= sector.annual_budget_limit;

    const { error: updateError } = await supabase
      .from('tax_sectors')
      .update({
        current_year_collected: newCollected,
        is_active: !isNowFull
      })
      .eq('id', selectedSector);

    if (updateError) {
      console.error('Error updating sector:', updateError);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedSector('');
      setAmount('');
      setPanNumber('');
      setAadharNumber('');
      loadSectors();
    }, 3000);
    setLoading(false);
  };

  const selectedSectorData = sectors.find(s => s.id === selectedSector);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 backdrop-blur-sm bg-opacity-90">
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full mb-4 shadow-lg">
            <CreditCard className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Tax Payments</h1>
          <p className="text-xl text-slate-600">Select a sector and submit your payment securely</p>
        </div>

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center space-x-3 max-w-2xl mx-auto shadow-md">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-green-700 font-medium">Payment processed successfully!</span>
          </div>
        )}

        {message && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-2xl mx-auto shadow-md">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Select Tax Sector</h2>
            <div className="grid gap-4">
              {sectors.map((sector) => {
                const IconComponent = sector.icon ? iconMap[sector.icon] : Wallet;
                const isSelected = selectedSector === sector.id;
                const budgetUsedPercent = (sector.current_year_collected / sector.annual_budget_limit) * 100;
                const isFull = !sector.is_active || budgetUsedPercent >= 100;

                return (
                  <button
                    key={sector.id}
                    onClick={() => !isFull && setSelectedSector(sector.id)}
                    disabled={isFull}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                      isFull
                        ? 'border-slate-300 bg-slate-100 dark:bg-slate-700 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-500 shadow-lg scale-105'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {isFull && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        BUDGET FULL
                      </div>
                    )}
                    <div className="flex items-center p-4">
                      {sector.image_url && (
                        <div className={`w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0 ${isFull ? 'grayscale' : ''}`}>
                          <img
                            src={sector.image_url}
                            alt={sector.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className={`flex-shrink-0 ${sector.image_url ? 'hidden' : 'block'} mr-4`}>
                        <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          <IconComponent className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`} />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                          {sector.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{sector.description}</p>
                        {isFull ? (
                          <div className="text-xs text-red-600 font-semibold">
                            Year {sector.budget_year} budget exceeded
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Budget Used:</span>
                              <span className="font-semibold">{budgetUsedPercent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  budgetUsedPercent > 90 ? 'bg-red-500' : budgetUsedPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-slate-500">
                              ${sector.current_year_collected.toLocaleString()} / ${sector.annual_budget_limit.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                      {isSelected && !isFull && (
                        <CheckCircle className="w-6 h-6 text-blue-600 ml-4 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Payment Details</h2>

              {selectedSectorData && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {selectedSectorData.icon && iconMap[selectedSectorData.icon] && (
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {(() => {
                          const Icon = iconMap[selectedSectorData.icon];
                          return <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
                        })()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{selectedSectorData.name}</div>
                      <div className="text-sm text-slate-600">{selectedSectorData.description}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleInitiatePayment} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Payment Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">₹</span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      disabled={!selectedSector}
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    PAN Card Number *
                  </label>
                  <input
                    id="pan"
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    required
                    disabled={!selectedSector}
                    maxLength={10}
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="ABCDE1234F"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)</p>
                </div>

                <div>
                  <label htmlFor="aadhar" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Aadhar Card Number *
                  </label>
                  <input
                    id="aadhar"
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={!selectedSector}
                    maxLength={12}
                    pattern="[0-9]{12}"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="123456789012"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">12-digit Aadhar number</p>
                </div>

                {amount && selectedSector && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">Payment Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sector:</span>
                        <span className="font-medium text-slate-900">{selectedSectorData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount:</span>
                        <span className="font-medium text-slate-900">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-300 my-3"></div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-slate-900">Total:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedSector || !amount}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                >
                  {loading ? 'Processing...' : 'Submit Payment'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => onNavigate('settings')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View payment history in Settings →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Secure Payment Processing</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Bank-Level Security</div>
                <div className="text-blue-100 text-sm">Your data is encrypted and secure</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Instant Confirmation</div>
                <div className="text-blue-100 text-sm">Receive immediate payment receipt</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CreditCard className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Easy Tracking</div>
                <div className="text-blue-100 text-sm">Access full payment history anytime</div>
              </div>
            </div>
          </div>
        </div>

        {showPaymentGateway && (
          <PaymentGateway
            amount={parseFloat(amount)}
            description={`Tax Payment - ${selectedSectorData?.name || 'Tax Sector'}`}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentGateway(false)}
          />
        )}
      </div>
    </div>
  );
};
