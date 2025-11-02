import { Home as HomeIcon, CreditCard, Heart, User, Settings, TrendingUp, Shield, Users, Calculator, FileText, HelpCircle, Phone, Mail, Search, Receipt, CheckCircle, Calendar, History, Vote, Sparkles, Link2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">TaxFund Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300 font-medium"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to TaxFund Portal</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your one-stop platform for tax payments and community crowdfunding
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('tax-payment')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-blue-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Pay Tax</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-green-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Payment History</span>
            </button>

            <button
              onClick={() => onNavigate('crowdfunding')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-pink-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Crowdfunding</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-orange-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">My Profile</span>
            </button>

            <button
              onClick={() => onNavigate('calculator')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900 dark:to-violet-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-violet-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Tax Calculator</span>
            </button>

            <button
              onClick={() => onNavigate('verify')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-cyan-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Verify Payment</span>
            </button>

            <button className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-xl hover:shadow-lg transition-all group">
              <div className="bg-yellow-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Download Forms</span>
            </button>

            <button
              onClick={() => onNavigate('help')}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="bg-red-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-center">Help & Support</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => onNavigate('tax-payment')}
            className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent hover:border-blue-500"
          >
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Tax Payments</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              Pay taxes for multiple sectors including Property, Business, Vehicle, Income, Road, Army/Defense, Education, Healthcare, and Infrastructure. Track budget limits and payment history.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Make a Payment</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => onNavigate('crowdfunding')}
            className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent hover:border-green-500"
          >
            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Crowdfunding</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              Support community projects or create your own campaign. Choose from one-time, monthly, quarterly, or yearly contribution plans. Track campaign progress with regular updates.
            </p>
            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Explore Campaigns</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => onNavigate('essential-projects')}
            className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400"
          >
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Vote className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Essential Projects Voting</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Vote for critical infrastructure projects that should be prioritized. Your voice matters in deciding what gets built first - roads, bridges, schools, hospitals, and more.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Cast Your Vote</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => onNavigate('non-essential-projects')}
            className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400"
          >
            <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Community Projects</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Support community enhancement projects with your contributions. Choose which quality-of-life improvements you want to fund - parks, art, wi-fi, sports facilities, and more.
            </p>
            <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Support Projects</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure Payments</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              All transactions are encrypted with bank-level security. Your financial data is protected with industry-standard protocols.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Real-time Tracking</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Monitor your tax payments and crowdfunding contributions in real-time. Access detailed history and receipts anytime.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Community Support</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Join thousands of users supporting community projects. Create campaigns and share progress updates with contributors.
            </p>
          </div>

          <button
            onClick={() => onNavigate('blockchain')}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-md hover:shadow-xl transition-all group cursor-pointer text-left"
          >
            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Blockchain Explorer</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              View all transactions on our secure blockchain. Every payment is permanently recorded and publicly verifiable.
            </p>
          </button>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Helpline</div>
                    <div className="text-slate-300">1800-180-1961</div>
                    <div className="text-sm text-slate-400">Mon-Fri: 9:00 AM - 6:00 PM</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Email Support</div>
                    <div className="text-slate-300">support@taxfundportal.gov</div>
                    <div className="text-sm text-slate-400">Response within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Important Links</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="text-left py-2 px-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-sm">
                  FAQs
                </button>
                <button className="text-left py-2 px-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-sm">
                  Tax Guide
                </button>
                <button className="text-left py-2 px-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-sm">
                  Privacy Policy
                </button>
                <button className="text-left py-2 px-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-sm">
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-slate-700 dark:text-slate-300 font-medium">Tax Payments Processed</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Successfully completed this year</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 mb-2">$2.5M+</div>
            <div className="text-slate-700 dark:text-slate-300 font-medium">Raised for Communities</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Through crowdfunding campaigns</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-3xl font-bold text-orange-600 mb-2">5,000+</div>
            <div className="text-slate-700 dark:text-slate-300 font-medium">Active Users</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Growing community of supporters</div>
          </div>
        </div>
      </div>
    </div>
  );
};
