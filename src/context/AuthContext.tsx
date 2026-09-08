import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  occupation?: string;
  education?: string;
  joinedAt: number;
  emailVerified: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyEmail: (code: string) => { success: boolean; error?: string };
  resendVerificationCode: () => string;
  updateProfile: (updates: Partial<UserProfile>) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  deleteAccount: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const AUTH_USER_KEY = 'ai-hub-auth-user';
const AUTH_PASSWORD_KEY = 'ai-hub-auth-password';
const AUTH_VERIFICATION_KEY = 'ai-hub-auth-verification';
const AUTH_USERS_DB = 'ai-hub-users-db';

// Simulated user database
interface StoredUser {
  uid: string;
  name: string;
  email: string;
  password: string;
  profile: Partial<UserProfile>;
  verified: boolean;
  createdAt: number;
}

function getUsersDB(): StoredUser[] {
  try {
    const stored = localStorage.getItem(AUTH_USERS_DB);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUsersDB(users: StoredUser[]) {
  localStorage.setItem(AUTH_USERS_DB, JSON.stringify(users));
}

function generateUID(): string {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null && user.emailVerified;

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsersDB();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'No account found with this email address.' };
    }

    if (foundUser.password !== password) {
      setIsLoading(false);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const userProfile: UserProfile = {
      uid: foundUser.uid,
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.profile.avatar,
      bio: foundUser.profile.bio,
      phone: foundUser.profile.phone,
      location: foundUser.profile.location,
      occupation: foundUser.profile.occupation,
      education: foundUser.profile.education,
      joinedAt: foundUser.createdAt,
      emailVerified: foundUser.verified,
    };

    setUser(userProfile);
    setIsLoading(false);
    return { success: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = getUsersDB();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists.' };
    }

    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const uid = generateUID();
    const verificationCode = generateVerificationCode();

    const newUser: StoredUser = {
      uid,
      name,
      email,
      password,
      profile: {},
      verified: false,
      createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsersDB(users);

    // Store verification code
    localStorage.setItem(AUTH_VERIFICATION_KEY, JSON.stringify({
      uid,
      email,
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    }));

    // Create unverified user session
    const userProfile: UserProfile = {
      uid,
      name,
      email,
      joinedAt: Date.now(),
      emailVerified: false,
    };
    setUser(userProfile);
    setIsLoading(false);
    return { success: true };
  }, []);

  const verifyEmail = useCallback((code: string) => {
    const stored = localStorage.getItem(AUTH_VERIFICATION_KEY);
    if (!stored) {
      return { success: false, error: 'No verification session found. Please sign up again.' };
    }

    const verification = JSON.parse(stored);

    if (Date.now() > verification.expiresAt) {
      return { success: false, error: 'Verification code expired. Please request a new one.' };
    }

    if (verification.code !== code) {
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    // Mark user as verified in DB
    const users = getUsersDB();
    const userIndex = users.findIndex(u => u.uid === verification.uid);
    if (userIndex !== -1) {
      users[userIndex].verified = true;
      saveUsersDB(users);
    }

    // Update current user
    setUser(prev => prev ? { ...prev, emailVerified: true } : null);
    localStorage.removeItem(AUTH_VERIFICATION_KEY);

    return { success: true };
  }, []);

  const resendVerificationCode = useCallback((): string => {
    const code = generateVerificationCode();
    if (user) {
      localStorage.setItem(AUTH_VERIFICATION_KEY, JSON.stringify({
        uid: user.uid,
        email: user.email,
        code,
        expiresAt: Date.now() + 10 * 60 * 1000,
      }));
    }
    return code;
  }, [user]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      
      // Also update in users DB
      const users = getUsersDB();
      const userIndex = users.findIndex(u => u.uid === prev.uid);
      if (userIndex !== -1) {
        users[userIndex].name = updated.name;
        users[userIndex].profile = {
          avatar: updated.avatar,
          bio: updated.bio,
          phone: updated.phone,
          location: updated.location,
          occupation: updated.occupation,
          education: updated.education,
        };
        saveUsersDB(users);
      }
      
      return updated;
    });
  }, []);

  const changePassword = useCallback((currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const users = getUsersDB();
    const userIndex = users.findIndex(u => u.uid === user.uid);
    if (userIndex === -1) return { success: false, error: 'User not found' };
    
    if (users[userIndex].password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }
    
    users[userIndex].password = newPassword;
    saveUsersDB(users);
    return { success: true };
  }, [user]);

  const deleteAccount = useCallback(() => {
    if (!user) return;
    const users = getUsersDB().filter(u => u.uid !== user.uid);
    saveUsersDB(users);
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_PASSWORD_KEY);
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsersDB();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'No account found with this email address.' };
    }
    
    // In a real app, this would send an email
    // For demo, we store a reset code
    const resetCode = generateVerificationCode();
    localStorage.setItem('ai-hub-reset-code', JSON.stringify({
      uid: foundUser.uid,
      email,
      code: resetCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    }));
    
    setIsLoading(false);
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      verifyEmail,
      resendVerificationCode,
      updateProfile,
      changePassword,
      deleteAccount,
      forgotPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// Helper to get the current verification code (for demo purposes)
export function getVerificationCode(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_VERIFICATION_KEY);
    if (!stored) return null;
    const verification = JSON.parse(stored);
    return verification.code;
  } catch {
    return null;
  }
}
