import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, LoginRequest, SignupRequest } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  signup: (userData: SignupRequest) => Promise<User>;
  logout: () => void;
  isAdmin: () => boolean | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The useAuth hook is exported alongside the provider component because they are tightly coupled
// and meant to be used together. This is the standard pattern for React context hooks.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface JWTPayload {
  sub: string;
  userId: number;
  role: string;
  exp: number;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  //const [user, setUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      localStorage.setItem('token', response.token);
      //Convert response to User type
      const user: User = {
        type: response.type,
        username: response.username,
        email: response.email,
        roles: response.roles,
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupRequest) => {
    setLoading(true);
    try {
      const response = await authService.signup(userData);
      console.log('Signup response:', response);
      localStorage.setItem('token', response.token);
      //Convert response to User type
      const user: User = {
        type: response.type,
        username: response.username,
        email: response.email,
        roles: response.roles,
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.roles.includes('ADMIN');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
