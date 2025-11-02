import { useEffect, useState } from 'react';
import { supabase, UserSettings as UserSettingsType, TaxPayment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, ArrowLeft, Moon, Sun, LogOut, Clock, DollarSign, Bell, Shield, FileText } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export const Settings = ({ onNavigate }: SettingsProps) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettingsType | null>(null);
  const [payments, setPayments] = useState<(TaxPayment & { sector_name?: string })[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'history' | 'security'>('general');

  useEffect(() => {
    if (user) {
      loadSettings();
      loadPaymentHistory();
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
      setTheme(data.theme);
      setAutoPayEnabled(data.auto_pay_enabled);
    }
    setLoading(false);
  };

  const loadPaymentHistory = async () => {
    if (!user) return;

    const { data: paymentsData, error: paymentsError } = await supabase
      .from('tax_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });

    if (!paymentsError && paymentsData) {
      const { data: sectorsData } = await supabase
        .from('tax_sectors')
        .select('*');

      const sectorsMap = new Map(sectorsData?.map(s => [s.id, s.name]) || []);

      const enrichedPayments = paymentsData.map(p => ({
        ...p,
        sector_name: sectorsMap.get(p.sector_id) || 'Unknown'
      }));

      setPayments(enrichedPayments);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('user_settings')
      .update({
        theme,
        auto_pay_enabled: autoPayEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage('Error updating settings');
    } else {
      setMessage('Settings saved successfully');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate('login');
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      <nav className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'} shadow-sm border-b border-slate-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'} transition`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-slate-100 to-slate-200'} p-4 rounded-full mb-4 shadow-lg`}>
            <SettingsIcon className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`} />
          </div>
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-2`}>Settings & Preferences</h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>Manage your account settings and view payment history</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6`}>
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-4`}>Quick Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'general'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="font-medium">General Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'history'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Payment History</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'security'
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Security & Privacy</span>
                </button>
              </div>

              <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className={`mb-4 p-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-50'} rounded-lg`}>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Paid</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalPaid.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{payments.length} transactions</div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-md flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}>
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message}
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-6`}>General Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'} mb-3`}>
                          <Sun className="w-4 h-4 inline mr-2" />
                          Appearance
                        </label>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition ${
                              theme === 'light'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-300 hover:border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            <Sun className="w-5 h-5" />
                            <span>Light</span>
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition ${
                              theme === 'dark'
                                ? 'border-blue-500 bg-blue-900 text-blue-300'
                                : 'border-slate-300 hover:border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            <Moon className="w-5 h-5" />
                            <span>Dark</span>
                          </button>
                        </div>
                      </div>

                      <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'} mb-3`}>
                          <DollarSign className="w-4 h-4 inline mr-2" />
                          Payment Preferences
                        </label>
                        <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                Enable Auto-Pay
                              </span>
                              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                Automatically process tax payments when due
                              </p>
                            </div>
                            <div className="relative ml-4">
                              <input
                                type="checkbox"
                                checked={autoPayEnabled}
                                onChange={(e) => setAutoPayEnabled(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${autoPayEnabled ? 'bg-blue-600' : 'bg-slate-300'} peer-focus:ring-4 peer-focus:ring-blue-300 transition`}></div>
                              <div className={`absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition ${autoPayEnabled ? 'translate-x-5' : ''}`}></div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className={`pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'} mb-3`}>
                          <Bell className="w-4 h-4 inline mr-2" />
                          Notifications
                        </label>
                        <div className="space-y-3">
                          <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                            <label className="flex items-center justify-between cursor-pointer">
                              <div>
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                  Email Notifications
                                </span>
                                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                  Receive updates about payments and campaigns
                                </p>
                              </div>
                              <div className="relative ml-4">
                                <input
                                  type="checkbox"
                                  checked={emailNotifications}
                                  onChange={(e) => setEmailNotifications(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${emailNotifications ? 'bg-blue-600' : 'bg-slate-300'} peer-focus:ring-4 peer-focus:ring-blue-300 transition`}></div>
                                <div className={`absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition ${emailNotifications ? 'translate-x-5' : ''}`}></div>
                              </div>
                            </label>
                          </div>

                          <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                            <label className="flex items-center justify-between cursor-pointer">
                              <div>
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                  Push Notifications
                                </span>
                                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                  Get instant alerts on your device
                                </p>
                              </div>
                              <div className="relative ml-4">
                                <input
                                  type="checkbox"
                                  checked={pushNotifications}
                                  onChange={(e) => setPushNotifications(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${pushNotifications ? 'bg-blue-600' : 'bg-slate-300'} peer-focus:ring-4 peer-focus:ring-blue-300 transition`}></div>
                                <div className={`absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition ${pushNotifications ? 'translate-x-5' : ''}`}></div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 shadow-lg text-lg"
                      >
                        {saving ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-6`}>Payment History</h2>

                  {payments.length === 0 ? (
                    <div className="text-center py-16">
                      <DollarSign className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300'}`} />
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'} text-lg`}>No payment history yet</p>
                      <button
                        onClick={() => onNavigate('tax-payment')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Make Payment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'} p-4 rounded-lg border`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                {payment.sector_name}
                              </h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                {new Date(payment.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                                {new Date(payment.payment_date).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                ${payment.amount.toFixed(2)}
                              </div>
                              <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                          {payment.auto_pay && (
                            <div className={`text-sm flex items-center space-x-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                              <FileText className="w-4 h-4" />
                              <span>Auto-pay</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-6`}>Security & Privacy</h2>

                  <div className="space-y-6">
                    <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-50'} p-6 rounded-xl border ${theme === 'dark' ? 'border-slate-600' : 'border-blue-200'}`}>
                      <div className="flex items-start space-x-4">
                        <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-2`}>Account Security</h3>
                          <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'} mb-3`}>
                            Your account is protected with bank-level encryption and security measures.
                          </p>
                          <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            <li className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span>Encrypted data transmission</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span>Secure authentication</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span>Protected payment information</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-xl`}>
                      <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-4`}>Privacy Settings</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Profile Visibility</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>Only you can see your profile</div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Private</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Payment History</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>Transactions are encrypted</div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Secure</span>
                        </div>
                      </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-xl`}>
                      <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'} mb-3`}>Account Actions</h3>
                      <div className="space-y-3">
                        <button className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white hover:bg-slate-100'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'} rounded-lg transition text-left`}>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Download My Data</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>Get a copy of your information</div>
                        </button>
                        <button className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white hover:bg-slate-100'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'} rounded-lg transition text-left`}>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Change Password</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>Update your password</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
