import React, { useState } from 'react';
import { Eye, EyeOff, User, Building, Lock, Mail, Phone, Globe, MapPin, Hash } from 'lucide-react';
import { useAuth, RegisterData } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CURRENCIES } from '../utils/currency';

interface AuthPageProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onModeChange }) => {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Registration form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    // Personal Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business Info
    businessName: '',
    businessType: 'retail',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    currency: 'LKR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Optional
    taxId: '',
    website: ''
  });

  // Get available timezones
  const timezones = [
    'Asia/Colombo',
    'America/New_York',
    'Europe/London',
    'Asia/Dubai',
    'Asia/Singapore',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'other', label: 'Other' }
  ];

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) ? null : 'Please enter a valid email address';
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s()+-]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 ? null : 'Please enter a valid phone number';
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!registerData.name.trim()) errors.name = 'Name is required';
    
    const emailError = validateEmail(registerData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(registerData.password);
    if (passwordError) errors.password = passwordError;
    
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!registerData.businessName.trim()) errors.businessName = 'Business name is required';
    if (!registerData.businessAddress.trim()) errors.businessAddress = 'Business address is required';
    
    const phoneError = validatePhone(registerData.businessPhone);
    if (phoneError) errors.businessPhone = phoneError;

    if (registerData.businessEmail) {
      const emailError = validateEmail(registerData.businessEmail);
      if (emailError) errors.businessEmail = emailError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const errors: Record<string, string> = {};
    if (!loginData.email) errors.email = 'Email is required';
    if (!loginData.password) errors.password = 'Password is required';
    
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const success = await login(loginData);
    if (!success) {
      // Error will be shown from context
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateStep1() || !validateStep2()) return;

    const success = await register(registerData);
    if (!success) {
      // Error will be shown from context
      setCurrentStep(1); // Go back to first step if there's an error
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setValidationErrors({});
  };

  if (mode === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to SpiceTrack
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to manage your inventory
            </p>
          </div>
          
          <Card>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                      validationErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`pl-10 pr-10 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                      validationErrors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onModeChange('register')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up your SpiceTrack account and business information
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Personal Info</span>
          </div>
          <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Business Info</span>
          </div>
        </div>
        
        <Card>
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="mx-auto h-12 w-12 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900 mt-2">Personal Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                      validationErrors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                      validationErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className={`pr-10 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                        validationErrors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className={`pr-10 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                        validationErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-between space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onModeChange('login')}
                    fullWidth
                  >
                    Back to Login
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    fullWidth
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Building className="mx-auto h-12 w-12 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900 mt-2">Business Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                      type="text"
                      value={registerData.businessName}
                      onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                        validationErrors.businessName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Enter your business name"
                    />
                    {validationErrors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <select
                      value={registerData.businessType}
                      onChange={(e) => setRegisterData({ ...registerData, businessType: e.target.value as any })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {businessTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={registerData.currency}
                      onChange={(e) => setRegisterData({ ...registerData, currency: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {Object.entries(CURRENCIES).map(([code, config]) => (
                        <option key={code} value={code}>
                          {config.symbol} {config.name} ({code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Business Address</label>
                    <textarea
                      value={registerData.businessAddress}
                      onChange={(e) => setRegisterData({ ...registerData, businessAddress: e.target.value })}
                      rows={3}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                        validationErrors.businessAddress ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Enter your business address"
                    />
                    {validationErrors.businessAddress && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.businessAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={registerData.businessPhone}
                        onChange={(e) => setRegisterData({ ...registerData, businessPhone: e.target.value })}
                        className={`pl-10 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                          validationErrors.businessPhone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {validationErrors.businessPhone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.businessPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Email (Optional)</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={registerData.businessEmail}
                        onChange={(e) => setRegisterData({ ...registerData, businessEmail: e.target.value })}
                        className={`pl-10 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                          validationErrors.businessEmail ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="business@example.com"
                      />
                    </div>
                    {validationErrors.businessEmail && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.businessEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe size={16} className="text-gray-400" />
                      </div>
                      <select
                        value={registerData.timezone}
                        onChange={(e) => setRegisterData({ ...registerData, timezone: e.target.value })}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {timezones.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID (Optional)</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={registerData.taxId}
                        onChange={(e) => setRegisterData({ ...registerData, taxId: e.target.value })}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="123-45-6789"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={registerData.website}
                        onChange={(e) => setRegisterData({ ...registerData, website: e.target.value })}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    fullWidth
                  >
                    Previous Step
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    fullWidth
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;