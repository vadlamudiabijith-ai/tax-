import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getBrowserWarning } from '../utils/browserSupport';

export const BrowserWarning = () => {
  const [warning, setWarning] = useState<ReturnType<typeof getBrowserWarning>>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const browserWarning = getBrowserWarning();
    setWarning(browserWarning);

    const dismissedWarnings = localStorage.getItem('dismissedBrowserWarnings');
    if (dismissedWarnings && browserWarning) {
      const dismissed = JSON.parse(dismissedWarnings);
      if (dismissed[browserWarning.message]) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    if (warning) {
      const dismissedWarnings = localStorage.getItem('dismissedBrowserWarnings');
      const dismissed = dismissedWarnings ? JSON.parse(dismissedWarnings) : {};
      dismissed[warning.message] = true;
      localStorage.setItem('dismissedBrowserWarnings', JSON.stringify(dismissed));
      setDismissed(true);
    }
  };

  if (!warning || (dismissed && !warning.shouldBlock)) {
    return null;
  }

  if (warning.shouldBlock) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex items-center justify-center p-4 z-50">
        <div className="max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Unsupported Browser</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{warning.message}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold">Recommended browsers:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded">Google Chrome</div>
              <div className="bg-slate-50 p-2 rounded">Mozilla Firefox</div>
              <div className="bg-slate-50 p-2 rounded">Safari</div>
              <div className="bg-slate-50 p-2 rounded">Microsoft Edge</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 p-4 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">{warning.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-600 hover:text-yellow-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
