
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRole, User } from '../types';
import { loginUser } from '../services/databaseService';

// Fix: Define and use the standard AIStudio interface to match institutional requirements and avoid declaration conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Ensuring the property name and type match exactly with the globally expected definition
    aistudio: AIStudio;
  }
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      alert('Please enter both username and password');
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      // Check for API key as per institutional requirement for AI features
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await window.aistudio.openSelectKey();
          }
        } catch (apiError) {
          console.warn("API key check failed, continuing with login", apiError);
        }
      }
      
      // Note: We ignore the role setting here and let the backend provide the actual role
      const response = await loginUser({ email, password });
      
      if (response.success && response.user) {
        if (response.user.role !== role) {
          alert(`Login failed: Make sure to select the correct account type (You are registered as ${response.user.role})`);
          setIsAuthenticating(false);
          return;
        }
        onLogin(response.user);
      } else {
        alert(response.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error("Authentication failed", error);
      alert('Login failed. Please try again or check the server connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-primary/20 rotate-3">S</div>
          <h2 className="text-2xl font-black text-gray-900">Academic Portal</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Institutional Prediction System</p>
        </div>

        <form onSubmit={handleLoginProcess} className="space-y-5">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
            {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(UserRole[r])}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === UserRole[r] 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Username / Email</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-medium bg-gray-50/50"
                placeholder="Enter your name or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-medium bg-gray-50/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 border-b-4 border-primary-dark active:border-b-0 active:translate-y-1"
          >
            {isAuthenticating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          First time here? <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400">Secure access via Google Cloud Billing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;