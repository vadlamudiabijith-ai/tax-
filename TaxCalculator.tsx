import { useState } from 'react';
import { ArrowLeft, Calculator, DollarSign, Percent, Info } from 'lucide-react';

interface TaxCalculatorProps {
  onNavigate: (page: string) => void;
}

export const TaxCalculator = ({ onNavigate }: TaxCalculatorProps) => {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [taxType, setTaxType] = useState<'income' | 'property' | 'vehicle'>('income');
  const [result, setResult] = useState<{
    taxableIncome: number;
    taxAmount: number;
    effectiveRate: number;
  } | null>(null);

  const calculateTax = () => {
    const incomeAmount = parseFloat(income) || 0;
    const deductionAmount = parseFloat(deductions) || 0;
    const taxableIncome = Math.max(0, incomeAmount - deductionAmount);

    let taxAmount = 0;

    if (taxType === 'income') {
      // Progressive tax brackets
      if (taxableIncome <= 10000) {
        taxAmount = 0;
      } else if (taxableIncome <= 50000) {
        taxAmount = (taxableIncome - 10000) * 0.10;
      } else if (taxableIncome <= 100000) {
        taxAmount = 4000 + (taxableIncome - 50000) * 0.20;
      } else {
        taxAmount = 14000 + (taxableIncome - 100000) * 0.30;
      }
    } else if (taxType === 'property') {
      // Property tax (1.5% of value)
      taxAmount = taxableIncome * 0.015;
    } else if (taxType === 'vehicle') {
      // Vehicle tax (2% of value)
      taxAmount = taxableIncome * 0.02;
    }

    const effectiveRate = taxableIncome > 0 ? (taxAmount / taxableIncome) * 100 : 0;

    setResult({
      taxableIncome,
      taxAmount,
      effectiveRate,
    });
  };

  const taxBrackets = [
    { range: '$0 - $10,000', rate: '0%', description: 'No tax' },
    { range: '$10,001 - $50,000', rate: '10%', description: 'On amount above $10,000' },
    { range: '$50,001 - $100,000', rate: '20%', description: 'On amount above $50,000' },
    { range: '$100,001+', rate: '30%', description: 'On amount above $100,000' },
  ];

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
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-violet-100 to-violet-200 p-4 rounded-full mb-4 shadow-lg">
            <Calculator className="w-12 h-12 text-violet-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Tax Calculator</h1>
          <p className="text-xl text-slate-600">Estimate your tax liability quickly and accurately</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Calculate Your Tax</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Tax Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTaxType('income')}
                      className={`p-4 rounded-lg border-2 transition ${
                        taxType === 'income'
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-semibold">Income Tax</div>
                    </button>
                    <button
                      onClick={() => setTaxType('property')}
                      className={`p-4 rounded-lg border-2 transition ${
                        taxType === 'property'
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-semibold">Property Tax</div>
                    </button>
                    <button
                      onClick={() => setTaxType('vehicle')}
                      className={`p-4 rounded-lg border-2 transition ${
                        taxType === 'vehicle'
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-semibold">Vehicle Tax</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="income" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {taxType === 'income' ? 'Annual Income' : taxType === 'property' ? 'Property Value' : 'Vehicle Value'} ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                    <input
                      id="income"
                      type="number"
                      step="0.01"
                      min="0"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {taxType === 'income' && (
                  <div>
                    <label htmlFor="deductions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Total Deductions ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                      <input
                        id="deductions"
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions}
                        onChange={(e) => setDeductions(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Standard deduction, exemptions, and other qualifying deductions
                    </p>
                  </div>
                )}

                <button
                  onClick={calculateTax}
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white py-4 rounded-lg font-semibold hover:from-violet-700 hover:to-violet-800 transition shadow-lg text-lg"
                >
                  Calculate Tax
                </button>
              </div>

              {result && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Calculation Results</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-700 mb-2">Taxable Amount</div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        ${result.taxableIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-xl border border-violet-200">
                      <div className="text-sm text-violet-700 mb-2">Tax Amount</div>
                      <div className="text-2xl font-bold text-violet-900">
                        ${result.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 mb-2">Effective Rate</div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {result.effectiveRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white mb-2">Important Notes</div>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>• This is an estimate and may not reflect your actual tax liability</li>
                          <li>• Actual calculations may include additional credits or surcharges</li>
                          <li>• Consult a tax professional for accurate tax planning</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('tax-payment')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Income Tax Brackets</h3>
              <div className="space-y-3">
                {taxBrackets.map((bracket, index) => (
                  <div key={index} className="border-l-4 border-violet-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900">{bracket.range}</span>
                      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-sm font-semibold">
                        {bracket.rate}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">{bracket.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Other Tax Rates</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Property Tax</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Vehicle Tax</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Business Tax</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Varies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
