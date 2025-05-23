import React, { useState } from 'react';
import { Save, User, Building, Bell, Database, Shield, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Define types for better TypeScript support
interface FieldOption {
  value: string;
  label: string;
}

interface Field {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'checkbox' | 'select' | 'button';
  value?: any;
  onChange?: (e: any) => void;
  error?: string;
  description?: string;
  options?: FieldOption[];
  buttonLabel?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  min?: number;
  max?: number;
}

interface SettingSection {
  title: string;
  key: string;
  icon: React.ReactNode;
  fields: Field[];
}

const Settings: React.FC = () => {
  // Initial settings data structure
  const initialSettings = {
    userProfile: {
      name: 'Ihsan',
      email: 'admin@msanan7@gmail.com',
      password: '********',
    },
    businessInfo: {
      businessName: 'Spice Trading Co.',
      businessAddress: 'Akurana',
      businessPhone: '077 5925383',
    },
    notifications: {
      emailNotifications: true,
      lowStockThreshold: 'custom',
    },
    dataManagement: {
      autoBackup: true,
      backupLocation: 'C:/Backups/SpiceTrack',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    }
  };

  // State for settings and validation
  const [settings, setSettings] = useState(initialSettings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, success: false });

  // Handle input changes
  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section as keyof typeof prevSettings],
        [field]: value
      }
    }));
    setIsFormDirty(true);
    
    // Clear error when field is changed
    if (errors[`${section}.${field}`]) {
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.userProfile.email)) {
      newErrors['userProfile.email'] = 'Please enter a valid email address';
    }
    
    // Validate business name
    if (!settings.businessInfo.businessName.trim()) {
      newErrors['businessInfo.businessName'] = 'Business name cannot be empty';
    }
    
    // Validate phone number format (simple validation)
    const phoneRegex = /^[\d\s()+-]{10,15}$/;
    if (!phoneRegex.test(settings.businessInfo.businessPhone)) {
      newErrors['businessInfo.businessPhone'] = 'Please enter a valid phone number';
    }
    
    // Validate backup location if auto backup is enabled
    if (settings.dataManagement.autoBackup && !settings.dataManagement.backupLocation.trim()) {
      newErrors['dataManagement.backupLocation'] = 'Backup location cannot be empty when auto backup is enabled';
    }
    
    // Validate session timeout range
    if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 120) {
      newErrors['security.sessionTimeout'] = 'Session timeout must be between 5 and 120 minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      // Here you would typically make an API call to save the settings
      console.log('Saving settings:', settings);
      
      // Simulate API call
      setTimeout(() => {
        setSaveStatus({ show: true, success: true });
        setIsFormDirty(false);
        
        // Auto hide success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ show: false, success: true });
        }, 3000);
      }, 800);
    } else {
      setSaveStatus({ show: true, success: false });
      
      // Auto hide error message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ show: false, success: false });
      }, 3000);
    }
  };

  // Handle import/export actions
  const handleImportData = () => {
    // Simulate file picker dialog
    alert('Import functionality would open a file picker dialog');
    // In a real implementation, you would open a file picker and process the selected file
  };

  const handleExportData = () => {
    // Simulate export process
    alert('Export functionality would generate and download data file');
    // In a real implementation, you would generate and download data
  };

  const settingSections: SettingSection[] = [
    {
      title: 'User Profile',
      key: 'userProfile',
      icon: <User size={20} className="text-blue-500" />,
      fields: [
        { 
          key: 'name',
          label: 'Name', 
          type: 'text',
          value: settings.userProfile.name,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('userProfile', 'name', e.target.value)
        },
        { 
          key: 'email',
          label: 'Email', 
          type: 'email',
          value: settings.userProfile.email,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('userProfile', 'email', e.target.value),
          error: errors['userProfile.email']
        },
        { 
          key: 'password',
          label: 'Password', 
          type: 'password',
          value: settings.userProfile.password,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('userProfile', 'password', e.target.value)
        },
      ],
    },
    {
      title: 'Business Information',
      key: 'businessInfo',
      icon: <Building size={20} className="text-green-500" />,
      fields: [
        { 
          key: 'businessName',
          label: 'Business Name', 
          type: 'text',
          value: settings.businessInfo.businessName,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('businessInfo', 'businessName', e.target.value),
          error: errors['businessInfo.businessName']
        },
        { 
          key: 'businessAddress',
          label: 'Business Address', 
          type: 'text',
          value: settings.businessInfo.businessAddress,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('businessInfo', 'businessAddress', e.target.value)
        },
        { 
          key: 'businessPhone',
          label: 'Business Phone', 
          type: 'tel',
          value: settings.businessInfo.businessPhone,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('businessInfo', 'businessPhone', e.target.value),
          error: errors['businessInfo.businessPhone']
        },
      ],
    },
    {
      title: 'Notifications',
      key: 'notifications',
      icon: <Bell size={20} className="text-amber-500" />,
      fields: [
        { 
          key: 'emailNotifications',
          label: 'Email Notifications', 
          type: 'checkbox', 
          value: settings.notifications.emailNotifications,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('notifications', 'emailNotifications', e.target.checked),
          description: 'Receive email alerts for low stock and other important events'
        },
        { 
          key: 'lowStockThreshold',
          label: 'Low Stock Threshold', 
          type: 'select', 
          value: settings.notifications.lowStockThreshold,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('notifications', 'lowStockThreshold', e.target.value),
          options: [
            { value: 'strict', label: 'Strict (Exactly at min level)' },
            { value: 'moderate', label: 'Moderate (10% below min level)' },
            { value: 'relaxed', label: 'Relaxed (25% below min level)' },
            { value: 'custom', label: 'Custom' },
          ],
          description: 'When to trigger low stock alerts'
        },
      ],
    },
    {
      title: 'Data Management',
      key: 'dataManagement',
      icon: <Database size={20} className="text-purple-500" />,
      fields: [
        { 
          key: 'autoBackup',
          label: 'Auto Backup', 
          type: 'checkbox', 
          value: settings.dataManagement.autoBackup,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dataManagement', 'autoBackup', e.target.checked),
          description: 'Automatically back up data daily'
        },
        { 
          key: 'backupLocation',
          label: 'Backup Location', 
          type: 'text', 
          value: settings.dataManagement.backupLocation,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dataManagement', 'backupLocation', e.target.value),
          disabled: !settings.dataManagement.autoBackup,
          error: errors['dataManagement.backupLocation']
        },
        { 
          key: 'importData',
          label: 'Import Data', 
          type: 'button', 
          buttonLabel: 'Import',
          onClick: handleImportData,
          variant: 'outline'
        },
        { 
          key: 'exportData',
          label: 'Export Data', 
          type: 'button', 
          buttonLabel: 'Export',
          onClick: handleExportData,
          variant: 'outline'
        },
      ],
    },
    {
      title: 'Security',
      key: 'security',
      icon: <Shield size={20} className="text-red-500" />,
      fields: [
        { 
          key: 'twoFactorAuth',
          label: 'Enable Two-Factor Authentication', 
          type: 'checkbox', 
          value: settings.security.twoFactorAuth,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('security', 'twoFactorAuth', e.target.checked),
          description: 'Add an extra layer of security to your account'
        },
        { 
          key: 'sessionTimeout',
          label: 'Session Timeout (minutes)', 
          type: 'number', 
          value: settings.security.sessionTimeout,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value, 10) || 30),
          min: 5,
          max: 120,
          error: errors['security.sessionTimeout']
        },
      ],
    },
  ];

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
                  <span>Settings saved successfully</span>
                </>
              ) : (
                <>
                  <span className="text-red-600">Please fix the errors</span>
                </>
              )}
            </div>
          )}
          <Button 
            variant="primary" 
            icon={<Save size={16} />} 
            onClick={handleSave}
            disabled={!isFormDirty}
          >
            Save All Changes
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {settingSections.map((section) => (
          <Card 
            key={section.key} 
            title={section.title}
            icon={section.icon}
          >
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <div className="md:col-span-2">
                    {field.type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {field.description && (
                          <span className="ml-2 text-sm text-gray-500">{field.description}</span>
                        )}
                      </div>
                    ) : field.type === 'select' ? (
                      <div>
                        <select
                          value={field.value}
                          onChange={field.onChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {field.description && (
                          <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                        )}
                      </div>
                    ) : field.type === 'button' ? (
                      <Button
                        variant={field.variant || 'primary'}
                        size="sm"
                        onClick={field.onClick}
                      >
                        {field.buttonLabel}
                      </Button>
                    ) : (
                      <div>
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={field.onChange}
                          min={field.min}
                          max={field.max}
                          disabled={field.disabled}
                          className={`block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${
                            field.error 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        {field.error ? (
                          <p className="mt-1 text-sm text-red-600">{field.error}</p>
                        ) : field.description ? (
                          <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;