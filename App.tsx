import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { TaxPayment } from './pages/TaxPayment';
import { Crowdfunding } from './pages/Crowdfunding';
import { Settings } from './pages/Settings';
import { TaxCalculator } from './pages/TaxCalculator';
import { PaymentVerification } from './pages/PaymentVerification';
import { HelpSupport } from './pages/HelpSupport';
import { SystemStatus } from './pages/SystemStatus';
import { DeadlineManagement } from './pages/DeadlineManagement';
import { PaymentHistory } from './pages/PaymentHistory';
import { EssentialProjects } from './pages/EssentialProjects';
import { NonEssentialProjects } from './pages/NonEssentialProjects';
import { BlockchainExplorer } from './pages/BlockchainExplorer';
import { BrowserWarning } from './components/BrowserWarning';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (!loading && !user) {
      setCurrentPage('login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'signup') {
      return <Signup onNavigate={setCurrentPage} />;
    }
    return <Login onNavigate={setCurrentPage} />;
  }

  switch (currentPage) {
    case 'profile':
      return <Profile onNavigate={setCurrentPage} />;
    case 'tax-payment':
      return <TaxPayment onNavigate={setCurrentPage} />;
    case 'crowdfunding':
      return <Crowdfunding onNavigate={setCurrentPage} />;
    case 'settings':
      return <Settings onNavigate={setCurrentPage} />;
    case 'calculator':
      return <TaxCalculator onNavigate={setCurrentPage} />;
    case 'verify':
      return <PaymentVerification onNavigate={setCurrentPage} />;
    case 'help':
      return <HelpSupport onNavigate={setCurrentPage} />;
    case 'status':
      return <SystemStatus onNavigate={setCurrentPage} />;
    case 'deadlines':
      return <DeadlineManagement onNavigate={setCurrentPage} />;
    case 'history':
      return <PaymentHistory onNavigate={setCurrentPage} />;
    case 'essential-projects':
      return <EssentialProjects onNavigate={setCurrentPage} />;
    case 'non-essential-projects':
      return <NonEssentialProjects onNavigate={setCurrentPage} />;
    case 'blockchain':
      return <BlockchainExplorer onNavigate={setCurrentPage} />;
    default:
      return <Home onNavigate={setCurrentPage} />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserWarning />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
