import React, { useState, useEffect } from 'react';
import { Save, User, Building, Bell, Database, Shield, CheckCircle, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES } from '../utils/currency';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Settings: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    updateBusiness, 
    updatePreferences, 
    logout, 
    error: authError, 
    clearError 
  } = useAuth();
  const { currency, updateCurrency } = useCurrency();

  // Local state for form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: 'retail' as const,
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    taxId: '',
    website: '',
    currency: 'LKR',
    timezone: ''
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light' as 'light' | 'dark' | 'auto',
    notifications: {
      email: true,
      push: true,
      lowStock: true,
      reports: false
    },
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US'
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupLocation: 'C:/Backups/SpiceTrack',
    lastBackup: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30
  });

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, success: false, message: '' });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.profile.name,
        email: user.profile.email,
        password: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      setBusinessData({
        businessName: user.business.businessName,
        businessType: user.business.businessType,
        businessAddress: user.business.businessAddress,
        businessPhone: user.business.businessPhone,
        businessEmail: user.business.businessEmail || '',
        taxId: user.business.taxId || '',
        website: user.business.website || '',
        currency: user.business.currency,
        timezone: user.business.timezone
      });

      setPreferences(user.preferences);
    }
  }, [user]);

  // Available options
  const businessTypes = [
    { value: 'spice', label: 'Spice Store' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'other', label: 'Other' }
  ];

  const timezones = [
    'Asia/Colombo',
    'America/New_York',
    'Europe/London',
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' }
  ];

  // Validation
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) ? null : 'Please enter a valid email address';
  };

  const validatePassword = (password: string): string | null => {
    if (password.length === 0) return null; // Optional field
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

  // Handle input changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setIsFormDirty(true);
    
    // Clear error
    if (errors[`profile.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`profile.${field}`];
        return newErrors;
      });
    }
  };

  const handleBusinessChange = (field: string, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
    setIsFormDirty(true);
    
    // Update currency in the currency context if changed
    if (field === 'currency') {
      updateCurrency(value);
    }
    
    // Clear error
    if (errors[`business.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`business.${field}`];
        return newErrors;
      });
    }
  };

  const handlePreferencesChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPreferences(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setPreferences(prev => ({ ...prev, [field]: value }));
    }
    setIsFormDirty(true);
  };

  // Save functions
  const saveProfile = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.name.trim()) newErrors['profile.name'] = 'Name is required';
    
    const emailError = validateEmail(profileData.email);
    if (emailError) newErrors['profile.email'] = emailError;
    
    if (profileData.newPassword) {
      const passwordError = validatePassword(profileData.newPassword);
      if (passwordError) newErrors['profile.newPassword'] = passwordError;
      
      if (profileData.newPassword !== profileData.confirmNewPassword) {
        newErrors['profile.confirmNewPassword'] = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return false;

    const updateData: any = {
      name: profileData.name,
      email: profileData.email
    };

    if (profileData.newPassword) {
      updateData.password = profileData.newPassword;
    }

    const success = await updateProfile(updateData);
    if (success) {
      setProfileData(prev => ({ ...prev, newPassword: '', confirmNewPassword: '' }));
    }
    return success;
  };

  const saveBusiness = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!businessData.businessName.trim()) newErrors['business.businessName'] = 'Business name is required';
    if (!businessData.businessAddress.trim()) newErrors['business.businessAddress'] = 'Business address is required';
    
    const phoneError = validatePhone(businessData.businessPhone);
    if (phoneError) newErrors['business.businessPhone'] = phoneError;

    if (businessData.businessEmail) {
      const emailError = validateEmail(businessData.businessEmail);
      if (emailError) newErrors['business.businessEmail'] = emailError;
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return false;

    return await updateBusiness(businessData);
  };

  const savePreferences = async () => {
    return await updatePreferences(preferences);
  };

  const saveSection = async (section: string) => {
    setActiveSection(section);
    clearError();
    
    let success = false;
    let message = '';

    try {
      switch (section) {
        case 'profile':
          success = await saveProfile();
          message = success ? 'Profile updated successfully' : 'Failed to update profile';
          break;
        case 'business':
          success = await saveBusiness();
          message = success ? 'Business information updated successfully' : 'Failed to update business information';
          break;
        case 'preferences':
          success = await savePreferences();
          message = success ? 'Preferences updated successfully' : 'Failed to update preferences';
          break;
        default:
          success = false;
          message = 'Unknown section';
      }
    } catch (error) {
      success = false;
      message = 'An error occurred while saving';
    }

    setSaveStatus({ show: true, success, message });
    if (success) setIsFormDirty(false);
    
    setTimeout(() => {
      setSaveStatus({ show: false, success: false, message: '' });
      setActiveSection(null);
    }, 3000);
  };

  const saveAllSettings = async () => {
    const profileSuccess = await saveProfile();
    const businessSuccess = await saveBusiness();
    const preferencesSuccess = await savePreferences();
    
    const allSuccess = profileSuccess && businessSuccess && preferencesSuccess;
    
    setSaveStatus({ 
      show: true, 
      success: allSuccess, 
      message: allSuccess ? 'All settings saved successfully' : 'Some settings failed to save. Please check for errors.' 
    });
    
    if (allSuccess) setIsFormDirty(false);
    
    setTimeout(() => {
      setSaveStatus({ show: false, success: false, message: '' });
    }, 3000);
  };

  const handleImportData = () => {
    alert('Import functionality would open a file picker dialog');
  };

  const handleExportData = () => {
    alert('Export functionality would generate and download data file');
  };

  const handleBackup = () => {
    setBackupSettings(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
    alert('Manual backup completed successfully');
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center gap-4">
          {saveStatus.show && (
            <div className={`flex items-center ${saveStatus.success ? 'text-green-600' : 'text-red-600'}`}>
              {saveStatus.success ? (
                <>
                  <CheckCircle size={16} className="mr-1" />
                  <span>{saveStatus.message}</span>
                </>
              ) : (
                <span>{saveStatus.message}</span>
              )}
            </div>
          )}
          {authError && (
            <div className="text-red-600 text-sm">
              {authError}
            </div>
          )}
          <Button 
            variant="primary" 
            icon={<Save size={16} />} 
            onClick={saveAllSettings}
            disabled={!isFormDirty}
          >
            Save All Changes
          </Button>
          <Button 
            variant="outline" 
            icon={<LogOut size={16} />} 
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* User Profile Section */}
        <Card 
          title="User Profile"
          icon={<User size={20} className="text-blue-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-blue-600" />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700">
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.profile.name}</h3>
                <p className="text-sm text-gray-500">{user.profile.email}</p>
                <p className="text-xs text-gray-400">Role: {user.profile.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['profile.name'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors['profile.name'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['profile.name']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['profile.email'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors['profile.email'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['profile.email']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                <input
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['profile.newPassword'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Leave blank to keep current password"
                />
                {errors['profile.newPassword'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['profile.newPassword']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  value={profileData.confirmNewPassword}
                  onChange={(e) => handleProfileChange('confirmNewPassword', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['profile.confirmNewPassword'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Confirm new password"
                />
                {errors['profile.confirmNewPassword'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['profile.confirmNewPassword']}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                variant="primary" 
                onClick={() => saveSection('profile')}
                disabled={activeSection === 'profile'}
              >
                Save Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Business Information Section */}
        <Card 
          title="Business Information"
          icon={<Building size={20} className="text-green-500" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  value={businessData.businessName}
                  onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['business.businessName'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors['business.businessName'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['business.businessName']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                <select
                  value={businessData.businessType}
                  onChange={(e) => handleBusinessChange('businessType', e.target.value)}
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
                  value={businessData.currency}
                  onChange={(e) => handleBusinessChange('currency', e.target.value)}
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
                  value={businessData.businessAddress}
                  onChange={(e) => handleBusinessChange('businessAddress', e.target.value)}
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['business.businessAddress'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors['business.businessAddress'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['business.businessAddress']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                <input
                  type="tel"
                  value={businessData.businessPhone}
                  onChange={(e) => handleBusinessChange('businessPhone', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['business.businessPhone'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors['business.businessPhone'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['business.businessPhone']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Email</label>
                <input
                  type="email"
                  value={businessData.businessEmail}
                  onChange={(e) => handleBusinessChange('businessEmail', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                    errors['business.businessEmail'] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors['business.businessEmail'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['business.businessEmail']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                <input
                  type="text"
                  value={businessData.taxId}
                  onChange={(e) => handleBusinessChange('taxId', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  value={businessData.website}
                  onChange={(e) => handleBusinessChange('website', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={businessData.timezone}
                  onChange={(e) => handleBusinessChange('timezone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                variant="primary" 
                onClick={() => saveSection('business')}
                disabled={activeSection === 'business'}
              >
                Save Business Info
              </Button>
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card 
          title="Preferences"
          icon={<Bell size={20} className="text-amber-500" />}
        >
          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Receive alerts via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={(e) => handlePreferencesChange('notifications.email', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Receive browser notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={(e) => handlePreferencesChange('notifications.push', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Low Stock Alerts</label>
                    <p className="text-xs text-gray-500">Get notified when stock is low</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.lowStock}
                    onChange={(e) => handlePreferencesChange('notifications.lowStock', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Report Notifications</label>
                    <p className="text-xs text-gray-500">Receive automated reports</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.reports}
                    onChange={(e) => handlePreferencesChange('notifications.reports', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Display Preferences */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Display</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => handlePreferencesChange('theme', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {themes.map(theme => (
                      <option key={theme.value} value={theme.value}>{theme.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferencesChange('language', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="en">English</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => handlePreferencesChange('dateFormat', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {dateFormats.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Number Format</label>
                  <select
                    value={preferences.numberFormat}
                    onChange={(e) => handlePreferencesChange('numberFormat', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="en-US">1,234.56 (US)</option>
                    <option value="en-GB">1,234.56 (UK)</option>
                    <option value="de-DE">1.234,56 (German)</option>
                    <option value="fr-FR">1 234,56 (French)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                variant="primary" 
                onClick={() => saveSection('preferences')}
                disabled={activeSection === 'preferences'}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Management Section */}
        <Card 
          title="Data Management"
          icon={<Database size={20} className="text-purple-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Backup</label>
                <p className="text-xs text-gray-500">Automatically backup data daily</p>
              </div>
              <input
                type="checkbox"
                checked={backupSettings.autoBackup}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Backup Location</label>
              <input
                type="text"
                value={backupSettings.backupLocation}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, backupLocation: e.target.value }))}
                disabled={!backupSettings.autoBackup}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>

            {backupSettings.lastBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Backup</label>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(backupSettings.lastBackup).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleBackup}>
                Manual Backup
              </Button>
              <Button variant="outline" onClick={handleImportData}>
                Import Data
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                Export Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Security Section */}
        <Card 
          title="Security"
          icon={<Shield size={20} className="text-red-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 }))}
                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Automatically log out after this period of inactivity</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Account Created</h4>
                  <p className="text-xs text-gray-500">{new Date(user.profile.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Last Login</h4>
                  <p className="text-xs text-gray-500">
                    {user.profile.lastLogin ? new Date(user.profile.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;