import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface SignupProps {
  onNavigate: (page: string) => void;
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadharNumber: string;
  panNumber: string;
  occupation: string;
  annualIncome: string;
}

export const Signup = ({ onNavigate }: SignupProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    occupation: '',
    annualIncome: '',
  });

  const updateField = (field: keyof SignupData, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!signupData.email || !signupData.password) {
      setError('Please fill in all fields');
      return false;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!signupData.fullName || !signupData.gender || !signupData.dateOfBirth || !signupData.phoneNumber) {
      setError('Please fill in all fields');
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(signupData.phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    const today = new Date();
    const dob = new Date(signupData.dateOfBirth);
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old to register');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!signupData.address || !signupData.city || !signupData.state || !signupData.pincode) {
      setError('Please fill in all fields');
      return false;
    }
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(signupData.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!signupData.aadharNumber || !signupData.panNumber || !signupData.occupation || !signupData.annualIncome) {
      setError('Please fill in all fields');
      return false;
    }
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(signupData.aadharNumber)) {
      setError('Please enter a valid 12-digit Aadhar number');
      return false;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(signupData.panNumber.toUpperCase())) {
      setError('Please enter a valid PAN number (e.g., ABCDE1234F)');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep4()) {
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: signupData.fullName,
            gender: signupData.gender,
            date_of_birth: signupData.dateOfBirth,
            phone_number: signupData.phoneNumber,
            address: signupData.address,
            city: signupData.city,
            state: signupData.state,
            pincode: signupData.pincode,
            aadhar_number: signupData.aadharNumber,
            pan_number: signupData.panNumber.toUpperCase(),
            occupation: signupData.occupation,
            annual_income: signupData.annualIncome,
            kyc_verified: false,
          },
        ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: data.user.id,
            theme: 'light',
            auto_pay_enabled: false,
          },
        ]);

      if (settingsError) {
        setError(settingsError.message);
        setLoading(false);
        return;
      }

      onNavigate('home');
    }
  };

  const steps = [
    { number: 1, title: 'Account', completed: currentStep > 1 },
    { number: 2, title: 'Personal', completed: currentStep > 2 },
    { number: 3, title: 'Address', completed: currentStep > 3 },
    { number: 4, title: 'KYC', completed: currentStep > 4 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-black py-8 px-4">
      <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-xl w-full max-w-2xl border dark:border-slate-700">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-600 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-black">Create Account</h1>
        <p className="text-center text-slate-600 dark:text-black mb-8">Complete all steps to register</p>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    step.completed
                      ? 'bg-green-600 text-white'
                      : currentStep === step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-black'
                  }`}
                >
                  {step.completed ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span className="text-xs mt-1 text-slate-600 dark:text-black font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition ${
                    step.completed ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-black text-sm">
            {error}
          </div>
        )}

        <form onSubmit={currentStep === 4 ? handleSignup : (e) => { e.preventDefault(); nextStep(); }}>
          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-black mb-4">Account Information</h2>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Password * (minimum 6 characters)
                </label>
                <input
                  id="password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-black mb-4">Personal Information</h2>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Full Name (as per Aadhar) *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  value={signupData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={signupData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Mobile Number *
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={signupData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  required
                  pattern="[6-9][0-9]{9}"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="9876543210"
                />
                <p className="text-xs text-slate-500 dark:text-black mt-1">Enter 10-digit mobile number</p>
              </div>
            </div>
          )}

          {/* Step 3: Address Details */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-black mb-4">Address Information</h2>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Residential Address *
                </label>
                <textarea
                  id="address"
                  value={signupData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="House No., Street, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={signupData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                    State *
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={signupData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Pincode *
                </label>
                <input
                  id="pincode"
                  type="text"
                  value={signupData.pincode}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  required
                  pattern="\d{6}"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="400001"
                />
                <p className="text-xs text-slate-500 dark:text-black mt-1">Enter 6-digit pincode</p>
              </div>
            </div>
          )}

          {/* Step 4: KYC Details */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-black mb-4">KYC Information</h2>

              <div>
                <label htmlFor="aadharNumber" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Aadhar Number *
                </label>
                <input
                  id="aadharNumber"
                  type="text"
                  value={signupData.aadharNumber}
                  onChange={(e) => updateField('aadharNumber', e.target.value.replace(/\D/g, ''))}
                  required
                  pattern="\d{12}"
                  maxLength={12}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="123456789012"
                />
                <p className="text-xs text-slate-500 dark:text-black mt-1">Enter 12-digit Aadhar number</p>
              </div>

              <div>
                <label htmlFor="panNumber" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  PAN Number *
                </label>
                <input
                  id="panNumber"
                  type="text"
                  value={signupData.panNumber}
                  onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                  required
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  maxLength={10}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition uppercase"
                  placeholder="ABCDE1234F"
                />
                <p className="text-xs text-slate-500 dark:text-black mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Occupation *
                </label>
                <select
                  id="occupation"
                  value={signupData.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select Occupation</option>
                  <option value="salaried">Salaried Employee</option>
                  <option value="self-employed">Self Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="professional">Professional</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="annualIncome" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                  Annual Income *
                </label>
                <select
                  id="annualIncome"
                  value={signupData.annualIncome}
                  onChange={(e) => updateField('annualIncome', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select Income Range</option>
                  <option value="below-2.5">Below ₹2.5 Lakh</option>
                  <option value="2.5-5">₹2.5 - 5 Lakh</option>
                  <option value="5-10">₹5 - 10 Lakh</option>
                  <option value="10-20">₹10 - 20 Lakh</option>
                  <option value="20-50">₹20 - 50 Lakh</option>
                  <option value="above-50">Above ₹50 Lakh</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-black">
                  <strong>Note:</strong> Your Aadhar and PAN details are securely stored and will be used only for tax calculations and verification purposes. This information is protected and confidential.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-black rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="submit"
                className="flex items-center gap-2 ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-slate-600 dark:text-black">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
