import { useState } from 'react';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DeadlineManagementProps {
  onNavigate: (page: string) => void;
}

interface TaxDeadline {
  id: string;
  sector_name: string;
  original_deadline: string;
  current_deadline: string;
  is_extended: boolean;
  extension_reason?: string;
  system_outage_hours?: number;
  status: 'active' | 'passed' | 'extended';
}

export const DeadlineManagement = ({ onNavigate }: DeadlineManagementProps) => {
  const [deadlines] = useState<TaxDeadline[]>([
    {
      id: '1',
      sector_name: 'Income Tax',
      original_deadline: '2025-12-31T23:59:59Z',
      current_deadline: '2025-12-31T23:59:59Z',
      is_extended: false,
      status: 'active'
    },
    {
      id: '2',
      sector_name: 'Property Tax',
      original_deadline: '2025-11-30T23:59:59Z',
      current_deadline: '2025-12-05T23:59:59Z',
      is_extended: true,
      extension_reason: 'System maintenance on Nov 28-29',
      system_outage_hours: 48,
      status: 'extended'
    },
    {
      id: '3',
      sector_name: 'Business Tax',
      original_deadline: '2025-12-15T23:59:59Z',
      current_deadline: '2025-12-15T23:59:59Z',
      is_extended: false,
      status: 'active'
    },
  ]);

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDeadlineColor = (deadline: string, status: string) => {
    if (status === 'passed') return 'bg-red-100 border-red-200';
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return 'bg-red-100 border-red-200';
    if (days <= 7) return 'bg-yellow-100 border-yellow-200';
    return 'bg-green-100 border-green-200';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full mb-4 shadow-lg">
            <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Tax Deadlines & Extensions</h1>
          <p className="text-xl text-slate-600">Fair deadlines aligned with system reliability</p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Automatic Extension Policy</h2>
          <p className="text-blue-100 mb-4">
            We believe in fair treatment. If our system experiences outages or performance issues,
            deadlines are automatically extended so you're never penalized for problems beyond your control.
          </p>
          <div className="flex items-start space-x-3 bg-blue-800 bg-opacity-50 p-4 rounded-lg">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-semibold mb-1">Extension Criteria</div>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>• System downtime greater than 1 hour</li>
                <li>• Performance degradation greater than 4 hours</li>
                <li>• Scheduled maintenance during peak hours</li>
                <li>• Critical bugs affecting payments</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {deadlines.map((deadline) => {
              const days = getDaysUntilDeadline(deadline.current_deadline);
              return (
                <div
                  key={deadline.id}
                  className={`border-2 rounded-xl p-6 transition ${getDeadlineColor(deadline.current_deadline, deadline.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{deadline.sector_name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-slate-700">
                        <Clock className="w-4 h-4" />
                        <span>
                          {deadline.status === 'passed' ? 'Deadline Passed' :
                           days < 0 ? 'Overdue' :
                           days === 0 ? 'Due Today' :
                           days === 1 ? 'Due Tomorrow' :
                           `${days} days remaining`}
                        </span>
                      </div>
                    </div>
                    {deadline.is_extended ? (
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Extended
                      </span>
                    ) : (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-slate-800 bg-opacity-70 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Original Deadline</div>
                      <div className="font-semibold text-slate-900">
                        {new Date(deadline.original_deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 bg-opacity-70 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Deadline</div>
                      <div className="font-semibold text-slate-900">
                        {new Date(deadline.current_deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {deadline.is_extended && deadline.extension_reason && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-blue-900 mb-1">Extension Granted</div>
                          <div className="text-sm text-blue-800 dark:text-blue-200">{deadline.extension_reason}</div>
                          {deadline.system_outage_hours && (
                            <div className="text-xs text-blue-700 mt-2">
                              System was unavailable for {deadline.system_outage_hours} hours.
                              Deadline extended to compensate.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {deadline.status !== 'passed' && (
                    <button
                      onClick={() => onNavigate('tax-payment')}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Make Payment
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-yellow-900 mb-2">Important Information</div>
              <p className="text-sm text-yellow-800 leading-relaxed">
                All deadline extensions due to system issues are communicated via email and displayed here.
                Extensions are applied automatically - you don't need to take any action.
                If you believe you should have received an extension but didn't, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
