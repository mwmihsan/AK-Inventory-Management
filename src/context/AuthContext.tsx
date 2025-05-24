import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User profile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
  lastLogin?: string;
}

// Business information interface
export interface BusinessInfo {
  businessName: string;
  businessType: 'restaurant' | 'grocery' | 'wholesale' | 'retail' | 'other';
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  taxId?: string;
  website?: string;
  currency: string;
  timezone: string;
}

// Complete user data
export interface UserData {
  profile: UserProfile;
  business: BusinessInfo;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      lowStock: boolean;
      reports: boolean;
    };
    dateFormat: string;
    numberFormat: string;
  };
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  updateBusiness: (business: Partial<BusinessInfo>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserData['preferences']>) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  // Personal Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Business Info
  businessName: string;
  businessType: BusinessInfo['businessType'];
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  currency: string;
  timezone: string;
  
  // Optional
  taxId?: string;
  website?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Safe storage operations
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${error}`);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage: ${error}`);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${error}`);
      return false;
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on app start
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const savedUser = safeStorage.getItem('user');
        const authToken = safeStorage.getItem('authToken');
        
        if (savedUser && authToken) {
          const userData = JSON.parse(savedUser);
          // Update last login
          userData.profile.lastLogin = new Date().toISOString();
          setUser(userData);
          safeStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        setError('Failed to restore your session. Please sign in again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const clearError = () => setError(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get stored users (for demo purposes)
      const storedUsers = safeStorage.getItem('registeredUsers');
      const users: UserData[] = storedUsers ? JSON.parse(storedUsers) : [];

      // Find user by email
      const foundUser = users.find(u => u.profile.email === credentials.email);

      if (!foundUser) {
        setError('User not found. Please check your email or register.');
        return false;
      }

      // Check password (in real app, this would be hashed)
      if (foundUser.profile.password !== credentials.password) {
        setError('Invalid password. Please try again.');
        return false;
      }

      // Update last login
      foundUser.profile.lastLogin = new Date().toISOString();

      // Set user data
      setUser(foundUser);

      // Save to localStorage
      safeStorage.setItem('user', JSON.stringify(foundUser));
      safeStorage.setItem('authToken', 'demo-auth-token-' + Date.now());

      if (credentials.rememberMe) {
        safeStorage.setItem('rememberUser', 'true');
      }

      return true;
    } catch (error) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (registerData.password !== registerData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get existing users
      const storedUsers = safeStorage.getItem('registeredUsers');
      const users: UserData[] = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if user already exists
      const existingUser = users.find(u => u.profile.email === registerData.email);
      if (existingUser) {
        setError('An account with this email already exists.');
        return false;
      }

      // Create new user data
      const newUser: UserData = {
        profile: {
          id: crypto.randomUUID(),
          name: registerData.name,
          email: registerData.email,
          password: registerData.password, // In real app, hash this
          role: 'admin', // First user is admin
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        business: {
          businessName: registerData.businessName,
          businessType: registerData.businessType,
          businessAddress: registerData.businessAddress,
          businessPhone: registerData.businessPhone,
          businessEmail: registerData.businessEmail,
          taxId: registerData.taxId,
          website: registerData.website,
          currency: registerData.currency,
          timezone: registerData.timezone
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            lowStock: true,
            reports: false
          },
          dateFormat: 'MM/DD/YYYY',
          numberFormat: 'en-US'
        }
      };

      // Save user to users list
      users.push(newUser);
      safeStorage.setItem('registeredUsers', JSON.stringify(users));

      // Set as current user
      setUser(newUser);
      safeStorage.setItem('user', JSON.stringify(newUser));
      safeStorage.setItem('authToken', 'demo-auth-token-' + Date.now());

      return true;
    } catch (error) {
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem('user');
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('rememberUser');
    setError(null);
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profileUpdates
        }
      };

      setUser(updatedUser);
      safeStorage.setItem('user', JSON.stringify(updatedUser));

      // Update in registered users list
      const storedUsers = safeStorage.getItem('registeredUsers');
      if (storedUsers) {
        const users: UserData[] = JSON.parse(storedUsers);
        const userIndex = users.findIndex(u => u.profile.id === user.profile.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          safeStorage.setItem('registeredUsers', JSON.stringify(users));
        }
      }

      return true;
    } catch (error) {
      setError('Failed to update profile.');
      return false;
    }
  };

  const updateBusiness = async (businessUpdates: Partial<BusinessInfo>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        business: {
          ...user.business,
          ...businessUpdates
        }
      };

      setUser(updatedUser);
      safeStorage.setItem('user', JSON.stringify(updatedUser));

      // Update in registered users list
      const storedUsers = safeStorage.getItem('registeredUsers');
      if (storedUsers) {
        const users: UserData[] = JSON.parse(storedUsers);
        const userIndex = users.findIndex(u => u.profile.id === user.profile.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          safeStorage.setItem('registeredUsers', JSON.stringify(users));
        }
      }

      return true;
    } catch (error) {
      setError('Failed to update business information.');
      return false;
    }
  };

  const updatePreferences = async (preferencesUpdates: Partial<UserData['preferences']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...preferencesUpdates
        }
      };

      setUser(updatedUser);
      safeStorage.setItem('user', JSON.stringify(updatedUser));

      // Update in registered users list
      const storedUsers = safeStorage.getItem('registeredUsers');
      if (storedUsers) {
        const users: UserData[] = JSON.parse(storedUsers);
        const userIndex = users.findIndex(u => u.profile.id === user.profile.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          safeStorage.setItem('registeredUsers', JSON.stringify(users));
        }
      }

      return true;
    } catch (error) {
      setError('Failed to update preferences.');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateBusiness,
    updatePreferences,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};