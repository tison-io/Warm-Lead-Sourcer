'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified?: boolean;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      await checkAuth();
      
      if (mounted) {
        setIsInitialized(true);
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const checkAuth = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://warm-lead-sourcer-2.onrender.com';
      const response = await fetch(`${apiUrl}/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user._id) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshResponse = await fetch(`${apiUrl}/users/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          // Retry auth check after refresh
          const retryResponse = await fetch(`${apiUrl}/users/me`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setUser(retryData.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://warm-lead-sourcer-2.onrender.com';
    
    const response = await fetch(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    if (data.user && data.user._id) {
      setUser(data.user);
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const register = async (data: RegisterData) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://warm-lead-sourcer-2.onrender.com';
    const sanitizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    };
    
    const response = await fetch(`${apiUrl}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const result = await response.json();
    return result;
  };

  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://warm-lead-sourcer-2.onrender.com';
      await fetch(`${apiUrl}/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success('Logged out successfully!');
    } catch {
      // Logout failed on server, but clear local state anyway
      toast.success('Logged out successfully!');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitialized, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
