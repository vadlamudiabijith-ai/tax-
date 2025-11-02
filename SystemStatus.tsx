import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, Activity, Database, Globe, Shield, Zap } from 'lucide-react';

interface SystemStatusProps {
  onNavigate: (page: string) => void;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  uptime: number;
  icon: typeof Activity;
}

export const SystemStatus = ({ onNavigate }: SystemStatusProps) => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Tax Payment System', status: 'operational', responseTime: 150, uptime: 99.98, icon: Activity },
    { name: 'Crowdfunding Platform', status: 'operational', responseTime: 120, uptime: 99.95, icon: Globe },
    { name: 'Database', status: 'operational', responseTime: 45, uptime: 99.99, icon: Database },
    { name: 'Authentication', status: 'operational', responseTime: 80, uptime: 99.97, icon: Shield },
    { name: 'Payment Gateway', status: 'operational', responseTime: 200, uptime: 99.92, icon: Zap },
  ]);

  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

  useEffect(() => {
    const checkSystemStatus = () => {
      const hasDown = services.some(s => s.status === 'down');
      const hasDegraded = services.some(s => s.status === 'degraded');
      if (hasDown) setOverallStatus('down');
      else if (hasDegraded) setOverallStatus('degraded');
      else setOverallStatus('operational');
    };

    checkSystemStatus();

    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(10, service.responseTime + (Math.random() - 0.5) * 20),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [services]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'down': return 'text-red-600 bg-red-100 border-red-200';
      case 'maintenance': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'down': return <XCircle className="w-5 h-5" />;
      case 'maintenance': return <Clock className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
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
          <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 shadow-lg ${
            overallStatus === 'operational' ? 'bg-gradient-to-br from-green-100 to-green-200' :
            overallStatus === 'degraded' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' :
            'bg-gradient-to-br from-red-100 to-red-200'
          }`}>
            {overallStatus === 'operational' ? <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" /> :
             overallStatus === 'degraded' ? <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" /> :
             <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">System Status</h1>
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-lg ${
            overallStatus === 'operational' ? 'bg-green-100 text-green-700' :
            overallStatus === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getStatusIcon(overallStatus)}
            <span>
              {overallStatus === 'operational' ? 'All Systems Operational' :
               overallStatus === 'degraded' ? 'Some Systems Degraded' :
               'System Issues Detected'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Service Status</h2>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      service.status === 'operational' ? 'bg-green-100' :
                      service.status === 'degraded' ? 'bg-yellow-100' :
                      service.status === 'maintenance' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <service.icon className={`w-5 h-5 ${
                        service.status === 'operational' ? 'text-green-600' :
                        service.status === 'degraded' ? 'text-yellow-600' :
                        service.status === 'maintenance' ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{service.name}</div>
                      <div className="text-sm text-slate-500">Uptime: {service.uptime}%</div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full font-semibold text-sm border ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                    <span>{service.status.charAt(0).toUpperCase() + service.status.slice(1)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Response Time:</span> {Math.round(service.responseTime)}ms
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          service.responseTime < 200 ? 'bg-green-500' :
                          service.responseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((service.responseTime / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Overall Uptime (30 days)</span>
                  <span className="font-semibold text-slate-900">99.96%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.96%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Avg Response Time</span>
                  <span className="font-semibold text-slate-900">165ms</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Status Notifications</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Get notified about system status updates and incidents.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Subscribe to Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
