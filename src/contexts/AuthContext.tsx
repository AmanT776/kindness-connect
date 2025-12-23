import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/mockData';
import { login as loginAPI, LoginUser } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, department?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map API user to app User type
const mapApiUserToUser = (apiUser: LoginUser): User => {
  // Map roleName to role
  let role: 'student' | 'officer' | 'admin' = 'student';
  if (apiUser.roleName === 'ADMIN') {
    role = 'admin';
  } else if (apiUser.roleName === 'OFFICER') {
    role = 'officer';
  } else {
    role = 'student';
  }

  return {
    id: String(apiUser.id),
    email: apiUser.email,
    name: apiUser.fullName || `${apiUser.firstName} ${apiUser.lastName}`,
    role,
    department: apiUser.organizationalUnitName || undefined,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for stored token and user on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginAPI({ email, password });
      
      if (response.success && response.data) {
        // Store token
        localStorage.setItem('authToken', response.data.token);
        
        // Map and store user
        const mappedUser = mapApiUserToUser(response.data.user);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, department?: string): Promise<boolean> => {
    // Signup is handled by the Signup page directly, this is kept for compatibility
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
